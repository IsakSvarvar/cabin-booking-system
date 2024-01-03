require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    try {
        const authHeader = req.headers['authorization']

        // hittar 2:a delen av requestens header
        // optional chaining (?), kollar om det finns en header
        const token = authHeader?.split(' ')[1]

        const jwtBody = jwt.verify(token, process.env.JWT_SECRET)

        req.authUser = jwtBody

        console.log('Token authorized!')

    } catch (error) {

        return res.status(401).send({
            msg: "Authorization failed.",
            error: error.message
        })
    }

    next()

}
