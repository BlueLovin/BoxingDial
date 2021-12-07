import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom/cjs/react-router-dom.min";
import { UserContext } from "../../UserContext";
import Post from "../../components/posts/Post";
import Fight from "../../components/fights/Fight";
import PostModal from "../../components/modals/PostModal";
import { Button } from "reactstrap";

export default function FightPage() {
  const params = useParams();
  const fightID = params.fightID;

  const { loggedInVal, userVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;
  const [modal, setModal] = useState(false);
  const [fightData, setFightData] = useState();
  const [postList, setPostList] = useState();
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState({
    fight: null,
    content: "",
  });

  const fetchFightData = useCallback(async () => {
    setLoading(true);
    let data = {};
    //fetch fight data
    if (loggedIn) {
      await axios.get(`/api/fights/${fightID}/`, headers).then((res) => {
        data = res.data;
      });
    } else {
      await axios.get(`/api/fights/${fightID}/`).then((res) => {
        data = res.data;
      });
    }
    setFightData(data); // set local fight object
    setPostList(data.posts);
    setLoading(false);
  }, [fightID, loggedIn, headers]);

  useEffect(() => {
    fetchFightData();
  }, [fetchFightData]);

  const removePostFromFeed = (post) => {
    setPostList((list) => list.filter((p) => post !== p));
  };

  const renderPosts = () => {
    return postList.map((post) => (
      <div key={post.id}>
        <Post
          post={post}
          removePostFromParentList={() => removePostFromFeed(post)}
        />{" "}
        <br />
      </div>
    ));
  };
  const toggle = () => {
    setModal(!modal);
  };
  const submitPost = async (item) => {
    toggle();

    await axios
      .post("/api/post/create/", item, headers)
      .then((res) => setPostList((p) => [res.data, ...p]));
  };
  const createItem = () => {
    const item = {
      fight: fightData.id,
      content: "",
      comments: [],
      owner: user.id,
      username: user.username,
    };
    setActiveItem(item);
    setModal(!modal);
  };
  const renderCreatePost = () => {
    if (!user) {
      return (
        <div>
          <h3 className="text-center">
            <Link to={"/login/"}>Login</Link> to make a post
          </h3>
        </div>
      );
    } else {
      return (
        <div className="text-center">
          <Button size="lg" color="primary" onClick={createItem}>
            Create Post
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <br />
      {loading ? (
        "loading"
      ) : (
        <>
          <div className="container w-75 bg-light bg-gradient preserve-line-breaks">
            <Fight fightData={fightData} />
            <br />
            {renderCreatePost()}
            <hr />
            <h4 className="text-center">{fightData.posts_count} Posts</h4>
            <br />
            {renderPosts()}
          </div>
          {modal ? (
            <PostModal
              activeItem={activeItem}
              toggle={toggle}
              onSave={submitPost}
              autoFocus={false}
            />
          ) : null}
        </>
      )}
    </>
  );
}
