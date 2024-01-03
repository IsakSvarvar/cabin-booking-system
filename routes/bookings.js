const express = require('express')
const router = express.Router()

const Booking = require('../models/bookingModel')
const authToken = require('../middleware/authToken')

//GET visa alla bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find()
        res.send(bookings)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

//GET visa specifik booking
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id })
        if (!booking) {
            return res.status(404).send({ msg: "Booking not found" })
        }
        res.send(booking)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

//POST skapa ny booking
router.post('/', authToken, async (req, res) => {
    try {
        const newStartDate = req.body.startDate
        const newEndDate = req.body.endDate
        const booking = new Booking({
            startDate: newStartDate,
            endDate: newEndDate,
            cabinId: req.body.cabinId,
            createdBy: req.authUser?.sub
        })

        //Gör en check så att den nya bokningen inte overlappar med en existerande bokning

        //mongoose query: kolla om det finns en existerande booking var datum kolliderar
        const overlap = await Booking.exists({
            cabinId: req.body.cabinId,
            $or: [ //om något av flöjande and-statements är true
                {
                    //startdate faller mellan existerande start & enddates
                    $and: [
                        { startDate: { $lte: newStartDate } },
                        { endDate: { $gte: newStartDate } }
                    ]
                },
                {
                    //enddate faller mellan existerande start & enddates
                    $and: [
                        { startDate: { $lte: newEndDate } },
                        { endDate: { $gte: newEndDate } }
                    ]
                },
                {
                    //om existerade start & enddates faller mellan nya start & enddates
                    $and: [
                        { startDate: { $gte: newStartDate } },
                        { endDate: { $lte: newEndDate } }
                    ]
                }

            ]
        })

        //checka om overlap retunredade true
        if (overlap) {
            //Den nya bookingen faller mellan existerande booking dates. godkänn inte bookingen
            return res.status(500).send({ msg: "The booking you are trying to create overlaps with an existing booking! (startdate or enddate)" })
        }

        //allt ok, spara bokning
        const newBooking = await booking.save()
        res.send({ msg: "Booking Saved", newBooking })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

// PATCH uppdatera en booking
router.patch('/:id', authToken, async (req, res) => {
    try {
        const updatedBooking = await Booking.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.authUser.sub },
            req.body,
            { new: true }
        )
        res.send({ msg: "Booking updated", updatedBooking })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

// DELETE en booking
router.delete('/:id', authToken, async (req, res) => {
    try {
        const deletedBooking = await Booking.deleteOne({
            _id: req.params.id, createdBy: req.authUser.sub
        })
        if (!deletedBooking) {
            return res.status(404).send({ msg: "No such booking" })
        }
        res.send({ msg: "Booking deleted", deletedBooking })

    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

module.exports = router
