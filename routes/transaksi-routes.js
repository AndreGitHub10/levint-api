const express = require('express')
const { getTransaksiSeller, getTransaksiBuyer, confirmTransaksi, package, inputResi, terimaPesanan, transaksiSelesai, cancelTransaksi } = require('../controllers/transaksi-controller')
const { checkPaymentTransaksiStatus } = require('../shared-service/midtrans-controller')
const { refreshToken } = require('../shared-service/refreshToken')
const { verifyToken } = require('../shared-service/verifyToken')

const transaksiRouter = express.Router()
transaksiRouter.post('/getTransaksiSeller', verifyToken, refreshToken, getTransaksiSeller)
transaksiRouter.post('/getTransaksiBuyer', verifyToken, refreshToken, getTransaksiBuyer)
transaksiRouter.post('/confirmTransaksi', verifyToken, refreshToken, confirmTransaksi)
transaksiRouter.post('/package', verifyToken, refreshToken, package)
transaksiRouter.post('/inputResi', verifyToken, refreshToken, inputResi)
transaksiRouter.post('/terimaPesanan', verifyToken, refreshToken, terimaPesanan)
transaksiRouter.post('/transaksiSelesai', verifyToken, refreshToken, transaksiSelesai)
transaksiRouter.post('/cancelTransaksi', verifyToken, refreshToken, cancelTransaksi)
transaksiRouter.post('/checkPaymentTransaksiStatus', verifyToken, refreshToken, checkPaymentTransaksiStatus)


module.exports = transaksiRouter