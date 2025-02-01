import mongoose from "mongoose";
import dotenv from "dotenv";
const database = async () => { 
try {
    const url =process.env.MONGO_URL;
await mongoose.connect(url);   

console.log("Database Connected");


    
} catch (error) {
    
    console.log(error.message);
    
}




}

export default database;
