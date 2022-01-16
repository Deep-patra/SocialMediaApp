/*let Post=async function(url,data){
  return await fetch(url,{
    method:'POST',
    mode:'no-cors',
    referrerPolicy:'no-referrer',
    body:JSON.stringify(data)
  });
}
let Get=async function(url){
  return await fetch(url,{
    method:'GET'
  })
}

export { Post, Get};*/
const headers={"Content-Type":"application/json","Accept":"application/json"};

export default class API{
  //method to get authentication
  static getAuth=async ()=>{
    let response=await fetch('/auth',{
      method:'GET'
    });
    return response.json();
  }
  //method for sending username and password for login
  static login=async(data)=>{
    let response=await fetch('/login',{
      method:'POST',
      headers:headers,
      body:JSON.stringify(data)
    });
    return response.json();
  }
  //method for signup
  static signup=async(data)=>{
    let response=await fetch('/signup',{
      method:'POST',
      headers:headers,
      body:JSON.stringify(data)
    });
    return response.json();
  }
  //method to get User Data
  static getUserData=async()=>{
    let response=await fetch(`/user-data`,{
      method:'GET'
    });
    return response.json();
  }
  //method to get messages form the server
  static getMessages=async(url)=>{
    let response=await fetch(url,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "Accept":"application/json"
      }
    });
    return response.json();
  }
  //method to get post from the server
  static getPosts=async()=>{
    let response=await fetch(`/posts`,{
      method:'GET'
    });
    return response.json();
  }
  //method to post users posts
  static sendPost=async(post)=>{
    let response=await fetch(`/posts`,{
      method:'POST',
      headers:headers,
      body:JSON.stringify({post:post})
    });
    return response.json();
  }
  //method to gey a list of friends 
  static getFriends=async()=>{
    let response=await fetch(`/friends`,{
     method:'GET'
    });
    return response.json();
  }
  //method to get comments for the post
  static getComments=async(postId)=>{
    let response=await fetch(`/post/comments/${postId}`,{
      method:'GET'
    });
    return response.json();
  }
  //method to post comment
  static postComment=async(postId,comment)=>{
    let response=await fetch(`/posts/comments/${postId}`,{
      method:'POST',
      headers:headers,
      body:JSON.stringify(comment)
    });
    return response.json();
  }
  static changeProfilePic=async(image)=>{
    let response=await fetch(`/change-profile-pic`,{
      method:'POST',
      headers:headers,
      body:JSON.stringify({profilePic:image})
    });
    return response.json();
  }
  static changeUsername=async(username)=>{
    let response=await fetch(`/change-username`,{
      method:'POST',
      headers:headers,
      body:JSON.stringify({usename:username})
    });
    return response.json();
  }
  //method  to logout 
  static logout=async ()=>{
    let response=await fetch('/logout');
    return response.json();
  }
  //method to search for a username
  static search=async (obj)=>{
    let response=await fetch('/search',{
      method:'POST',
      headers:headers,
      body:JSON.stringify(obj)
    });
    return response.json();
  }
  static sendReq=async (obj)=>{
    let response=await fetch('/sendRequest',{
      method:'POST',
      headers:headers,
      body:JSON.stringify(obj)
    });
    return response.json();
  }
  static cancelReq=async (obj)=>{
    let response=await fetch('/friend_Request/cancel',{
      method:'POST',
      headers:headers,
      body:JSON.stringify(obj)
    });
    return response.json();
  }
  static getRequests=async ()=>{
    let response=await fetch('/friend_Request',{
      method:'GET'
    });
    return response.json();
  }
  static acceptReq=async (user)=>{
    let response=await fetch('/friend_Request/accept',{
      method:'POST',
      headers:headers,
      body:JSON.stringify(user)
    });
    return response.json();
  }
}