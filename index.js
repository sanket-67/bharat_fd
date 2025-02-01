import App from './App.js'
import dotenv from 'dotenv'
import database from './MongodbConnection/dataBaseConnection.js';
dotenv.config();

const PORT = process.env.PORT || 5000

database();

App.listen(PORT,()=>{

console.log(`The Server Is Running On http://localhost:${PORT}`);


})


