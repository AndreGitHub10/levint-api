require('dotenv').config()

const express = require('express')
const { createPayout, localTopUp } = require('./shared-service/midtrans-controller')
const { getProvinsi, getCity, wpApi, getCost, getSubdistrict } = require('./shared-service/rajaongkir')
// const { getProvinsi, getKurir } = require('./shared-service/binderByte')
const app = express()



app.listen(process.env.TEST_SERVER_PORT, () => {
    console.log(`Account Server is running on port ${process.env.TEST_SERVER_PORT}`)
})

createPayout()
// localTopUp()
// getKurir()
// getProvinsi()
// getCity(11)
// getSubdistrict('289')
// getCost('3615', '4080', '4000', 'sicepat')
// const test = async () => {
    // const subdistrict = await getSubdistrict('17')
    // console.log(subdistrict)
// }

// wpApi()