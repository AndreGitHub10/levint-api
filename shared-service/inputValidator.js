const { body } = require('express-validator')

module.exports.registerValidator = (method) => {
    switch (method) {
        case 'register': {
            return [
                body('name', 'Nama lengkap salah').exists().isString().isLength({min: 4, max: 24}),
                body('username', 'Username salah!').exists().isString().isLength({min: 4, max: 24}),
                body('email', 'Format email salah!').exists().isEmail(),
                body('password').exists().isLength({min: 8, max: 24})
            ]
        }
    }
}