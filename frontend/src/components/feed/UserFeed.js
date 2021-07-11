import { UserContext } from "../../UserContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Post from "../posts/Post";
import { Card, Container } from "reactstrap";

export default function UserFeed(){
  const [postList, setPostList] = useState();

  const fetchPostList = async () => {
    console.log("fetch post list")
    let token = localStorage.getItem("token");
    let config = {
      headers: {
        Authorization: `Token ${token}`
      }
    };
    if(token){
      console.log("token is " + token)
    await axios.get('/api/feed', config)
      .then((res) => setPostList(res.data))
    }
  };

  useEffect(() => {
      fetchPostList();
  }, []);


  const renderPosts = () => {
    console.log("post list = " + postList);
    if(postList){
      return postList.map((post) => (
        <>
          <Post post={post} />
          <br/>
        </>
      ));
    }
  }
  
  return(
    <>
      <Container>
        <Card className="p-3 m-3">
          <h3 className="text-center">User Feed</h3>
          <div>
            {postList ? renderPosts() : "loading"}
          </div>
        </Card>
      </Container>
    </>
  );
}