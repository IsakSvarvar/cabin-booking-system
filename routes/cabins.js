const express = require('express')
const router = express.Router()

const Cabin = require('../models/cabinModel')
const authToken = require('../middleware/authToken')




//GET visa alla cabins
router.get('/', async (req, res) => {
    try {
        const cabins = await Cabin.find()
        res.send(cabins)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

//Projekt 2 uppdatering
router.get('/owned', authToken, async (req, res) => {
    try {
        const cabins = await Cabin.find({ createdBy: req.authUser.sub })
        if (!cabins) {
            return res.status(404).send({ msg: "Could not find any cabins under your username" })
        }
        res.send(cabins)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

//GET visa specifik cabin enligt id
router.get('/:id', async (req, res) => {
    try {
        const cabin = await Cabin.findOne({ _id: req.params.id })
        if (!cabin) {
            return res.status(404).send({ msg: "Cabin not found" })
        }
        res.send(cabin)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

//POST skapa ny cabin listing
router.post('/', authToken, async (req, res) => {
    try {

        const cabin = new Cabin({
            address: req.body.address,
            size: req.body.size,
            sauna: req.body.sauna,
            beach: req.body.beach,
            price: req.body.price,
            // kollar att det finns en token m.h.a. optional chainging
            // createdBy = användarens id, tas via authToken och inte body
            createdBy: req.authUser?.sub
        })

        const newCabin = await cabin.save()
        res.send({ msg: "Cabin saved", newCabin })

    } catch (error) {
        //om fail returna errorstatus 500
        res.status(500).send({ msg: error.message })
    }
})

//PATCH uppdatera en cabin
router.patch('/:id', authToken, async (req, res) => {
    try {
        const updatedCabin = await Cabin.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.authUser.sub },
            req.body,
            { new: true }
        )
        res.send({ msg: "Cabin updated", updatedCabin })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

//DELETE ta bort en cabin
router.delete('/:id', authToken, async (req, res) => {
    try {
        const deletedCabin = await Cabin.deleteOne({
            _id: req.params.id,
            createdBy: req.authUser.sub
        })
        if (!deletedCabin) {
            return res.status(404).send({ msg: "Cabin not found" })
        }

        res.send({ msg: "Cabin deleted", deletedCabin })

    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})
module.exports = router
