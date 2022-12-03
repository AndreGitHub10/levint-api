const { body } = require('express-validator')

module.exports.lelangValidator = (method) => {
    switch (method) {
        case 'create': {
            return [
                body('id_item').exists(),
                body('harga_dasar').exists().isNumeric().isLength({ min: 3, max: 9 }),
                body('tanggal_mulai').exists(),
                body('bid_increase').exists().isNumeric(),
                body('auto_sell_price').exists().isNumeric().custom((value, { req }) => {
                    if (req.body.auto_sell) {
                        if (parseInt(value) <= parseInt(req.body.harga_dasar)) {
                            throw new Error('Nilai auto sell tidak boleh lebih rendah dari harga dasar')
                        }
                    }
                    return true
                }),
                body('auto_sell').exists().isBoolean(),
                body('sell_limit_price').exists().isNumeric().custom((value, { req }) => {
                    if (req.body.sell_limit) {
                        if (parseInt(value) <= parseInt(req.body.harga_dasar)) {
                            throw new Error('Nilai sell limit tidak boleh lebih rendah dari harga dasar')
                        }
                        if (req.body.auto_sell) {
                            if (parseInt(value) >= parseInt(req.body.auto_sell_price)) {
                                throw new Error('Nilai sell limit tidak boleh lebih tinggi dari nilai auto sell')
                            }
                        }
                    }
                    return true
                }),
                body('sell_limit').exists().isBoolean(),
                body('open_bidding').exists().isBoolean(),
                body('estLelang_hari').exists().isNumeric(),
                body('estLelang_jam').exists().isNumeric()
            ]
        }
        case 'createClosed': {
            return [
                body('id_item').exists(),
                body('harga_dasar').exists().isNumeric().isLength({ min: 3, max: 9 }),
                body('tanggal_mulai').exists(),
                body('bid_increase').exists().isNumeric(),
                body('open_bidding').exists().isBoolean(),
                body('estLelang_hari').exists().isNumeric(),
                body('estLelang_jam').exists().isNumeric()
            ]
        }
    }
}