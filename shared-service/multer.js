const multer = require('multer')
const fs = require('fs')
const cloudinary = require('./cloudinary')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' ) {
        cb(null, true)
    } else {
        cb({message: 'format file salah'}, false)
    }
}

const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10},
    fileFilter: fileFilter
})

const uploadImageCloud = async (req, res, next) => {
    const uploader = async (path) => await cloudinary.uploads(path, 'Images')
    const urls = []
    console.log(req.body)
    const files = req.files
    // console.log(files)
    for (const file of files) {
        const { path } = file
        const newPath = await uploader(path)
        urls.push(newPath)
        fs.unlinkSync(path)
    }
    
    req.uploadedImage = {
        urls
    }
    return res.status(200).json({
        message: 'Images uploaded successfully',
        urls: urls
    })
}

exports.uploadImageCloud = uploadImageCloud
exports.uploadImage = uploadImage