const express=require('express'),
      login=express.Router(),
      signup=express.Router(),
      {User,Friend}=require('./mongo.js'),
      bcrypt=require('bcryptjs');
      
      
//router for login
 login.post('/',async(req,res)=>{
   console.dir(Object.values(req.body));
   if(req.body){
     try{
       let user= await User.findOne({username:req.body.username}).lean();
       if(user){
         //bcrypt to compare the password with password hash
        await bcrypt.compare(req.body.password,user.passwordHash,(error,matched)=>{
           //if an error occured while comparing,throw it
           if(error){throw error;}
           else{
             //storing username in session
             req.session.user=req.body.username;
             return res.json({status:201,authorized:true,userId:user.userId}).end();
           }
         });
       }
       //if username doesn't exist
       else{
         return res.json({status:401,message:'username doesnt exist'}).end();
       }
       }
     catch(error){
       console.log(error);
     }
   }
 });  
 
 
 //router for signup
 signup.post('/',async (req,res)=>{
    console.log('signup called');
   if(req.body){
     try{
     console.log(req.body.username,req.body.password);
     
     //checking if the username already exists!
    if(req.body.username){
      try{
      let doc=await User.findOne({username:req.body.username}).lean();
      if(doc){
        return res.json({status:402,message:'Username already exist'}).end();
      }
        
      }
      catch(error){
        console.log(error);
      }
        
    }
     
     //creating password hash
    await bcrypt.hash(req.body.password,10,async (error,hash)=>{
       if(error)throw error;
       else{
         
         //creating a new User document
         let user = await User.create({
           username: req.body.username,
           passwordHash: hash
         });
         //saving the user document
         await user.save();
         
         //creating the friend document
         let friend=await Friend.create({
           username:user.username,
           userId:user.userId,
           profilePic:user.profilePic
         });
         
         //saving the friend document
         await friend.save();
         
         console.log(user);
         req.session.user = user.username;
         return res.json({ status: 201, authorized: true, userId: user.userId }).end();
       }
     });
   }
     catch(error){
       console.log(error);
       return res.json({status:401,message:error.toString()}).end();
     }
   }
 });
 
 
 const auth=(req,res,next)=>{
   if(req.session.user){
     next();
   }
   else{
     res.redirect('/signup');
   }
 }
 
 module.exports={login,signup,auth};