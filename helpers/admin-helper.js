const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { log } = require('node:console')
module.exports={
doLogIn: async (adminData) => {

    let response = {}

    let admin = await db.get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email:adminData.email })
//console.log("FOUND admin:", admin)
    if (!admin) {
        //console.log("Invalid email")
        return { status: false }
    }
    let status = await bcrypt.compare(adminData.password,admin.password)
 // console.log("PASSWORD MATCH:", status)
    if (status) {
        //console.log("Login success")
        response.admin = admin
        response.status = true
        return response
    } else {
        //console.log("Login failed")
        return { status: false }
    }
}
}
