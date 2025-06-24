import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MONGODB connected !! , DB host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MONGODB connection Failed ${error}`)
        process.exit(1);    // exisitng the node.js process with error/failure (1 deontes failure/error & 0 denoted success/normal exit)
    }
}

export default connectDB;