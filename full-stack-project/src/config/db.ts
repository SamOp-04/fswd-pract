import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://techtalk736:IxMykzec4BhXmUGc@cluster.gx78d6p.mongodb.net/Lex-Mark");
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
