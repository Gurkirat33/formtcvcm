import mongoose from "mongoose";

let cachedConnection = null;

const connectDb = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 3,
    retryWrites: true,
    retryReads: true,
    maxIdleTimeMS: 60000,
  };

  try {
    const connection = await mongoose.connect(mongoUri, options);
    console.log("Connected to MongoDB");

    cachedConnection = connection;

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      cachedConnection = null;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      cachedConnection = null;
    });

    return connection;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    cachedConnection = null;
    throw error;
  }
};

export default connectDb;
