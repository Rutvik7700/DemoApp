import studentModel from "../models/Student.js"


class studentController {

    static createDoc = (req, res) => {
        res.redirect("/student")
    }

    // static getAllDoc = async (req, res) => {
    //     try{
    //         const result = await studentModel.find()
    //         console.log(result)
    //         res.render("index", {result})
    //     }catch (error){
    //         console.log(error)
    //     }
    //     // res.render("index")
    // }

    // static editDoc = (req, res) => {
    //     res.render("edit")
    // }

    // static updateDocById = (req, res) => {
    //     res.redirect("/student")
    // }

    // static deleteDocById = (req, res) => {
    //     res.redirect("/student")
    // }
}

export const getStudunt = async( req, res, arr_val_col) => {
    
    console.log("Data", arr_val_col);
    const data = await studentModel.create({shopify_id:[arr_val_col]});
    console.log("Created", data);
}

export default studentController