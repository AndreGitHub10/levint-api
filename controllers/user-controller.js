require('dotenv').config()
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('email-validator')
const moment = require('moment')
const {sendConfirmationEmail} = require('../shared-service/nodemailer.config.js')
// const { registerValidator } = require('../shared-service/inputValidator')
const { validationResult } = require('express-validator')

// const confirmEmail = async (req, res) => {
//     const code = req.param.code
// }

const register = async (req, res, next) => {
    const {name, email, password, username} = req.body
    
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()})
    }
    // if (!validator.validate(email)) {
    //     return res.status(404).json({message: "Format email tidak diperbolehkan"})
    // }

    // Apakah username telah ada
    let existingUserByUsername
    try{
        existingUserByUsername = await User.findOne({
            username: username
        })
    } catch (err) {
        console.log(err)
    }

    if (existingUserByUsername) {
        return res.status(401).json({message: "Username telah dipakai, gunakan nama yang berbeda!"})
    }

    // encrypt password
    const hashedPassword = bcrypt.hashSync(password)

    const confirmToken = jwt.sign({email: email}, process.env.NM_SECRET, {
        expiresIn: 60 * 10 // 10mins
    })

    // Apakah email sudah ada?
    let existingUserByEmail
    try{
        existingUserByEmail = await User.findOne({
            email: email
        })
    } catch (err) {
        console.log(err)
    }
    if (!existingUserByEmail) {
        // Simpan user
        const user = new User({
            name, email, password:hashedPassword, username, createdAt: Date.now(), updatedAt: Date.now(), lastVerifyAt: Date.now()
        })
        try {
            await user.save()
        } catch (err) {
            console.log(err)
            return res.status(404).json({message:"Terjadi kesalahan server"})
        }
        console.log('new user created')
        sendConfirmationEmail(username,email,confirmToken)
    } else {
        if(existingUserByEmail.status === "Pending") {
            const diff = moment().diff(existingUserByEmail.updatedAt, 'second')
            if(diff > 600) {
                try{
                    await User.findByIdAndUpdate(existingUserByEmail.id, {name, email, password:hashedPassword, username, updatedAt: Date.now()})
                } catch (err) {
                    console.log(err)
                    return res.status(404).json({message:"Terjadi kesalahan server"})
                }
                console.log('old user updated')
                sendConfirmationEmail(username,email,confirmToken)
            }
        } else {
            return res.status(401).json({message: "Email telah digunakan! Silahkan Login"})
        }
    }

    // const data = await User.findOne({email: email}, "-password")
    return res.status(201).json({message: "Konfirmasi akun anda melalui pesan yang telah kami kirim melalui email"})
}

const login = async (req, res, next) => {
    const {email, password} = req.body
    console.log('user coba login')

    // cek user apakah data ada?
    let existingUser;
    try{
        existingUser = await User.findOne({email: email})
    } catch (err) {
        return new Error(err)
    }

    // respond jika data belum terdaftar
    if (!existingUser){
        return res.status(404).json({message: "User tidak ditemukan. Silahkan daftar"})
    }

    if(existingUser.status === 'Pending') {
        return res.status(401).json({message: "Akum belum diverifikasi, cek email anda untuk mengverifikasi akun!"})
    }

    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password)
    if(!isPasswordCorrect) {
        return res.status(404).json({message: "Email / Password salah"})
    }

    const token = jwt.sign({id: existingUser.id},process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1hr"
    })

    res.cookie(String(existingUser._id), token,{
        path: "/",
        expires: new Date(Date.now() + 1000 * 60 * 60),
        httpOnly: true,
        sameSite: 'lax',
        secure:true
    })

    const user = await User.findById({_id: existingUser._id}, "-password")

    return res.status(200).json({message: "Login Berhasil!", user: user})
}

const updateNama = async (req, res, next) => {
    const id = req.id
    const {name} = req.body
    if (!name) {
        return res.status(400).json({message: "nama tidak diizinkan"})
    }
    
    try {
        const updateName = await User.findByIdAndUpdate({_id: id}, {name: name, updatedAt: Date.now()})
        console.log(updateNama.name)
    } catch (err) {
        return new Error(err)
    }
    const updatedUser = await User.findById({_id: id}, "-password")
    return res.status(202).json({message: "User terupdate", updatedUser})
}

