import mongoose from "mongoose";

const globalMongoose = globalThis;

if (!globalMongoose.mongooseCache) {
  globalMongoose.mongooseCache = {
    connection: null,
    promise: null,
  };
}

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI no configurada");
  }

  if (globalMongoose.mongooseCache.connection || mongoose.connection.readyState === 1) {
    return globalMongoose.mongooseCache.connection || mongoose.connection;
  }

  if (!globalMongoose.mongooseCache.promise) {
    globalMongoose.mongooseCache.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    globalMongoose.mongooseCache.connection = await globalMongoose.mongooseCache.promise;
    return globalMongoose.mongooseCache.connection;
  } catch (error) {
    globalMongoose.mongooseCache.promise = null;
    throw error;
  }
};
