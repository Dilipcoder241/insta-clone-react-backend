var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

const UserModel = require("./user.js");
const postModel = require("./post.js");
const upload = require('./multer.js');

/* GET home page. */


router.get("/" , (req,res)=>{
  res.send("backend insta clone");
})

router.post("/register", async (req, res) => {
  const { username, name, email, password } = req.body;
  const user = new UserModel({
    username: username,
    name: name,
    email: email,
  })
  const encryptpass = await bcrypt.hash(password, 10);
  user.password = encryptpass;
  UserModel.create(user);

  res.json({ "success": true });
})


router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)
  const user = await UserModel.findOne({ username: username });
  if (!user) {
    res.json({ success: false, msg: "invalid credentials" });
  }
  else {
    const flag = bcrypt.compare(password, user.password);
    if (flag) {
      const token = jwt.sign({ username: username }, "ash");
      res.json({ success: true, token });
    }
    else {
      res.json({ success: false, msg: "invalid credentials" });
    }
  }
})



router.get('/profile/:username', async (req, res) => {
  const user = await UserModel.findOne({ username: req.params.username });
  if (!user) {
    res.json('feed');
  }
  res.json(user);
})


router.post('/edit',upload.single('file') ,async (req, res) => {

  try {
    const data = jwt.verify(req.headers.token, "ash");
    const uname = data.username;
    const user = await UserModel.findOneAndUpdate({ username: uname }, {
      username: req.body.username,
      name: req.body.name,
      bio: req.body.bio,
      photo:req.file.buffer
    })
    
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, msg: "fail to edit" })
  }

 

})


router.get('/getname', (req, res) => {
  res.json(jwt.verify(req.headers.token, "ash"));
})


router.post("/upload", upload.single('file'), async (req, res) => {
  try {
    const udata = jwt.verify(req.headers.token, "ash");
    const user = await UserModel.findOne({username:udata.username})
    const post =await postModel.create({
      caption:req.body.caption,
      image:req.file.buffer,
      user:user._id
    })
    user.posts.push(post._id);
    await user.save();
    res.json({ success: true , msg:"post uploded successfully"})
  } catch (error) {
    res.json({ success: false, msg: error })
  }

})

router.get('/getallimage', async (req, res) => {
  const data = jwt.verify(req.headers.token, "ash")
  const result = await UserModel.findOne({username:data.username}).populate('posts')

  res.json({ result })
})

router.get('/getimage', async (req, res) => {
  uname = jwt.verify(req.headers.token, "ash");
  try {
    const user = await UserModel.findOne({username:uname.username})
    res.json({ user })
  } catch (error) {
    res.json({success:false , msg:error})
  }
 
})

router.get('/getallposts', async (req, res) => {
  const result = await postModel.find().populate('user');
  res.json({ result })
})



router.post("/search" , async(req,res)=>{
  const regex = RegExp(`^${req.body.name}` , 'i');
  const user = await UserModel.find({username:regex});
  res.json({user});
})
module.exports = router;
