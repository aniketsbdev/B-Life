const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Transaction = require('../models/transaction');
// const Task = require('./task')

const userTypes = {
    1: "ADMIN",
    2: "LSP",
    3: "INSURER",
    4: "MUW", //Medical Under Writer 
    5: "BROKER",
    6: "SELLER"
}

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First Name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value)
            },
            message: props => 'Not a valid email address'
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        // minlength: 7,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        // required: [true, 'Date of Birth is required'],
        validate: {
            validator: function (value) {
                if (!value) {
                    return false;
                }
                return validator.isBefore(value.toString());
            },
            message: props => 'Age should be greater than 0'
        }
    },
    userType: {
        type: Number,
        required: [true, 'Please provide a user type'],
        default: 6,
        validate: {
            validator: function (value) {
                const userTypeIds = Object.keys(userTypes);
                // console.log(userTypeIds, value, 'validating company type')
                return userTypeIds.includes(value.toString())
            },
            message: props => 'Not a valid user type'
        }
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Company'
    },
    licenseNumber: {
        type: String,
        required: false,
        trim: true
    },
    contactNumber: {
        type: String,
        required: false,
        trim: true
    },
    address1: {
        type: String,
        required: false,
        trim: true
    },
    address2: {
        type: String,
        required: false,
        trim: true
    },
    city: {
        type: String,
        required: false,
        trim: true
    },
    county: {
        type: String,
        required: false,
        trim: true
    },
    zipCode: {
        type: String,
        required: false,
        trim: true
    },
    state: {
        type: String,
        required: false,
        trim: true
    },
    country: {
        type: String,
        required: false,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    kycChecked: {
        type: Boolean,
        default: false
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    avatar: {
        type: Buffer
    },
    kycDocument: {
        type: Buffer
    },
    wallet: {
        type: mongoose.Decimal128,
        default: 0,
        get: v => v ? v.toString() : '0'
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
})

/**
 * Validates unique email
 */
userSchema.path('email').validate(async function (email) {
    const emailCount = await mongoose.models.User.countDocuments({ email })
    console.log(email, emailCount, 'data ....');
    return !emailCount
}, 'Email address already exists');

// userSchema.virtual('tasks', {
//     ref: 'Task',
//     localField: '_id',
//     foreignField: 'owner'
// })

// userSchema.methods.toJSON = function () {
//     const user = this
//     const userObject = user.toObject()

//     delete userObject.password
//     delete userObject.tokens
//     delete userObject.avatar

//     return userObject
// }

userSchema.methods.filterFields = function (fieldsToBeReturned) {
    const user = this
    const userObject = user.toObject()

    Object.keys(userObject).forEach(key => {
        if (!fieldsToBeReturned.includes(key)) {
            delete userObject[key]
        }
    })

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save({ validateBeforeSave: false })

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    console.log('user ....', email, password);
    if (!user) {
        throw { name: 'ValidationError', _message: 'Email Id or Password is incorrect' }
    }

    if ((user.userType === 5 || user.userType === 6) && !user.isActive) {
        throw { name: 'ValidationError', _message: 'Your account is inactive. Please contact administrator' }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw { name: 'ValidationError', _message: 'Email Id or Password is incorrect' }
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
});

userSchema.pre('updateOne', async function (next) {
    const user = await User.findOne(this.getFilter());
    // console.log("erhksjdfhkdjfh", Object.keys(this), user, this._update);
    if (parseInt(user.wallet) !== parseInt(this._update.wallet)) {
        await logTransaction(parseInt(user.wallet), parseInt(this._update.wallet), user.id);
        console.log("current");
    }
    next()
});

async function logTransaction(previousWalletAmount, updatedWalletAmount, id) {
    console.log(previousWalletAmount, updatedWalletAmount);
    try {
        let transactionObj = { transactionDoneBy: id };
        if (previousWalletAmount < updatedWalletAmount) {
            transactionObj.typeOfTransaction = 1;
            transactionObj.amount = updatedWalletAmount - previousWalletAmount;
        }
        if (previousWalletAmount > updatedWalletAmount) {
            transactionObj.typeOfTransaction = 2;
            transactionObj.amount = previousWalletAmount - updatedWalletAmount;
        }

        const transaction = new Transaction(transactionObj);

        await transaction.save();
    } catch (error) {
        // console.log(error, 'error')
    }
}

// Delete user tasks when user is removed
// userSchema.pre('remove', async function (next) {
//     const user = this
//     await Task.deleteMany({ owner: user._id })
//     next()
// })

const User = mongoose.model('User', userSchema)

module.exports = User