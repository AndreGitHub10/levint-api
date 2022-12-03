require('dotenv').config()
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const passwordConfirm = async (req, res, next) => {
    const {password} = req.body
    if(password === undefined) {
        return res.status(404).json({message: "Anda belum memasukkan password"})
    }
    const id_user = req.id
    console.log('User confirm pasword')

    // cek user apakah data ada?
    let existingUser;
    try{
        existingUser = await User.findById(id_user)
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
        return res.status(404).json({message: "Pasword salah"})
    }
    next()
}

exports.passwordConfirm = passwordConfirm