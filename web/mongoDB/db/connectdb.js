import mongoose from 'mongoose'

const connectDB = async (DATABASE_URL) => {
    try{

        // await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        // console.log('Connected successfully..');

        //const connectDatabase = () => {
            new mongoose.connect(DATABASE_URL, {useUnifiedTopology: true,   useNewUrlParser: true}).then((data) => {
                console.log("Database connected to: ", data.connection.host)
            }).catch((error) => console.log(error))
        //}
    }
    catch(err){
        console.log(err);
    }
}

export default connectDB