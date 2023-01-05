require('dotenv').config()
const nodemailer = require('nodemailer')

const user = process.env.NM_USER
const pass = process.env.NM_PASS

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: user,
        pass: pass,
    }
})

const sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log('Check')
    transport.sendMail({
        from: user,
        to: email,
        subject: "Tolong konfirmasi akun anda",
        html: `<!DOCTYPE html><html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en"><head><title></title><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><!--<![endif]--><style>
        *{box-sizing:border-box}body{margin:0;padding:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}p{line-height:inherit}.desktop_hide,.desktop_hide table{mso-hide:all;display:none;max-height:0;overflow:hidden}@media (max-width:620px){.social_block.desktop_hide .social-table{display:inline-block!important}.image_block img.big,.row-content{width:100%!important}.mobile_hide{display:none}.stack .column{width:100%;display:block}.mobile_hide{min-height:0;max-height:0;max-width:0;overflow:hidden;font-size:0}.desktop_hide,.desktop_hide table{display:table!important;max-height:none!important}}
        </style></head><body style="background-color:#fff;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none"><table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff"><tbody><tr><td><table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table 
        class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:600px" width="600"><tbody><tr><td class="column column-1" width="100%" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-left:10px;padding-right:10px;vertical-align:top;padding-top:30px;padding-bottom:30px;border-top:0;border-right:0;border-bottom:0;border-left:0"><table 
        class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad" style="width:100%;padding-right:0;padding-left:0"><div class="alignment" align="left" style="line-height:10px"><img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/0db9f180-d222-4b2b-9371-cf9393bf4764/0bd8b69e-4024-4f26-9010-6e2a146401fb/editor_images/logo-black_1.png" 
        style="display:block;height:auto;border:0;width:174px;max-width:100%" width="174" alt="Alternate text" title="Alternate text"></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" 
        style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:600px" width="600"><tbody><tr><td class="column column-1" width="100%" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:10px;padding-bottom:5px;border-top:0;border-right:0;border-bottom:0;border-left:0"><table class="text_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" 
        style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div style="font-family:Arial,sans-serif"><div class style="font-size:12px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;mso-line-height-alt:18px;color:#333;line-height:1.5"><p style="margin:0;font-size:14px;text-align:left;mso-line-height-alt:36px"><span style="font-size:24px;">Halo ${name}.</span></p><p style="margin:0;font-size:14px;text-align:left;mso-line-height-alt:18px">&nbsp;</p><p 
        style="margin:0;mso-line-height-alt:18px">&nbsp;</p><p style="margin:0;text-align:left;mso-line-height-alt:36px"><span style="font-size:24px;">Kami telah mendeteksi ada permintaan pendaftaran akun dengan menggunakan email ini, silahkan konfirmasi akun dengan men-klik tombol di bawah ini</span><span style="font-size:24px;">:</span></p></div></div></td></tr></table>
        <table class="button_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad"><div class="alignment" align="center"><!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:38px;width:141px;v-text-anchor:middle;" arcsize="11%" stroke="false" fillcolor="#2fbb15"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px">
        <center style="color:#ffffff; font-family:Arial, sans-serif; font-size:14px"><![endif]--><div style="text-decoration:none;display:inline-block;color:#fff;background-color:#2fbb15;border-radius:4px;width:auto;border-top:0 solid transparent;font-weight:400;border-right:0 solid transparent;border-bottom:0 solid transparent;border-left:0 solid transparent;padding-top:5px;padding-bottom:5px;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all">
        <a href="http://localhost:3000/confirm?ct=${confirmationCode}" style="text-decoration:none;color:#fff;" target="_blank"><span style="padding-left:20px;padding-right:20px;font-size:14px;display:inline-block;letter-spacing:normal;"><span dir="ltr" style="word-break: break-word; line-height: 28px;">Konfirmasi Akun</span></span></a></div><!--[if mso]></center></v:textbox></v:roundrect><![endif]--></div></td></tr></table><table class="text_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div 
        style="font-family:Arial,sans-serif"><div class style="font-size:12px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;mso-line-height-alt:18px;color:#333;line-height:1.5"><p style="margin:0;font-size:14px;text-align:left;mso-line-height-alt:36px"><span style="font-size:24px;">Jika anda tidak merasa melakukan pendaftaran pada Levint, anda bisa mengabaikan pesan ini.</span></p><p style="margin:0;font-size:14px;text-align:left;mso-line-height-alt:18px">&nbsp;</p><p 
        style="margin:0;font-size:14px;text-align:left;mso-line-height-alt:21px"><strong><span style="font-size:24px;">Salam hangat, staff Levint</span></strong></p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" 
        cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:600px" width="600"><tbody><tr><td class="column column-1" width="100%" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;padding-left:10px;padding-right:10px;vertical-align:top;padding-top:5px;padding-bottom:15px;border-top:0;border-right:0;border-bottom:0;border-left:0"><table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" 
        role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad" style="width:100%;padding-right:0;padding-left:0"><div class="alignment" align="center" style="line-height:10px"><img class="big" src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/0db9f180-d222-4b2b-9371-cf9393bf4764/0bd8b69e-4024-4f26-9010-6e2a146401fb/editor_images/logo%2Bbg_1.png" style="display:block;height:auto;border:0;width:580px;max-width:100%" width="580" alt="Alternate text" 
        title="Alternate text"></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tbody><tr><td><table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:600px" width="600"><tbody><tr><td 
        class="column column-1" width="100%" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:25px;padding-bottom:25px;border-top:0;border-right:0;border-bottom:0;border-left:0"><table class="social_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0"><tr><td class="pad" 
        style="padding-bottom:10px;padding-top:10px;text-align:center;padding-right:0;padding-left:0"><div class="alignment" style="text-align:center"><table class="social-table" width="144px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;display:inline-block"><tr><td style="padding:0 2px 0 2px"><a href="https://www.facebook.com/officialLevint" target="_blank"><img 
        src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-default-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display:block;height:auto;border:0"></a></td><td style="padding:0 2px 0 2px"><a href="https://twitter.com/officialLevint" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-default-gray/twitter@2x.png" width="32" height="32" alt="Twitter" 
        title="Twitter" style="display:block;height:auto;border:0"></a></td><td style="padding:0 2px 0 2px"><a href="https://instagram.com/officialLevint" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-default-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display:block;height:auto;border:0"></a></td><td style="padding:0 2px 0 2px">
        <a href="https://www.linkedin.com/officialLevint" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-default-gray/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display:block;height:auto;border:0"></a></td></tr></table></div></td></tr></table><table class="text_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" 
        style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word"><tr><td class="pad"><div style="font-family:sans-serif"><div class style="font-size:12px;mso-line-height-alt:14.399999999999999px;color:#b2b5b6;line-height:1.2;font-family:Helvetica Neue,Helvetica,Arial,sans-serif"><p style="margin:0;text-align:center;mso-line-height-alt:14.399999999999999px"><a href="http://[previewinbrowser]/" target="_blank" rel="noopener" style="color: #b2b5b6;">view this email in your browser</a>&nbsp;</p><p style="margin:0;text-align:center;mso-line-height-alt:14.399999999999999px">&nbsp;</p><p 
        style="margin:0;text-align:center;mso-line-height-alt:14.399999999999999px"><strong>Our mailing address:</strong></p><p style="margin:0;text-align:center;mso-line-height-alt:14.399999999999999px">Jl.Niaga, Mojosari, Mojokerto</p><p style="margin:0;text-align:center;mso-line-height-alt:14.399999999999999px">&nbsp;</p><p style="margin:0;text-align:center;mso-line-height-alt:14.399999999999999px"><strong>Want to change how you receive this email?</strong></p><p 
        style="margin:0;text-align:center;mso-line-height-alt:14.399999999999999px"><a href="http://[updateprofile]/" target="_blank" rel="noopener" style="color: #b2b5b6;">manage preferences</a>&nbsp; &nbsp; ·&nbsp; &nbsp;&nbsp; <a href="http://[globalunsubscribe]/" target="_blank" rel="noopener" style="color: #b2b5b6;">unsubscribe</a></p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!-- End --><div style="background-color:transparent;">
        </div></body></html>`,
    }).catch(err => console.log(err))
}

