const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports = {
  doLogIn: async (adminData) => {
    let response = {};
    try {
      const emailInput = (adminData.email || '').trim();
      let admin = await db.get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({
          $or: [
            { email: adminData.email },
            { email: emailInput },
            { email: emailInput.toLowerCase() }
          ]
        });

      if (!admin) {
        return { status: false };
      }
      let status = await bcrypt.compare(adminData.password, admin.password);
      if (status) {
        delete admin.password;
        response.admin = admin;
        response.status = true;
        return response;
      } else {
        return { status: false };
      }
    } catch (err) {
      console.error("Admin login error:", err);
      return { status: false, err };
    }
  },

  getUserOrderDetails: async () => {
    try {
      let orderDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $lookup: {
            from: collection.USER_COLLECTION,
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $project: {
            _id: 1,
            deliveryDetails: 1,
            paymentMethod: 1,
            products: 1,
            totalAmount: 1,
            date: 1,
            status: 1,
            user: 1,
            userName: { $ifNull: [{ $arrayElemAt: ['$userInfo.name', 0] }, 'Customer'] },
            userEmail: { $ifNull: [{ $arrayElemAt: ['$userInfo.email', 0] }, 'N/A'] }
          }
        },
        { $sort: { date: -1 } }
      ]).toArray();
      return orderDetails;
    } catch (err) {
      console.error("Error in getUserOrderDetails:", err);
      return [];
    }
  },

  getUserName: async (userId) => {
    if (!userId || !ObjectId.isValid(userId)) return null;
    return await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) });
  },

  getDashboardStats: async () => {
    try {
      const database = db.get();
      const [totalProducts, totalOrders, totalUsers, revenueAgg] = await Promise.all([
        database.collection(collection.PRODUCT_COLLECTION).countDocuments(),
        database.collection(collection.ORDER_COLLECTION).countDocuments(),
        database.collection(collection.USER_COLLECTION).countDocuments(),
        database.collection(collection.ORDER_COLLECTION).aggregate([
          { $match: { status: 'placed' } },
          { $group: { _id: null, total: { $sum: { $toDouble: '$totalAmount' } } } }
        ]).toArray()
      ]);

      const totalRevenue = revenueAgg[0]?.total || 0;
      return { totalProducts, totalOrders, totalUsers, totalRevenue };
    } catch (err) {
      console.error("Error getting dashboard stats:", err);
      return { totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 };
    }
  }
};
