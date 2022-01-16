const mongoose=require('mongoose');

//connecting mongoose to mongodb
const mongodbUrl=(process.env.MONGODB_URL)||'mongodb://127.0.0.1:27017';
mongoose.connect(mongodbUrl,{
  useNewUrlParser:true,
  useUnifiedTopology:true,
  useFindAndModify:false
});

const db=mongoose.connection;
db.on('error',console.error.bind(console,'MongoDB Connection Error:'));

//comment schema
const CommentSchema=mongoose.Schema({
  author:{type:String},
  text:{type:String}
});

//message schema
const MessageSchema=mongoose.Schema({
  name:{type:String},
  text:{type:String},
  images:{type:[String],default:[]},
  time:{type:Date,default:Date.now()}
});

//message schema for each friend
const ChatSchema=mongoose.Schema({
  friendName:{type:String},
  friendId:{type:mongoose.ObjectId,required:true},
  messages:[MessageSchema]
});

const FriendSchema=mongoose.Schema({
  userId:{type:mongoose.ObjectId,required:true,default:new mongoose.Types.ObjectId()},
  username:{type:String,required:true},
  profilePic:{type:String}
})

//Post schema
const PostSchema=mongoose.Schema({
  text:{type:String,default:''},
  posted_At:{type:String,default:Date.now()},
  images:{type:[String],default:[]},
  author:{type:String,required:true,default:''},
  author_pic:{type:String},
  author_id:{type:mongoose.ObjectId,required:true},
  postId:{type:mongoose.ObjectId,default:new mongoose.Types.ObjectId()},
  likes:{type:Number,default:0},
  dislikes:{type:Number,default:0},
  numberOfComments:{type:Number,default:0},
  comments:[CommentSchema]
});


//Users Schema
const UserSchema=mongoose.Schema({
  username:{type:String,default:'',required:true,unique:true},
  userId:{type:mongoose.ObjectId,default:new mongoose.Types.ObjectId()},
  passwordHash:{type:String,required:true,unique:true},
  profilePic:{type:String},
  friends:[FriendSchema],
  friendRequest:[FriendSchema],
  sendRequest:[FriendSchema],
  receivedRequest:[FriendSchema],
  posts:[PostSchema],
  active:{type:Boolean},
  chat:[ChatSchema]
});

//methods for UserSchema
UserSchema.static.getUserData=function(name){
  return this.find({username:{$regex:name,$options:'i'}});
}

const User=mongoose.model('Users',UserSchema);
const Post=mongoose.model('Posts',PostSchema);
const Comment=mongoose.model('Comments',CommentSchema);
const Chat=mongoose.model('Chat',ChatSchema);
const Message=mongoose.model('Message',MessageSchema);
const Friend=mongoose.model('Friend',FriendSchema);


module.exports={User,Post,Comment,Chat,Message,Friend};