const sendLelangWinnerNotificationEmail = (name, email, item, link) => {
    transport.sendMail({
        from: user,
        to: email,
        subject: "INFORMASI HASIL LELANG",
        html: `<div><h1>Selamat Anda Memenangkan Lelang</h1>
            <h2>Halo ${name}</h2>
            <p>Anda telah memenangkan lelang untuk barang : ${item}, anda bisa melanjutkan transaksi selanjutnya pada website Lelang Vintage atau tekan tombol dibawah untuk masuk ke proses transaksi</p>
            <button href="${link}">Cek Transaksi</button>
            </div>`
    }).catch(err => console.log(err))
}

const sendLelangBidNotificationEmail = (name, email, item, link) => {
    transport.sendMail({
        from: user,
        to: email,
        subject: "INFORMASI LELANG",
        html: `<div><h1>Item : ${item}</h1>
            <h2>Halo ${name}</h2>
            <p>Seseorang telah menawar dengan harga yang lebih tinggi dari tawaran anda, segera cek dan lakukan sesuatu untuk memenangkannya, cek pada link berikut</p>
            <button href="${link}">Cek</button>
            </div>`
    }).catch(err => console.log(err))
}

const sendLelangEndedNotificationEmail = (name, email, item, link) => {
    transport.sendMail({
        from: user,
        to: email,
        subject: "INFORMASI LELANG",
        html: `<div><h1>Item : ${item}</h1>
            <h2>Halo ${name}</h2>
            <p>Pelelangan telah berakhir, silahkan cek data lelang pada link berikut</p>
            <button href="${link}">Cek</button>
            </div>`
    }).catch(err => console.log(err))
}

const sendLelangEndedNotificationToLoserEmail = (name, email, item, link) => {
    transport.sendMail({
        from: user,
        to: email,
        subject: "INFORMASI HASIL LELANG",
        html: `<div><h1>Item : ${item}</h1>
            <h2>Halo ${name}</h2>
            <p>Pelelangan yang anda ikuti telah berakhir, sayang sekali anda kalah, saldo jaminan telah dikembalikan</p>
            <button href="${link}">Cek</button>
            </div>`
    }).catch(err => console.log(err))
}

const sendLupaPassword = (name, email, link) => {
    transport.sendMail({
        from: user,
        to: email,
        subject: "Ubah password",
        html: `<div><h1>Link ubah sandi</h1>
            <h2>Hi ${name}</h2>
            <p>berikut adalah link untuk merubah sandi kamu</p>
            <button href="${link}">Cek</button>
            </div>`
    }).catch(err => console.log(err))
}

exports.sendConfirmationEmail = sendConfirmationEmail
exports.sendLelangWinnerNotificationEmail = sendLelangWinnerNotificationEmail
exports.sendLelangBidNotificationEmail = sendLelangBidNotificationEmail
exports.sendLelangEndedNotificationEmail = sendLelangEndedNotificationEmail
exports.sendLelangEndedNotificationToLoserEmail = sendLelangEndedNotificationToLoserEmail
exports.sendLupaPassword = sendLupaPassword