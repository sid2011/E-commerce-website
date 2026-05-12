const db=require('../config/connection')


module.exports={
    
    
    addProducts:(products,callback)=>{
console.log(products)
db.get().collection('product').insertOne(products).then((data)=>{
callback(data.insertedId)


})


    }
}