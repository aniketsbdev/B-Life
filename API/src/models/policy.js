const mongoose = require("mongoose");
const validator = require('validator');
const User = require("./user");

const statusTypes = {
    1: "Created",
    2: "Verification Pending",
    3: "Verified",
    4: "Offer Created",
    5: "Rejected",
    6: "Offer Accepted",
    7: "Offer Rejected",
    8: "Transfer Complete",
    // 9: "Transfer Complete"
}

const policySchema = mongoose.Schema({
    policyNumber: {
        type: String,
        required: true,
        trim: true
    },
    faceValue: {
        type: mongoose.Decimal128,
        required: true,
        get: v => v ? v.toString() : ''
    },
    deathBenefit: {
        type: mongoose.Decimal128,
        required: true,
        get: v => v ? v.toString() : ''
    },
    annualPremium: {
        type: mongoose.Decimal128,
        required: true,
        get: v => v ? v.toString() : ''
    },
    cashSurrenderValue: {
        type: mongoose.Decimal128,
        required: true,
        get: v => v ? v.toString() : ''
    },
    policyStartDate: {
        type: Date,
        required: true
    },
    beneficiary: {
        type: String,
        required: false
    },
    policyDocument: {
        type: Buffer,
        // required: [
        //     function() { console.log(this, 'this object'); return this.isPost },
        //     'Policy document is required'
        //   ]
        // required: [true, "Policy document is required"]
    },
    ownerKycDocument: {
        type: Buffer,
        // required: [
        //     function() { console.log(this, 'this object'); return this.isPost },
        //     'Policy document is required'
        //   ]
        // required: [true, "Policy document is required"]
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Company'
    },
    lspCompany: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Company'
    },
    medicalUnderWriterCompany: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Company'
    },
    status: {
        type: Number,
        default: 1
    },
    processedByInsurer: { // False if Insurer has not acted on it
        type: Boolean,
        default: false
    },
    processedByUnderwriter: { // False if MUW has not acted on it
        type: Boolean,
        default: false
    },
    verifiedByInsurer: { // Insurance Company will verify
        type: Boolean,
        default: false
    },
    verifiedByUnderwriter: { // Medical Underwriter will verify
        type: Boolean,
        default: false
    },
    offerAmount: {
        type: mongoose.Decimal128,
        required: false,
        get: v => v ? v.toString() : ''
    },
    rejectionReason: {
        type: String
    },
    isPolicyOwner: {
        type: Boolean,
        required: true,
        default: true
    },
    policyOwnerName: {
        type: String,
        trim: true
    },
    policyOwnerDob: {
        type: Date,
    },
    policyOwnerEmail: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value)
            },
            message: props => 'Not a valid email address'
        },
    },
    lifeExpectancy: {
        type: Number,
        // required: true
    },
    medicalDocument: {
        type: Buffer
    },
    updatedPolicyDocument: {
        type: Buffer
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
});

// policySchema.methods.toJSON = function () {
//     const policy = this
//     const policyObject = policy.toObject()

//     // delete policyObject.policyDocument

//     return policyObject
// }

const Policy = mongoose.model('Policy', policySchema)

module.exports = { Policy, statusTypes };