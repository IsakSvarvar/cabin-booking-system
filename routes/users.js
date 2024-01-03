const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const authToken = require('../middleware/authToken')

// GET hämta alla användare
router.get('/', authToken, async (req, res) => {
    // Visa ogärna hashar, skapa nytt objekt med bara de relevanta fälten
    try {
        const users = await User.find()
        res.send(users)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

//GET hämta en användare
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        if (!user) {
            return res.status(404).send({ msg: "User not found" })
        }
        res.send(user)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

// POST skapa en ny användare
router.post('/', async (req, res) => {
    try {
        // saltar automatiskt password från request
        const hashedPass = await bcrypt.hash(req.body.password, 10)

        // skapar ny instans av vår model dit vi sätter våra värden
        const user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashedPass
        })
        // save() skickar user objektet till mongodb och sparar det. 
        // Sen returneras ett objekt över hur det är sparat som vi sparar 
        const newUser = await user.save()

        res.send(newUser)

    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

// POST Logga in ( /users/login )
router.post('/login', async (req, res) => {
    try {
        // kolla i db om det finns en användare med en viss email
        const user = await User.findOne({ email: req.body.email }).exec()

        if (user == null) {
            return res.status(401).send({ msg: "There is no such user." })
        }

        // autentiserings check
        const match = await bcrypt.compare(req.body.password, user.password)
        if (!match) {
            return res.status(401).send({ msg: "Wrong password!" })
        }

        const token = jwt.sign({
            sub: user._id,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: '6h' })

        // autentiserad
        res.send({ msg: "Login OK", token: token })

    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

//PATCH uppdatera en användare
router.patch('/:id', authToken, async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )
        res.send({ msg: "User updated ", updatedUser })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

// DELETE radera användaren
router.delete('/:id', authToken, async (req, res) => {
    try {
        const deletedUser = await User.deleteOne({
            _id: req.params.id,
        })
        if (!deletedUser) {
            return res.status(404).send({ msg: "No such user" })
        }
        res.send({ msg: "User deleted", deletedUser })

    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

module.exports = router
