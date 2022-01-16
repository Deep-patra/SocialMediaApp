"use strict";
const express=require('express'),
      mongoose=require('mongoose'),
      {User,Post,Comment}=require('./mongo.js');
      

const postRouter=express.Router();

//router for posts
postRouter.route('/')
  .get(async (req,res)=>{
    //console.log('Recieved:',req.params.userId);
    try{
    let user=req.session.user;
   let doc=await User.findOne(
     {username:user}
     ).exec();
     if (doc.posts != null) {
       console.log('posts:', doc.posts);
       return res.json({
         status: 201,
         posts: doc.posts
       }).end();
     }
     else {
       return res.json({
         status: 201,
         posts: []
       });
     }
    }
    catch(error){
      console.log(error);
      return res.json({
        status:404,
        message:'Some error has occured while fetching posts in the database'
      })
    }
    
  })
  .post(async (req,res)=>{
    console.log('post method in Post is called',req.body.post);
    let post=req.body.post;
    let postDoc;
    let user=req.session.user
    try{
        postDoc=await Post.create({
        author:post.author,
        text:post.text,
        images:post.images,
        author_pic:post.author_pic,
        author_id:mongoose.Types.ObjectId(post.author_id)
      })
      await postDoc.save();
      console.log('post:',postDoc.postId);
      let userDoc = await User.findOneAndUpdate({ userId: mongoose.Types.ObjectId(post.author_id) }, { $push: { posts: postDoc } });
      await userDoc.save();
      
      //sending the response
      res.json({
        status:201,
        post:{
          author:postDoc.author,
          postId:postDoc.postId,
          text:postDoc.text||'',
          images:postDoc.images||[],
          author_id:postDoc.author_id,
          author_pic:postDoc.author_pic
        }
      }).end();
      
      await userDoc.friends.map(friend=>{
         User.findOneAndUpdate({userId:mongoose.Types.ObjectId(friend.userId)},{$push:{posts:postDoc}},(err,doc)=>{
          if(err){console.log(err)}
          else{doc.save();}
        });
      })
    }
    catch(error){
      console.log(error);
      return res.json({status:404,message:'Some error has occured while storing post'})
    }
  });
 
 //router for comments 
  
  postRouter.route('/comments/:postId')
  .get(async(req,res)=>{
    try{
      let postDoc=await Post.findOne({postId:mongoose.Types.ObjectId(req.params.postId)}).lean();
      console.log(postDoc.comments);
      return res.json({status:201,comments:postDoc.comments}).end();
    }
    catch(error){
      console.log(error);
      return res.json({status:404,message:"Some error occured while fetching comments for this post"}).end();}
  })
  .post(async(req,res)=>{
    try{
      let comment=await Comment.create({
        author:req.body.author,
        text:req.body.text
      });
      comment.save();
      let postDoc=await Post.findOneAndUpdate({postId:mongoose.Types.ObjectId(req.params.postId)},{$push:{comments:Comment}});
      
      await postDoc.save();
      return res.json({status:201});
    }
    catch(error){
      console.log(error);
      return res.json({status:404,message:'error occured while posting comment'}).end();
    }
  });
  
  
  module.exports={postRouter};