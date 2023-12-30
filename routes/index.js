var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

const UserModel = require("./user.js");
const postModel = require("./post.js");
const upload = require('./multer.js');

/* GET home page. */

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
  const user = await UserModel.findOne({ username: username });
  if (!user) {
    res.json({ success: false, msg: "invalid credentials" });
  }
  else {
    const flag = await bcrypt.compare(password, user.password);
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
    const previousimg = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'userimage/',
    });
    await cloudinary.uploader.destroy(previousimg.resources[0].public_id);
  } catch (error) {
    console.log('nhi delte hui');
  }

  try {
    const data = jwt.verify(req.headers.token, "ash");
    const uname = data.username;
    const user = await UserModel.findOneAndUpdate({ username: uname }, {
      username: req.body.username,
      name: req.body.name,
      bio: req.body.bio
    })
    
    const imgdata = await cloudinary.uploader.upload('https://i.pinimg.com/236x/43/08/3f/43083fd41edf5324b23804a83278605e.jpg', { folder: 'userimage', })
    user.photo = imgdata.secure_url;
    await user.save();
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
    const data = await cloudinary.uploader.upload('https://i.pinimg.com/236x/14/73/b1/1473b14608da6a0747691ffacb113180.jpg', { folder: 'posts', })
    const user = await UserModel.findOne({username:udata.username})
    const post =await postModel.create({
      caption:req.body.caption,
      image:data.secure_url,
      publicId:data.public_id,
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
  const result = await postModel.find().populate('user')

  res.json({ result })
})

module.exports = router;
