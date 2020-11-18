const mongoose = require("mongoose");

const escrowSchema = mongoose.Schema({
    policy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    purchaser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount: {
        type: mongoose.Decimal128,
        required: true,
        get: v => v.toString()
    },
    transferDone: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
});

const Escrow = mongoose.model('Escrow', escrowSchema)

module.exports = Escrow