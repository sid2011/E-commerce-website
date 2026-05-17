const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')

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

    let userCart = await db.get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: new ObjectId(userId) })

    if (userCart) {

        await db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
                { user: new ObjectId(userId) },
                {
                    $push: { products: new ObjectId(proId) }
                }
            )

    } else {

        let cartObj = {
            user: new ObjectId(userId),
            products: [new ObjectId(proId)]
        }

        await db.get()
            .collection(collection.CART_COLLECTION)
            .insertOne(cartObj)
    }
}}

