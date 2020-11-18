const mongoose = require("mongoose");

const typesOfTransaction = {
    1: "Added In Wallet",
    2: "Removed from wallet"
}

const transactionSchema = mongoose.Schema({
    transactionDoneBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    typeOfTransaction: {
        type: Number,
        required: true
    },
    amount: {
        type: mongoose.Decimal128,
        required: true,
        get: v => v.toString()
    },
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
});

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction;