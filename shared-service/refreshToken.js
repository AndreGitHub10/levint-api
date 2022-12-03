const express = require('express')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

const refreshToken = (req, res, next) => {
    const id = req.id
    if (id == null) {
        return res.status(404).json({message: "Cant refresh token, user not found"})
    }
    res.clearCookie(`${req.id}`)
    req.cookies[`${req.id}`] = ""
    const token = jwt.sign({id: id},process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "60hr"
    })
    res.cookie(String(id), token,{
        path: "/",
        expires: new Date(Date.now() + 1000 * 60 * 60),
        httpOnly: true
    })

    req.token = token
    next()
}

exports.refreshToken = refreshToken