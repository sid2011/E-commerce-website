const db = require('../config/connection')
const collection = require('../config/collections')
const { ObjectId } = require('mongodb')

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
    },

    getProductDetails: (proId) => {

        return new Promise(async (resolve, reject) => {

            try {

                let product = await db.get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .findOne({ _id: new ObjectId(proId) })

                resolve(product)

            } catch (err) {

                reject(err)
            }
        })
    },

    updateProduct: (proId, proDetails) => {

        return new Promise(async (resolve, reject) => {

            try {

                let response = await db.get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .updateOne(
                        { _id: new ObjectId(proId) },
                        {
                            $set: {
                                name: proDetails.name,
                                price: proDetails.price,
                                description: proDetails.description,
                                category: proDetails.category
                            }
                        }
                    )

                resolve(response)

            } catch (err) {

                reject(err)
            }
        })
    }
}
    
