import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Connected to MongoDB"),
    );
    await mongoose.connect(`${process.env.MONGODB_URL}/MXH`);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
