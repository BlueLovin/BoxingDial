import axios from "axios";
import { Container } from "reactstrap";
import { useEffect, useState } from "react";
import Post from "./Post";

export default function RecentPosts() {
  const [postList, setpostList] = useState([]);

  useEffect(() => {
    refreshPostList();
  }, []);

  const refreshPostList = async () => {
    await axios
      .get("/api/posts/")
      .then((res) => setpostList(res.data))
      .catch((err) => console.log(err));
  };
  const renderPosts = () => {
    return postList
      .slice(0)
      .reverse()
      .slice(0, 3)
      .map((post) => (
        <>
          <Post post={post} />
          <hr />
        </>
      ));
  };
  return (
    <>
      <Container className="recentContainer">
        <div className="card p-3">
          <h4 className="text-center">Recent Posts</h4>
          {renderPosts()}
        </div>
      </Container>
    </>
  );
}