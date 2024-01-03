const mongoose = require('mongoose')

const cabinSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    size: Number,
    sauna: Boolean,
    beach: Boolean,
    price: {
        type: Number,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    archived: Boolean

}, { timestamps: true })

module.exports = mongoose.model('Cabin', cabinSchema)
