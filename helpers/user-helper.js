const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { log } = require('node:console')
const Razorpay = require('razorpay');
const secret = process.env.RAZORPAY_KEY_SECRET
var instance = new Razorpay({
  key_id: 'rzp_test_Stu1nTmBRweYK4',
  key_secret:secret,
});
module.exports={
    doSignUp:(userData)=>{
       return new Promise(async(resolve,reject)=>{
        userData.password=await bcrypt.hash(userData.password,10)
        let response=await db.get().collection(collection.USER_COLLECTION).insertOne(userData)
        resolve(response)

       })
    },doLogIn: async (userData) => {

    let response = {}

    let user = await db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email:userData.email })
//console.log("FOUND USER:", user)
    if (!user) {
        //console.log("Invalid email")
        return { status: false }
    }
    let status = await bcrypt.compare(userData.password, user.password)
 // console.log("PASSWORD MATCH:", status)
    if (status) {
        //console.log("Login success")
        response.user = user
        response.status = true
        return response
    } else {
        //console.log("Login failed")
        return { status: false }
    }
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
//console.log(proExist)
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
//console.log(cartObj)
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
                _id:1,
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
    count = parseInt(count)

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

    const cart = await db.get()
        .collection(collection.CART_COLLECTION)
        .findOne({ _id: new ObjectId(cartId) })

    const product = cart.products.find(
        p => p.item.toString() === proId
    )

    if (product && product.quantity <= 0) {
        await module.exports.deleteCartProducts(proId, cart.user)
    }
},deleteCartProducts: async (proId,userId) => {
     await db.get().collection(collection.CART_COLLECTION).updateOne(
        { user: new ObjectId(userId) },
        {
            $pull: {
                products: {
                    item: new ObjectId(proId)
                }
            }
        }
    )
},getTotalAmount:async(userId)=>{
let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
    {
        $match:{user:new ObjectId(userId)}},
        {
            $unwind:'$products'
        },{
            $project:{
                _id:1,
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
            },{
                $group:{
                _id:null,
                totalAmount:{
      $sum:{$multiply:['$quantity',{ $toInt:'$product.price' }]}
                }
                }
            }
]).toArray()
return total[0]?.totalAmount
},placeOrder:async(userId,order,products,total)=>{
    return new Promise((resolve,reject)=>{
let status = order.paymentMethod === 'COD' ? 'placed' : 'pending';
    let orderObj={
        deliveryDetails:{
            mobile:order.mobile,
            address:order.address,
            pincode:order.pincode
        },user:new ObjectId(order.userId),
        paymentMethod:order.paymentMethod,
        products:products,
        totalAmount:total,
        date:new Date(),
        status:status
    }
 db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
db.get().collection(collection.CART_COLLECTION).deleteOne({user:new ObjectId(userId)})
resolve(response.insertedId)
   })
    })
    

},

getCartProductList: async (userId) => {
  try {
    const cart = await db.get()
      .collection(collection.CART_COLLECTION)
      .findOne({ user: new ObjectId(userId) });

    return cart?.products || [];
  } catch (err) {
    console.log(err);
    return [];
  }
},
getOrderList:async(userId)=>{
let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
        $match:{user:new ObjectId(userId)}
      },{
            $project:{
                item:'$products',
                total:'$totalAmount',
                status:'$status',
                date:'$date',
                address:'$deliveryDetails.address',
                paymentMethod:'$paymentMethod',
                pincode:'$deliveryDetails.pincode'
            }
        }
])
return orderItems
},
generateRazorpay:(orderId, total) => {
  return new Promise((resolve, reject) => {
    const options = {
      amount: total, // amount in paise
      currency: "INR",
      receipt: orderId,
    };

    instance.orders.create(options, (err, order) => {
      if (err) {
        reject(err);
      } else {
        console.log("New order",order)
        resolve(order);
      }
    });
  });
}
}