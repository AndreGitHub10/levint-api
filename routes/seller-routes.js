const express = require('express')
const { register,  checkAvailable, getSeller, getSellerPublic } = require('../controllers/seller-controller')
const { refreshToken } = require('../shared-service/refreshToken')
const { verifyToken } = require('../shared-service/verifyToken')


const sellerRouter = express.Router()

sellerRouter.post('/register', verifyToken, register)
// sellerRouter.post('/login')
sellerRouter.post('/checkAvailable', checkAvailable)
sellerRouter.get('/getSeller', verifyToken, refreshToken, getSeller)
sellerRouter.get('/getSellerPublic', getSellerPublic)
module.exports = sellerRouter