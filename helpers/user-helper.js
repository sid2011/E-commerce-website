const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { log } = require('node:console')

module.exports={
    doSignUp:(userData)=>{
       return new Promise(async(resolve,reject)=>{
        userData.password=await bcrypt.hash(userData.password,10)
        let response=await db.get().collection(collection.USER_COLLECTION).insertOne(userData)
        resolve(response)

       })
    },doLogIn:(userData)=>{
        return new Promise(async(resolve,reject)=>{
       let loginStatus=false
       let response={}
       let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
       if(user){
        bcrypt.compare(userData.password,user.password).then((loginStatus)=>{
            if(loginStatus){
                console.log("Login attempt success")
                response.user = user
                response.status = true
                resolve(response)
            }else{
                console.log("Login attempt failed")
                resolve({ status: false })
            }
        })
       }else{
            console.log("Invalid")
            resolve({ status: false })
        }
        })
    },addToCart: async (proId, userId) => {
    let proObj={
        item:new ObjectId(proId),
        quantity:1
    }

    let userCart = await db.get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: new ObjectId(userId) })

    if (userCart) {
let proExist=userCart.products.findIndex(product=>product.item.toString()==proId)
console.log(proExist)
if(proExist!=-1){
   await db.get().collection(collection.CART_COLLECTION).updateOne({ user: new ObjectId(userId),'products.item':new ObjectId(proId)},
{
    $inc:{'products.$.quantity':1}
})
}else{
await db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
                { user: new ObjectId(userId) },
                {
                    $push: { products:proObj }
                }
            )
}} else {

        let cartObj = {
            user: new ObjectId(userId),
            products: [proObj]
        }
console.log(cartObj)
        await db.get()
            .collection(collection.CART_COLLECTION)
            .insertOne(cartObj)
    }
    
},getCartProduct:async(userId)=>{
let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
    {
        $match:{user:new ObjectId(userId)}},
        {
            $unwind:'$products'
        },{
            $project:{
                id:1,
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },{
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },{
                $project:{
                    _id:1,item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            }
]).toArray()
   return cartItems
},

getCartCount:async(userId)=>{
let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new ObjectId(userId)})
let count=0
    if (userCart) {
count=userCart.products.length
}return count},

changeQuantity: async (cartId, proId, count) => {
count=parseInt(count)

    await db.get().collection(collection.CART_COLLECTION).updateOne(
        {
            _id: new ObjectId(cartId),
            'products.item': new ObjectId(proId)
        },
        {
            $inc: {
                'products.$.quantity': count
            }
        }
    )

}}
