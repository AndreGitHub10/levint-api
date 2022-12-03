const express = require('express')
const { createMessage, getAllChat } = require('../controllers/chat-controller')
const { register, login, getUser, logout, updateNama, confirmAccount, emailVerification, updatePhoto } = require('../controllers/user-controller')
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

// update function
userRouter.put('/updateNama', verifyToken, updateNama)
module.exports = userRouter