const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    caption:String,
    image:String,
    publicId:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    }],
    
    
} , {timestamps:true})


module.exports = mongoose.model('post', postSchema);