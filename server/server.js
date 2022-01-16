const http=require('http'),
      express=require('express'),
      path=require('path'),
      logger=require('morgan'),
      session=require('express-session'),
      MongoDBStore=require('connect-mongodb-session')(session),
      post=require('./postRouter.js'),
      friend=require('./friendRouter.js'),
      websocket=require('./websocket.js'),
      {User,Friend}=require('./mongo.js'),
      search=require('./searchRouter.js'),
      friendRequest=require('./friendRequest.js')
      authenticate=require('./authenticate.js');
      
let app=express();

const server=http.createServer(app);


const store=new MongoDBStore({
  uri:'mongodb://127.0.0.1:27017/test',
  databaseName:'test',
  collections:'my-session',
  connectionsOptions:{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    serverSelectionTimeoutMS:10000
  }
});

store.on('error',(error)=>{console.log(error)});

//session variable
const sess = {
  secret: process.env.SECRET || 'this is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 //expiration date one week
  },
  store: store,
  resave: true,
  saveUninitialized: true
};


app.set('port',process.env.PORT||3000);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session(sess));
app.use(logger('short'));

app.use('/',express.static(path.join(__dirname,'../static')));

//middleware to check for authorization 
app.use('/auth',async (req,res)=>{
  let doc=await User.findOne({username:req.session.user}).lean();
  if(doc){
    res.locals.user=req.session.user;
    return res.json({status:201}).end();
  }
  else{return res.json({status:401}).end();}
});

//middleware to send users data
app.use('/user-data',async(req,res)=>{
  let username=req.session.user;
  console.log(username);
  try{
  let user=await User.findOne({username:username}).lean();
  console.log(Object.keys(user),Object.values(user));
  return res.json({
    status:201,
    username:user.username,
    profilePic:user.profilePic,
    userId:user.userId
  }).end();
  }
  catch(error){
    console.log(error);
    return res.json({status:401,message:'data cant be fetched'}).end();
  }
  
});

//Middleware for login
app.use('/login',authenticate.login);

//Middleware for Signup
app.use('/signup',authenticate.signup);

//middleware for handling Post requests
app.use('/posts',authenticate.auth,post.postRouter);

//middleware for handling /friends url requests
app.use('/friends',authenticate.auth,friend.friendRouter);

//middleware to getFriendRequests
app.use('/friend_Request',authenticate.auth,friendRequest.router);

//middleware to send friend Requests
app.use('/sendRequest',async(req,res)=>{
  console.log('send Request called',req.body);
  try{
    if(req.body){
      let user=await User.findOne({username:req.body.username});
      let friend=await Friend.create({
        username:user.username,
        profilePic:user.profilePic,
        userId:user.userId
      });
      
      //pushing the friend in to the friend's received Request array   
      user.receivedRequest.push(friend);
      await user.save();
      await friend.save();
      
      //pushing the friend in to the user's sent received array
      let doc=await User.findOne({username:req.session.user});
      doc.sendRequest.push(friend);
      await doc.save();
      
      
      return res.json({status:201}).end();
     }
  }
  catch(error){
    console.log(error);
    return res.json({status:401,message:'Username doent exist'}).end();
  }
});

//middleware to change the profile picture
app.use('/change-profile-pic',async (req,res)=>{
  try{
    if(!req.body.profilePic) console.log('req body is empty');
    else{
      let user=await User.findOne({username:req.session.user});
    //assigning profilepic to User document 
      user.profilePic=req.body.profilePic;
      
    //saving the document changes
     await user.save();
     let friend=await Friend.findOne({username:req.session.user});
     
     //assigning profile pic to friend document
     friend.profilePic=req.body.profilePic;
     
     //saving the friend doc
     await friend.save();
     return res.json({status:201}).end();
    }
  }
  catch(error){
    console.log(error);
    return res.json({status:401,message:'Some ERROR! cannot change profile picture'})
  }
});


//middlware for pathname '/search
app.use('/search',authenticate.auth,search.router);

//middleware for logout 
app.use('/logout',(req,res)=>{
  req.session.destroy();
  res.json({status:201});
});

//initializing websocketserver
websocket.initializeServer(server);

//app listening on port 3000
server.listen(app.get('port'),()=>{
  console.log('app is listening on port',app.get('port'));
});