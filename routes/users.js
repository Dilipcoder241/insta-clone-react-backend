const mongoose = require("mongoose");
require('dotenv').config()
const plm = require('passport-local-mongoose');

mongoose.connect(process.env.Mongo_Url);

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  bio:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  }]
}, {timestamps:true});

userSchema.plugin(plm);

module.exports = mongoose.model('user' , userSchema)