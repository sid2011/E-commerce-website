const { MongoClient } = require('mongodb');

const state = {
    db: null,
    client: null
};

module.exports.connect = async function () {
    const dbname = 'shopping';
    const localUrl = 'mongodb://127.0.0.1:27017';
    const envUrl = process.env.MONGODB_URI || process.env.MONGO_URI;

    let client = null;

    // Prioritize local MongoDB 127.0.0.1:27017 which contains the active 'shopping' database
    try {
        client = new MongoClient(localUrl, {
            maxPoolSize: 50,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 3000
        });
        await client.connect();
        console.log("Database connected successfully at port 27017.");
    } catch (localErr) {
        if (envUrl) {
            console.warn("Local MongoDB unavailable, trying environment URI...");
            client = new MongoClient(envUrl, {
                maxPoolSize: 50,
                minPoolSize: 5,
                serverSelectionTimeoutMS: 5000
            });
            await client.connect();
            console.log("Database connected successfully via environment URI.");
        } else {
            throw localErr;
        }
    }

    state.client = client;
    state.db = client.db(dbname);
    return state.db;
};

module.exports.get = function () {
    return state.db;
};

module.exports.close = async function () {
    if (state.client) {
        await state.client.close();
        state.client = null;
        state.db = null;
    }
};
