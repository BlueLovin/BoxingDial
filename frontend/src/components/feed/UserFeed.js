import { UserContext } from "../../UserContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Post from "../posts/Post";
import RecentFights from "../fights/RecentFights";
import { Card, Container } from "reactstrap";

export default function UserFeed() {
  const [postList, setPostList] = useState();
  const { userVal } = useContext(UserContext);
  const [user] = userVal;

  const fetchPostList = async () => {
    let token = localStorage.getItem("token");
    let config = {
      headers: {
        Authorization: `Token ${token}`,
      },
    };
    if (token) {
      await axios
        .get("/api/feed", config)
        .then((res) => setPostList(res.data))
        .catch(() => console.log("invalid token"));
    }
  };

  useEffect(() => {
    fetchPostList();
  }, []);

  const renderPosts = () => {
    console.log("post list = " + postList);
    if (user && user.following.length == 0) {
      //link here to see all the users of the site?
      return (
        <p className="text-center">
          Follow somebody to get their posts here on your feed.
        </p>
      );
    }
    if (postList) {
      return postList.map((post, i) => (
        <div key={i}>
          <Post post={post} />
          <br />
        </div>
      ));
    }
  };

  return (
    <>
      <Container>
        <Card className="p-3 m-3">
          <h3 className="text-center">User Feed</h3>
          <div>{postList ? renderPosts() : "loading"}</div>
        </Card>
      </Container>
    </>
  );
}
