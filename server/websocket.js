const WebSocket=require('ws'),
      {User,Post,Chat,Message}=require('./mongo.js'),
      url=require('url');
  
const initializeServer=(server)=>{

class Clients{
  constructor(){
    this.clientList={};
    this.save=this.saveClient;
  }
  saveClient=(username,client)=>{
    this.clientList[username]=client;
  }
  deleteClient=(username)=>{
    delete this.clientList[username];
  }
}

let clients=new Clients();
let chatclients=new Clients();
let videoClients=new Clients();

/*****all websockets instances******/
const wss1=new WebSocket.Server({noServer:true}),
      wss2=new WebSocket.Server({noServer:true}),
      wss3=new WebSocket.Server({noServer:true}),
      wss4=new WebSocket.Server({noServer:true}),
      wss5=new WebSocket.Server({noServer:true});
  
/*******functions for whole file*********/
function findClient(username){
  return clients.clientList[username] || false;
}

function findChatClient(username){
  return chatClients.clientList[username] || false;
}
//function to store the message  in the user's database 
async function saveMessage(from,to,msg){
  try{
    let doc=await User.findOne({username:from.username});
    await doc.chat.map((item)=>{
      if(item.friendName==from.username){
        item.messages.push(msg);
      }
    });
    await doc.save();
    let other=await User.findOne({username:to.username});
    await other.chat.map((item)=>{
      if(item.friendName==to.username){
        item.messages.push(msg);
      }
    });
    await other.save();
  }
  catch(error){
    conslole.log(error);
  }
}

async function addLike(post){
  try{
  let postDoc=await Post.findOne({postId:post.postId});
  postDoc.likeCount=postDoc.likeCount+1;
  await postDoc.save();
  let user=await User.findOne({username:post.author}).lean();
  return user.friends;
  }
  catch(error){
    console.log(error);
  }
}
//function to add Dislike to the post
async function addDislike(post){
  try{
    let postDoc=await Post.findOne({postId:post.postId});
    postDoc.dislikeCount=postDoc.dislikeCount+1;
    await postDoc.save();
    let user=await User.findOne({username:post.author}).lean();
    return user.friends
  }
  catch(error){
    console.log(error)
  }
}
/********************websockets servers**********************/

//socket connection for path:'/'
//main socket connection used to push notification
//
//
wss1.on('connection',async(ws)=>{
  console.log('wss1 conncted');
  let user=''
  ws.on('message',(message)=>{
    let msg=null;
      msg=JSON.parse(message);
    
    //adding client in the object
    user=msg.username;
    if(clients.clientList[msg.username]){
      clients.saveClient(msg.username,ws);
    }
    switch(msg.Action){
      case 'LIKE_POST':{
          addLike(msg.post).then(users=>{
          const len=users.length;
          for(let i=0;i<len;i++){
            if(clients.clientList[user[i].username]){
              clients.clientList[uses[i].username].send(message);
            }
          }
          });
        break;
      }
      case 'DISLIKE_POST':{
          addDislike(msg.post).then(users=>{
            const len=users.length;
            for(let i=0;i<len;i++){
              if(clients.clientList[users[i].username]){
                clients.clientList[users[i].username].send(message);
              }
            }
          });
        break;
      }
      default:
        break;
    }
  });
  ws.on('close',()=>{
    clients.deleteClient(user);
  });
});

//socket connection for path:/search
wss5.on('connection',async(ws)=>{
  console.log('wss2 connected');
  
  ws.on('open',()=>{
    console.log('search websocket is open!');
  });
  
  ws.on('message',async (message)=>{
    try{
      let msg=JSON.parse(message);
      
      if(msg.Action=='Check_Username'){
        
        //search the user's list
        let users=await User.find({username:{$regex:msg.username,$options:'i'}});
        
        console.log(users);
        let arr=[];
        users.map((value,index)=>{
          let user={
            username:value.username,
            profilePic:value.profilePic,
            userId:value.userId
          };
          arr.push(user);
        });
     //sending the user's lisy through the websocket 
        ws.send(JSON.stringify({
          Action:'Search_Items',
          Search_Items:arr
        }));
      }
    }
    catch(error){
      console.log(error);
    }
  });
  
  ws.on('close',()=>{
    console.log('search websocket is closed!');
  })
});

//socket connection for path:'/friend/Chat'
wss3.on('connection',async(ws)=>{
  //varaible to store the name of user 
  let user='';
  console.log('wss3 connected');
  ws.on('message',async(data)=>{
    let msg=null;
    try{
      
    msg=JSON.parse(data);
    
  /*  else{
      throw 'message is not an instance of JSON';
    }*/
    console.log(msg);
    const from=msg.message.from;
    const to=msg.message.to;
    //initiaizing the user 
    user=from.username;
    //checking if the username has already stored the client 
    if(!findChatClient(from.username)){
      console.log('saving the client');
      chatClient.saveClient(from.username,ws);
    }
      if(msg.Action=='message'){
        let msg=await Message.create({
          name:from.username,
          text:from.text||'',
          images:from.images||[]
        });
        await msg.save();
        //sending the message through the websockets
        if(chatClients.clientList[to.username] && chatClients.clientList[to.username].readyState===WebSocket.OPEN){
          chatClients.clientList[to.username].send(data);
        }
        else{
          if(clients.clientList[to.username].readyState==WebSocket.OPEN){
            clients.clientList[to.username].send(JSON.stringify({
              Action:'Notification',
              notification:`${from.username} messaged you!`
            }));
          }
        }
        await saveMessage(from,to,msg);
      }
    }
    catch(error){
      console.log(error);
    }
  });
  
  //onclosing the client
  ws.on('close',()=>{
    chatClients.deleteClient(user);
  });
});

//socket connection for path:'/friend/video-chat'
wss4.on('connection',async(ws)=>{
  console.log('wss4 connected');
  ws.on('open',()=>{
    console.log('web Socket for video chat opened');
  })
  ws.on('message',async (message)=>{
    let msg=null;
    console.log(msg);
    
    //parsing the JSON string
      msg=JSON.parse(message);
    
    
    switch(msg.Action){
      case 'Register':{
        videoClients.saveClient(msg.username,ws);
        break;
      }
      case 'Video-Chat-Offer':{
        let friend=msg.friendName;
        
        if(videoClients.clientList[friend]){
         videoClients.clientList[friend].send(message); 
        }
        else{
          if(clients.clientList[friend].readyState==WebSocket.OPEN){
            clients.clientList[friend].send(JSON.stringify({
              Action:'Notification',
              callReceived:{
                username:msg.username
              },
              notification:`${msg.username} is calling for Video chat`
            }));
          }
          else{
            ws.send(JSON.stringify({
              Action:'Status',
              status:false
            }));
          }
        }
        break;
      }
      case 'Video-Chat-Answer':{
        if(videoClients.clientList[friend].readyState==WebSocket.OPEN){
          videoClients.clientList[friend].send(message);
        }
        else{
          ws.send(JSON.stringify({
            Action:'Status',
            status:false
          }));
        }
        break;
      }
      case 'Hang-Up':{
        if(videoClients.clientList[friend].readyState==WebSocket.OPEN){
          videoClients.clientList[friend].send(message);
        }
        break;
      }
      case 'Ice-Candidate':{
        if(videoClients.clientList[friend].readyState==WebSocket.OPEN){
          videoClient.clientList[friend].send(message);
        }
        else{
          ws.send(JSON.stringify({
           Action:'Status',
           status:false
          }));
        }
        break;
      }
      default:break;
    }
  });
  
  ws.on('close',()=>{
    console.log('video chat websocket closed');
    //videoClients.deleteClient()
  })
});

//socket connection for path:'/signup'
wss2.on('connection',async(ws)=>{
  console.log('wss5 connected');
  
  ws.on('open',()=>{
    console.log('client opened',ws);
  })
  
  ws.on('message',async (message)=>{
    let msg=null;
    //parsing the JSON string
      msg=JSON.parse(message);
    console.log(msg);
    try{
      let user=await User.findOne({username:msg.username}).lean();
      if(user){
        ws.send(JSON.stringify({
          Action:'Usertext',
          usertext:'Username already exists!'
        }));
      }
      else{
        ws.send(JSON.stringify({
          Action:'Usertext',
          usertext:'Username is valid'
        }));
      }
    }
    catch(error){
      console.log('error in signup websocket',error);
    }
  });
});


server.on('upgrade',function(req,socket,head){
  console.log('server upgrade called');
  const pathname=url.parse(req.url).pathname;
  switch(pathname){
    case '/main-socket':wss1.handleUpgrade(req,socket,head,(ws)=>{
             wss1.emit('connection',ws,req);    
               });
             break;
   case '/signup':wss2.handleUpgrade(req,socket,head,(ws)=>{
              wss2.emit('connection',ws,req);
             });
             break;
   case '/friends/chat':wss3.handleUpgrade(req,socket,head,(ws)=>{
                 wss3.emit('connection',ws,req);
   }); 
   break;
   case 'friends/video-chat':wss4.handleUpgrade(req,socket,head,(ws)=>{
               wss4.emit('connection',ws,req); 
   });
   break;
   case '/search':wss5.handleUpgrade(req,socket,head,(ws)=>{
     wss5.emit('connection',ws,req);
   });
   break;
   default:socket.destroy();
   break;
  }
});

  
}

module.exports={initializeServer};