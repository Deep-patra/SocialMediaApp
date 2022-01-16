const express=require('express'),
      {User,Friend,Chat,Message}=require('./mongo.js');
      
      
const friendRouter=express.Router();

friendRouter.route('/')
.get(async(req,res)=>{
  try{
    const user=req.session.user;
    let friendDoc=await User.findOne({username:user}).lean();
    console.dir(friendDoc.friends);
    return res.json({
      status:201,
      friends:friendDoc.friends
    }).end();
  }
  catch(error){
    console.log(error);
    return res.json({status:401,message:'error occured while fetching friends data'}).end();
  }
});

module.exports={friendRouter};