const db=require('../config/connection')
const collection=require('../config/collections')

module.exports={
    addProducts:(products,callback)=>{
console.log(products)
db.get().collection('product').insertOne(products).then((data)=>{
callback(data.insertedId)


})
    },getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        } catch (err) {
            reject(err)
        }
    })
}}