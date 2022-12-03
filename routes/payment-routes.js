const express = require('express')
const { getPaymentAccountDetail } = require('../controllers/payment-controller')
const { topUp, getAllPayment, checkPaymentStatus } = require('../shared-service/midtrans-controller')
const { refreshToken } = require('../shared-service/refreshToken')
const { verifyToken } = require('../shared-service/verifyToken')

const paymentRouter = express.Router()

paymentRouter.get('/getPaymentAccountDetail', verifyToken, getPaymentAccountDetail)
paymentRouter.post('/topUp', verifyToken, refreshToken, topUp)
paymentRouter.get('/getAllPayment', verifyToken, getAllPayment)
paymentRouter.post('/checkPaymentStatus', verifyToken, checkPaymentStatus)

module.exports = paymentRouter
