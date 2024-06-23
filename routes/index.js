var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const UserModel = require("./user.js");
const postModel = require("./post.js");
const upload = require('./multer.js');

/* GET home page. */



router.get("/" , (req,res)=>{
  res.send("backend insta clone");
})

router.post("/register", async (req, res) => {
  const { username, name, email, password } = req.body;

 try {
   const preExistUser = await UserModel.findOne({$or:[{email:email} , {username:username}]})
   console.log(preExistUser)
   if(!preExistUser){
     const user = new UserModel({
       username: username,
       name: name,
       email: email,
     })
     const encryptpass = await bcrypt.hash(password, 10);
     user.password = encryptpass;
     UserModel.create(user);
   
     res.status(200).json({ "success": true , msg:"You Can Now Login"});
   }
   else{
     res.status(400).json({msg:"User Already Exist With This Email Or Username"});
   }
 } catch (error) {
  res.status(404).json({msg: "Some Error occur While Registering Your Account" , error:error });
 }
})


router.post("/login", async (req, res) => {
  const { username, password } = req.body;

 try {
   const user = await UserModel.findOne({ username: username });
   if (!user) {
     res.json({ success: false, msg: "invalid credentials" });
   }
   else {
     const flag = bcrypt.compare(password, user.password);
     if (flag) {
       const token = jwt.sign({ username: username }, "ash");
       res.json({ success: true, token  , msg:"login successfully"});
     }
     else {
       res.json({ success: false, msg: "invalid credentials" });
     }
   }
 } catch (error) {
  res.status(404).json({msg: "some Error occur While Loging You" , error:error });
  
 }
}) 



router.get('/profile/:username',isLogin ,async (req, res) => {
  try {
    const user = await UserModel.findOne({ username: req.params.username }).populate('posts');
    res.json(user);
  } catch (error) {
    res.status(404).json({msg: "some Error occur While Finding your Profile" , error:error });
  }
})


router.post('/edit', isLogin ,upload.single('file') ,async (req, res) => {

  try {
    const user = await UserModel.findOneAndUpdate({ username: req.user.username }, {
      username: req.body.username,
      name: req.body.name,
      bio: req.body.bio,
      photo:req.body.photo,
      publicId:req.body.publicId
    })
    
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, msg: "fail to edit" })
  }

 

})


router.get('/getname', isLogin ,async (req, res) => {
  res.json(req.user); 
})


router.post("/upload", isLogin,upload.single('file'), async (req, res) => {
  try {
    const user = await UserModel.findOne({username:req.user.username})
    const post =await postModel.create({
      caption:req.body.caption,
      image:req.body.image,
      publicId:req.body.publicId,
      user:user._id
    })
    user.posts.push(post._id); 
    await user.save();
    res.json({ success: true , msg:"post uploded successfully"})
  } catch (error) {
    res.json({ success: false, msg: error })
  }

})



router.get('/getallposts', async (req, res) => {
  try {
    const result = await postModel.find().populate('user');
    res.json({ result })
  } catch (error) {
    res.status(404).json({msg: "some Error occur While Finding Posts" , error:error });
  }
})



router.post("/search" , async(req,res)=>{
  const regex = RegExp(`^${req.body.name}` , 'i');
  const user = await UserModel.find({username:regex}); 
  res.json({user});
})


router.post("/like/:id", isLogin ,async (req,res)=>{
  try {
    const user =await UserModel.findOne({username:req.user.username});
    const post =await postModel.findOne({_id:req.params.id});

    
    if(user.likedPosts.indexOf(req.params.id) == -1){
      post.likes.push(user._id);
      user.likedPosts.push(post._id);
    }
    else{
      post.likes.splice(post.likes.indexOf(req.params.id),1);
      user.likedPosts.splice(user.likedPosts.indexOf(req.params.id),1);
    }
    await post.save();
    await user.save();
    
    res.json({post}) 
  } catch (error) {
    res.status(400).json({msg:"some error occur"})
  }
})


async function isLogin(req,res,next){
  if(!req.headers.token) {
    return res.json({msg:"please Login t"});
  };
  uname = jwt.verify(req.headers.token , "ash").username;
  const user = await UserModel.findOne({username:uname});
  if(!user){
    return res.json({msg:"Please Login u"});
  }
  req.user = user;
  next();
}
module.exports = router;
