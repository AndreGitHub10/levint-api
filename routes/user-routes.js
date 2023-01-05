const express = require('express')
const { createMessage, getAllChat } = require('../controllers/chat-controller')
const { register, login, getUser, logout, confirmAccount, emailVerification, updatePhoto, getSellerUser, updateUser, lupaPassword, addAlamat, deleteAlamat } = require('../controllers/user-controller')
const { registerValidator } = require('../shared-service/inputValidator')
const { verifyToken } = require('../shared-service/verifyToken')

const userRouter = express.Router()

userRouter.post("/register",registerValidator('register'),register)
userRouter.post("/login",login)
userRouter.get("/getUser",verifyToken, getUser)
userRouter.post('/logout', verifyToken, logout)
userRouter.get('/verification/:confirmToken', confirmAccount)
userRouter.post('/emailVerification', emailVerification)
userRouter.post('/sendMessage', verifyToken, createMessage)
userRouter.get('/getAllChat', verifyToken, getAllChat)
userRouter.post('/updatePhoto', verifyToken, updatePhoto)
userRouter.get('/getSellerUser', getSellerUser)

// update function
userRouter.post('/updateUser', verifyToken, updateUser)
userRouter.post('/lupaPassword', lupaPassword)
userRouter.post('/addAlamat', verifyToken, addAlamat)
userRouter.post('/deleteAlamat', verifyToken, deleteAlamat)
module.exports = userRouter