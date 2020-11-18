const mongoose = require("mongoose");
const Transaction = require('../models/transaction');

const companyTypes = {
    1: "Insurance",
    2: "LSP",
    3: "Medical Underwriter"
}
const companySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organisation Name is required'],
        trim: true
    },
    companyType: {
        type: Number,
        required: [true, 'Organisation Type is required'],
        validate: {
            validator: function (value) {
                const companyTypeIds = Object.keys(companyTypes);
                // console.log(companyTypeIds, value, 'validating company type')
                return companyTypeIds.includes(value.toString())
            },
            message: props => 'Not a valid Organisation type'
        }
    },
    licenseNumber: {
        type: String,
        required: [true, 'License Number is required'],
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
    wallet: {
        type: mongoose.Decimal128,
        get: v => v ? v.toString() : '0'
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
});

companySchema.pre('updateOne', async function (next) {
    const company = await Company.findOne(this.getFilter());
    console.log("1111111111111111", this._update);
    if (parseInt(company.wallet) !== parseInt(this._update.wallet)) {
        await logTransaction(parseInt(company.wallet), parseInt(this._update.wallet), this._update.userId, company.id);
        console.log("current");
    }
    next()
});

async function logTransaction(previousWalletAmount, updatedWalletAmount,userId, id) {
    console.log(previousWalletAmount, updatedWalletAmount);
    try {
        let transactionObj = { transactionDoneBy: userId, company: id };
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
        console.log(error, 'error')
    }
}
const Company = mongoose.model('Company', companySchema);


module.exports = Company;
