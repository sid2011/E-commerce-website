const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
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
       let user=await db.get(collection.USER_COLLECTION).findOne({Email:userData.Email})
       if(user){
        bcrypt.compare(userData.password,user.password).then((status)=>{
            if(status){
                console.log("Login attempt success")
            }else{
                console.log("Login attempt failed")
            }
        })
       }else{
            console.log("Invalid")
        }
        })
    }
}