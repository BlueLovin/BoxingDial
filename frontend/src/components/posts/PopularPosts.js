import axios from "axios";
import { Container } from "reactstrap";
import { useEffect, useState } from "react";
import Post from "./Post";

export default function PopularPosts() {
  const [postList, setpostList] = useState([]);

  useEffect(() => {
    refreshPostList();
  }, []);

  const refreshPostList = () => {
    axios
      .get("/api/posts/popular")
      .then((res) => setpostList(res.data))
      .catch((err) => console.log(err));
  };
  const renderPosts = () => {
    return postList.slice(0, 5).map((post) => (
      <div key={post.id}>
        <Post post={post} />
        <hr />
      </div>
    ));
  };
  return (
    <>
      <Container className="recentContainer">
        <div className="card p-3">
          <h4 className="text-center">Popular Posts</h4>
          {renderPosts()}
        </div>
      </Container>
    </>
  );
}
