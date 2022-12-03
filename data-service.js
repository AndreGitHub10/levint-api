require('dotenv').config()

const express = require('express')
const app = express()
// const multer = require('multer')
// const upload = multer()
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const itemRouter = require('./routes/item-routes')
const lelangRouter = require('./routes/lelang-routes')
const transaksiRouter = require('./routes/transaksi-routes')

var allowedDomains = ['http://localhost:3001', 'http://192.168.87.203:3001', 'http://192.168.87.203:3000', 'http://localhost:3000']

// app.use(cors())
app.use(cors({credentials: true, origin: function (origin, callback) {
    if(!origin) return callback(null, true)

    if(allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`
        return callback(new Error(msg), false)
    }
    return callback(null, true)
}}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
// app.use(upload.array())
app.use('/item', itemRouter)
app.use('/lelang', lelangRouter)
app.use('/transaksi', transaksiRouter)

mongoose
    .connect(
        process.env.DATABASE_URL
    )
    .then(() => {
        app.listen(process.env.DATA_SERVER_PORT, () => {
            console.log(`Data Server is running on port ${process.env.DATA_SERVER_PORT}`)
        })
    })
    .catch((err) => console.log(err))

// app.get("/searchone", async (req, res) => {
//     try {
//         if (req.query.city) {
//         let results;
//         if (req.query.city.includes(",") || req.query.city.includes(" ")) {
//             results = await client
//             .db("test")
//             .collection("items")
//             .aggregate([
//                 {
//                 $search: {
//                     index: "autocomplete",
//                     autocomplete: {
//                     query: req.query.city,
//                     path: "searchName",
//                     fuzzy: {
//                         maxEdits: 1,
//                     },
//                     tokenOrder: "sequential",
//                     },
//                 },
//                 },
//                 {
//                 $project: {
//                     searchName: 1,
//                     _id: 1,
//                     city: 1,
//                     country: 1,
//                     adminCode: 1,
//                     countryCode: 1,
//                     fullName: 1,
//                     score: { $meta: "searchScore" },
//                 },
//                 },
//                 {
//                 $limit: 10,
//                 },
//             ])
//             .toArray();

//             return res.send(results);
//         }

//         result = await client
//             .db("location")
//             .collection("cities")
//             .aggregate([
//             {
//                 $search: {
//                 index: "autocomplete",
//                 autocomplete: {
//                     query: req.query.city,
//                     path: "city",
//                     fuzzy: {
//                     maxEdits: 1,
//                     },
//                     tokenOrder: "sequential",
//                 },
//                 },
//             },
//             {
//                 $project: {
//                 searchName: 1,
//                 _id: 1,
//                 city: 1,
//                 country: 1,
//                 adminCode: 1,
//                 countryCode: 1,
//                 fullName: 1,
//                 score: { $meta: "searchScore" },
//                 },
//             },
//             {
//                 $limit: 10,
//             },
//             ])
//             .toArray();

//         return res.send(result);
//         }
//         res.send([]);
//     } catch (error) {
//         console.error(error);
//         res.send([]);
//     }
// });