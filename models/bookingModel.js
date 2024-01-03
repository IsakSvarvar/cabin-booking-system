const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    cabinId: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)
