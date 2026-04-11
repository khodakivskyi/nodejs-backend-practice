import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

export const connectDB = async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri);
};

export const disconnectDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoose.connection.close();

    if (mongo) {
        await mongo.stop();
    }
};

export const clearDB = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        if(collections[key]) {
            await collections[key].deleteMany({});
        }
    }
};