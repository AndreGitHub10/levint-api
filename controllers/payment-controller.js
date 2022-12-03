const PaymentAccount = require('../models/payment.account.model')

const getPaymentAccountDetail = async (req, res) => {
    let id_user = req.id
    let paymentAccount
    try {
        paymentAccount = await PaymentAccount.findOne({id_user})
    } catch (error) {
        console.log(error)
        return res.status(400).json({message: "kesalahan server database"})
    }

    if(!paymentAccount) {
        paymentAccount = new PaymentAccount({
            id_user,
            saldo: 0,
            status: "new"
        })
        try {
            paymentAccount.save()
        } catch (error) {
            console.log(error)
            return res.status(400).json({message: "kesalahan server database"})
        }
    }
    return res.status(200).json({message: "data akun pembayaran berhasil didapatkan", paymentAccount})
}

exports.getPaymentAccountDetail = getPaymentAccountDetail