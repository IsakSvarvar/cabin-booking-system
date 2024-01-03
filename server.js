const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const PORT = process.env.PORT || 3100

console.log(process.env.DOTENV_TEST)

// Kopplar till databasen
mongoose.connect(process.env.DB_URL)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.on('open', () => console.log("Connected to DB Atlas!"))

// behövs för att kommunicera med json till enpointarna. 
app.use(express.json())

// users endpoint
const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

// cabins endpoint
const cabinRouter = require('./routes/cabins')
app.use('/cabins', cabinRouter)

// bookings endpoint
const bookingRouter = require('./routes/bookings')
app.use('/bookings', bookingRouter)

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
