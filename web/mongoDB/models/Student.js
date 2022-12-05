import mongoose from 'mongoose'

// Defining schema.
const studentSchema = new mongoose.Schema(
    {
        shopify_id:{
            type: Array,
        }
    }
)

// Model.
const StudentModel = mongoose.model("coll_id", studentSchema)

export default StudentModel