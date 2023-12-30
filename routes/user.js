const mongoose = require("mongoose");
require('dotenv').config()

mongoose.connect(process.env.Mongo_Url);

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  bio:String,
  photo:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }]
}, {timestamps:true});



module.exports = mongoose.model('user' , userSchema)