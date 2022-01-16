const express=require('express'),
      {User,Friend}=require('./mongo.js'),
      router=express.Router();
      
router.route('/')
.get(async(req,res)=>{
  try{
    //fetching data from the database
    let user=await User.findOne({username:req.session.user}).lean();
   
    //sending response to the client
    res.json({
      status:201,
      request:{
        sent:user.sendRequest||[],
        received:user.receivedRequest||[]
      }
    }).end();
  }
  
  catch(error){
    console.log(error);
    res.json({status:401,message:'an error occured while fetching friend requests'}).end();
  }
});
router.route('/accept')
.post(async(req,res)=>{
  try{
    let user=await User.findOne({username:req.session.user});
    if(user){
      let receivedRequest=user.receivedRequest;
      let acceptUser=null;
      await receivedRequest.map((item,index)=>{
        if(item.username==req.body.username){
          acceptUser=receivedRequest[index];
          let id=receivedRequest[index]._id;
          user.receivedRequest.id(id).remove();
          user.friends.push(acceptUser);
        }
      });
     await user.save();
    }
    return res.json({status:201}).end();
  }
  catch(error){
    console.log(error);
    return res.json({status:401}).end();
  }
});

router.route('/cancel')
.post(async (req,res)=>{
  try{
    console.log(req.body.username);
    let user=await User.findOne({username:req.session.user});
    
    let sendRequest=user.sendRequest;
    await sendRequest.map((item,index)=>{
      if(item.username==sendRequest[index].username){
        let id=sendRequest[index]._id;
      user.sendRequest.id(id).remove();
      }
    });
    await user.save();
    return res.json({status:201}).end();
  }
  catch(error){
    console.log(error);
    res.json({status:401,message:'some error in the server!'}).end();
  }
});



module.exports={router};