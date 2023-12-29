var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const UserModel = require("./users");

/* GET home page. */

router.post("/register" , async (req,res)=>{
  const {username , name , email , password} = req.body;
  const user = new UserModel({
    username:username,
    name:name,
    email:email,
  })
  const encryptpass = await bcrypt.hash(password , 10);
  user.password = encryptpass;
  UserModel.create(user);

  res.json({"success":true});
})


router.post("/login" , async (req,res)=>{
  const {username , password} = req.body;
  const user = await UserModel.findOne({username: username});
  if(!user){
    res.json({success:false , msg:"invalid credentials"});
  }
  else{
    const flag = await bcrypt.compare(password , user.password);
    if(flag){
      const token = jwt.sign({username:username} , "ash");
      res.json({success:true , token});
    }
    else{
      res.json({success:false , msg:"invalid credentials"});
    }
  }
})



router.get('/profile/:username', async (req,res)=>{
  const user = await UserModel.findOne({username:req.params.username});
  if(!user){
    res.json('feed');
  }
  res.json(user);
})


router.post('/edit' , async (req,res)=>{
  const data = await jwt.verify(req.headers.token , "ash");
  const uname = data.username;
  await UserModel.findOneAndUpdate({username:uname},{
    username:req.body.username,
    name:req.body.name,
    bio:req.body.bio
  })
  res.json({success:true})
})


router.get('/getname' , (req,res)=>{
  res.json(jwt.verify(req.headers.token , "ash"));
})

module.exports = router;
