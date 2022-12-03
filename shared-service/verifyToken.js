require('dotenv').config()
const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    console.log('verifying');
    if (!req.headers.cookie) {
        return res.status(401).json({message: "Silahkan login terlebih dahulu"})
    }
    const cookies = req.headers.cookie
    const token = cookies.split("=")[1]
    console.log(token);
    if (!token) {
        return res.status(404).json({message:"Token tidak ada"})
    }
    jwt.verify(String(token), process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(400).json({message: "Invalid Token!"})
        }
        console.log(user.id)
        req.id = user.id
        next()
    })  
}

const verifyTokenWithReturn = (socket) => {
    console.log('verifying');
    if (!socket) {
        return res.status(401).json({message: "Silahkan login terlebih dahulu"})
    }
    const cookies = socket.handshake.headers.cookie
    const token = cookies.split("=")[1]
    console.log(token);
    if (!token) {
        return res.status(404).json({message:"Token tidak ada"})
    }
    jwt.verify(String(token), process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(400).json({message: "Invalid Token!"})
        }
        console.log(user.id)
        return user.id
    })  
}

exports.verifyToken = verifyToken
exports.verifyTokenWithReturn = verifyTokenWithReturn