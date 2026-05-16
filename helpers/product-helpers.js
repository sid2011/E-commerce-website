const db = require('../config/connection')
const collection = require('../config/collections')
const { ObjectId } = require('mongodb')
const objectId=require('mongodb').ObjectId

module.exports = {

    addProducts: (products, callback) => {
        console.log(products)

        db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .insertOne(products)
            .then((data) => {
                callback(data.insertedId)
            })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {

            try {

                let products = await db.get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .find()
                    .toArray()

                resolve(products)

            } catch (err) {

                reject(err)
            }
        })
    },

    deleteProduct: (proId) => {

        return new Promise((resolve, reject) => {

            db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .deleteOne({ _id: new ObjectId(proId) })
                .then((response) => {

                    resolve(response)

                }).catch((err) => {

                    reject(err)
                })
        })
    }, getProductDetails: (proId) => {
        return new Promise(async (resolve, reject) => {
          let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new objectId(proId)}).then((product)=>{
                   resolve(product)
             })
        })
    }
}