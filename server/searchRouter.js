const express=require('express'),
      {User}=require('./mongo.js');
      
const router=express.Router();

router.route('/')
.post(async(req,res)=>{
  try{
    if(!req.body)throw 'body is empty';
    let searchedUser=await User.findOne({username:req.body.username}).lean();
    console.log(searchedUser,req.body.username);
    if(searchedUser!=(null||undefined)){
      return res.json({status:201,searchItems:[{
        username:searchedUser.username,
        userId:searchedUser.userId,
        profilePic:searchedUser.profilePic
      }]}).end();
    }
    else{
      return res.json({status:402,message:'user not found'}).end();
    }
  }
  catch(error){
    console.log(error);
    return res.json({status:401,message:'error occured while searching for the name'}).end();
  }
});

module.exports={router};