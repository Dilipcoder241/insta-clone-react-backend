const mongoose = require("mongoose");
require('dotenv').config()

mongoose.connect("mongodb+srv://mihirsingh241:9898555808@cluster0.bwaslzo.mongodb.net/instaclone")

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  bio:String,
  photo:String,
  publicId:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }]
}, {timestamps:true});



module.exports = mongoose.model('user' , userSchema)