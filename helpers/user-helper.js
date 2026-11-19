const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Stu1nTmBRweYK4',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret'
});

module.exports = {
  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        userData.password = await bcrypt.hash(userData.password, 10);
        if (userData.email) {
          userData.email = userData.email.trim();
        }
        let response = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  },

  doLogIn: async (userData) => {
    let response = {};
    try {
      const emailInput = (userData.email || '').trim();
      let user = await db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          $or: [
            { email: userData.email },
            { email: emailInput },
            { email: emailInput.toLowerCase() }
          ]
        });

      if (!user) {
        return { status: false };
      }
      let status = await bcrypt.compare(userData.password, user.password);
      if (status) {
        delete user.password;
        response.user = user;
        response.status = true;
        return response;
      } else {
        return { status: false };
      }
    } catch (err) {
      console.error("Login error:", err);
      return { status: false, err };
    }
  },

  addToCart: async (proId, userId) => {
    if (!ObjectId.isValid(proId) || !ObjectId.isValid(userId)) {
      throw new Error("Invalid ID provided");
    }

    let proObj = {
      item: new ObjectId(proId),
      quantity: 1
    };

    let userCart = await db.get()
      .collection(collection.CART_COLLECTION)
      .findOne({ user: new ObjectId(userId) });

    if (userCart) {
      let proExist = userCart.products.findIndex(product => product.item.toString() === proId);
      if (proExist !== -1) {
        await db.get().collection(collection.CART_COLLECTION).updateOne(
          { user: new ObjectId(userId), 'products.item': new ObjectId(proId) },
          { $inc: { 'products.$.quantity': 1 } }
        );
      } else {
        await db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { user: new ObjectId(userId) },
            { $push: { products: proObj } }
          );
      }
    } else {
      let cartObj = {
        user: new ObjectId(userId),
        products: [proObj]
      };
      await db.get()
        .collection(collection.CART_COLLECTION)
        .insertOne(cartObj);
    }
  },

  getCartProduct: async (userId) => {
    if (!ObjectId.isValid(userId)) return [];
    try {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: new ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            _id: 1,
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            _id: 1,
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray();
      return cartItems;
    } catch (err) {
      console.error("Error getting cart products:", err);
      return [];
    }
  },

  getCartCount: async (userId) => {
    if (!ObjectId.isValid(userId)) return 0;
    try {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
      let count = 0;
      if (userCart && userCart.products) {
        count = userCart.products.length;
      }
      return count;
    } catch (err) {
      return 0;
    }
  },

  changeQuantity: async (cartId, proId, count) => {
    if (!ObjectId.isValid(cartId) || !ObjectId.isValid(proId)) return;
    count = parseInt(count, 10);

    await db.get().collection(collection.CART_COLLECTION).updateOne(
      {
        _id: new ObjectId(cartId),
        'products.item': new ObjectId(proId)
      },
      {
        $inc: { 'products.$.quantity': count }
      }
    );

    const cart = await db.get()
      .collection(collection.CART_COLLECTION)
      .findOne({ _id: new ObjectId(cartId) });

    if (cart && cart.products) {
      const product = cart.products.find(p => p.item.toString() === proId);
      if (product && product.quantity <= 0) {
        await module.exports.deleteCartProducts(proId, cart.user);
      }
    }
  },

  deleteCartProducts: async (proId, userId) => {
    if (!ObjectId.isValid(proId) || !ObjectId.isValid(userId)) return;
    await db.get().collection(collection.CART_COLLECTION).updateOne(
      { user: new ObjectId(userId) },
      {
        $pull: {
          products: { item: new ObjectId(proId) }
        }
      }
    );
  },

  getTotalAmount: async (userId) => {
    if (!ObjectId.isValid(userId)) return 0;
    try {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: new ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            _id: 1,
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            _id: 1,
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] }
            }
          }
        }
      ]).toArray();
      return total[0]?.totalAmount || 0;
    } catch (err) {
      console.error("Error getting total amount:", err);
      return 0;
    }
  },

  placeOrder: async (userId, order, products, total) => {
    return new Promise(async (resolve, reject) => {
      try {
        let status = order.paymentMethod === 'COD' ? 'placed' : 'pending';
        let orderObj = {
          deliveryDetails: {
            mobile: order.mobile,
            address: order.address,
            pincode: order.pincode
          },
          user: new ObjectId(userId),
          paymentMethod: order.paymentMethod,
          products: products,
          totalAmount: total || 0,
          date: new Date(),
          status: status
        };
        let response = await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj);
        resolve(response.insertedId);
      } catch (err) {
        reject(err);
      }
    });
  },

  getCartProductList: async (userId) => {
    if (!ObjectId.isValid(userId)) return [];
    try {
      const cart = await db.get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: new ObjectId(userId) });
      return cart?.products || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getOrderList: async (userId) => {
    if (!ObjectId.isValid(userId)) return [];
    try {
      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { user: new ObjectId(userId) }
        },
        {
          $project: {
            _id: 1,
            item: '$products',
            total: '$totalAmount',
            status: '$status',
            date: '$date',
            address: '$deliveryDetails.address',
            paymentMethod: '$paymentMethod',
            pincode: '$deliveryDetails.pincode'
          }
        },
        { $sort: { date: -1 } }
      ]).toArray();
      return orderItems;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      const amountInPaise = Math.round((Number(total) || 0) * 100);
      if (amountInPaise <= 0) {
        return reject(new Error("Total amount must be greater than 0"));
      }
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: orderId.toString()
      };
      instance.orders.create(options, (err, order) => {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });
  },

  verifyPayment: (details) => {
    const crypto = require("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : 'secret';

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(details.razorpay_order_id + "|" + details.razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    return generatedSignature === details.razorpay_signature;
  },

  deleteAllCartProducts: async (userId) => {
    if (!ObjectId.isValid(userId)) return;
    return await db.get().collection(collection.CART_COLLECTION).updateOne(
      { user: new ObjectId(userId) },
      { $set: { products: [] } }
    );
  }
};
