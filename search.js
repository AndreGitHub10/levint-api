require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient} = require('mongodb')
const assert = require('assert')
const client = new MongoClient(process.env.DATABASE_URL)
client.connect().then(() => {
    app.listen(4000, console.log("listening on port 4000"))
    console.log("Connection to db")
})
.catch(() => console.log("conn error"))

app.use(cors())
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true,
    })
)

const agg = [
    {
        $search: {
            index: 'item',
            text: {
                query: " ",
                path: {
                    'wildcard': '*'
                  },
            },
        },
    },
    {
        $limit: 1,
    },
    {
        $project: {
            _id: 0,
            nama_item: 1,
        },
    },
]

app.get('/', async(req, res) => {
    try {
        if(req.query.namaItem) {
            console.log(req.query.namaItem)
            let result
            result = await client
                .db('test')
                .collection('items')
                .aggregate([
                    {
                        $search: {
                            index: 'item',
                            text: {
                                query: req.query.namaItem,
                                path: "nama_item",
                            },
                        },
                    },
                    {
                        $limit: 5,
                    },
                    {
                        $project: {
                            _id: 0,
                            nama_item: 1,
                        },
                    },
                ]).toArray()
            return res.send(result)
        }
    } catch (err) {
        return res.send("error")
    }
    // let result = await client.db("test").collection("items").findOne({id_seller: "6388a311853e2b73b7458a26"})
    // res.status(200).json(result)
})

app.get('/atcmp', async (req, res) => {
    let result
    try {
        result = await client
            .db('test')
            .collection('items')
            .aggregate([
                {
                    $search: {
                        index: "autocomplete",
                        autocomplete: {
                            query: "uan",
                            path: "nama_item",
                            fuzzy: {
                                maxEdits: 1,
                            },
                            tokenOrder: "sequential"
                        }
                    }
                },
                {
                    $limit: 10
                },
                {
                    $project: {
                        _id: 0,nama_item: 1
                    }
                }
            ]).toArray()
            return res.send(result)
    } finally {
        console.log('done')
    }
})

// acmpt().catch(console.dir)



// MongoClient.connect(
//     process.env.SEARCH_DATABASE_URL,
//     {useNewUrlParser: true, useUnifiedTopology: true},
//     async function (connectErr, client) {
//         if(connectErr) throw connectErr
//         console.log(client)
//         assert.equal(null, connectErr)
//         const coll = client.db("test").collection("items")
//         let cursor = await coll.aggregate(agg).toArray()

//         .then(res => {
//             console.log(res)
//             res.forEach((doc) => console.log(JSON.stringify(doc)))
//             console.log('berhasil')
//         })
//         .catch(err => console.log("error: ", err))
//         .finally(() => {
//             client.close
//             console.log('closed')
//         })
//         console.log(cursor)
//         await cursor.forEach((doc) => console.log(doc))
//     }
// )



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