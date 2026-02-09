import mongoose from 'mongoose'
import config from '../config/config.js'

const Database = async()=>{
    try{

       await mongoose.connect(config.DATABASE_URL)
        console.log('Database Connected')

    }catch(err){
     console.log('Database connection error: ', err.message);
     process.exit(1);
    }
};

export default Database;