const confirmAccount = async (req, res) => {
    const confirmToken = req.params.confirmToken
    console.log(confirmToken)
    let regUser
    jwt.verify(String(confirmToken), process.env.NM_SECRET, (err, user) => {
        if (err) {
            res.status(400).json({message: "Invalid Token!"})
        } else {
            regUser = user.email
            console.log(regUser)
        }
        
    })
    let activedUser
    try {
        activedUser = await User.findOneAndUpdate({email: regUser}, {status: "Active"})
    } catch (err) {
        console.log(err)
        return res.status(404).json({message:"Terjadi kesalahan server"})
    }

    if(activedUser) {
        return res.status(200).json({message: "User telah diverifikasi, silahkan login"})
    }
    return
}

const emailVerification = async (req, res) => {
    const {email} = req.body
    console.log(email)
    let existingUserByEmail
    try{
        existingUserByEmail = await User.findOne({
            email: email
        })
    } catch (err) {
        console.log(err)
    }

    if(!existingUserByEmail) {
        return res.status(404).json({message: "Akun dengan email ini tidak ditemukan"})
    }

    if(existingUserByEmail.status !== 'Pending'){
        return res.status(400).json({message: "Akun dengan email ini sudah aktif dan terverifikasi"})
    }

    const confirmToken = jwt.sign({email: email}, process.env.NM_SECRET, {
        expiresIn: 60 * 10 // 10mins
    })

    try {
        await User.findOneAndUpdate({email: email}, {lastVerifyAt: Date.now()})
    } catch {
        console.log(err)
    }

    const diff = moment().diff(existingUserByEmail.lastVerifyAt, 'second')
    if(diff > 600) {
        sendConfirmationEmail(existingUserByEmail.username,email,confirmToken)
        return res.status(200).json({message: "Konfirmasi akun anda melalui pesan yang telah kami kirim melalui email", diff})
    }
    return res.status(200).json({message: "Sepertinya anda telah meminta link verifikasi sebelumnya, silahkan tunggu beberapas saat jika ingin meminta kembali", diff})
}

// const verifyToken = (req, res, next) => {
//     const cookies = req.headers.cookie
//     if (!cookies) {
//         return res.status(401).json({message: "Sesi anda telah habis, Silahkan login terlebih dahulu"})
//     }
//     const token = cookies.split("=")[1]
//     console.log(token);
//     if (!token) {
//         res.status(404).json({message:"Token tidak ada"})
//     }
//     jwt.verify(String(token), process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) {
//             return res.status(400).json({message: "Invalid Token!"})
//         }
//         console.log(user.id)
//         req.id = user.id
//         next()
//     })
// }

const getUser = async (req, res, next) => {
    const userId = req.id
    let user
    try {
        user = await User.findById({_id: userId}, "-password")
    } catch (err) {
        return new Error(err)
    }
    if(!user) {
        return res.status(404).json({message: "User not found"})
    }
    return res.status(200).json({message: "Data User berhasil ditemukan", user})
}

const logout = (req, res, next) => {
    res.clearCookie(`${req.id}`)
    req.cookies[`${req.id}`] = ""
    return res.status(200).json({message: "Logout sukses"})
}

const updatePhoto = async (req, res) => {
    const {url} = req.body
    const id_user = req.id
    console.log(url)
    let user
    try {
        await User.findByIdAndUpdate({_id: id_user}, {photo: url})
    } catch (err) {
        console.log(err)
        return res.status(404).json({message: "Kesalahan database (update gambar)"})
    }
    console.log('photo updated')
    try {
        user = await User.findById({_id: id_user}, "-password")
    } catch (err) {
        return new Error(err)
    }
    if(!user) {
        return res.status(404).json({message: "User not found"})
    }
    return res.status(200).json({message: "Berhasil Ubah Gambar", user})
}

const getSellerUser = async () => {
    let id_user = req.query.idUser
    let user
    try {
        user = await User.findById(id_user, "username, alamat, photo, phone")
    } catch (err) {
        console.log(err)
    }

    if(!user) {
        return res.status(400).json({message: "User toko tidak ditemukan"})
    }
    return res.status(200).json({message: "User toko ditemukan", user})
}

exports.register = register
exports.login = login
// exports.verifyToken = verifyToken
exports.getUser = getUser
exports.logout = logout
exports.updateNama = updateNama
exports.confirmAccount = confirmAccount
exports.emailVerification = emailVerification
exports.updatePhoto = updatePhoto
exports.getSellerUser = getSellerUser