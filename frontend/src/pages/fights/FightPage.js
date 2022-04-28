import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom/cjs/react-router-dom.min";
import { UserContext } from "../../context/UserContext";
import Post from "../../components/posts/Post";
import Fight from "../../components/fights/Fight";
import PostModal from "../../components/modals/PostModal";
import { Button } from "reactstrap";

export default function FightPage() {
  // props
  const params = useParams();
  const fightID = params.fightID;

  // context
  const { userVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;

  // state
  const [modal, setModal] = useState(false);
  const [fight, setFight] = useState({});
  const [postCount, setPostCount] = useState(0);
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState({
    fight: null,
    content: "",
  });

  useEffect(() => {
    setLoading(true);
    axios.get(`/fights/${fightID}/`, headers).then((res) => {
      const data = res.data;
      setFight(data);
      setPostList(data.posts);
      setLoading(false);
      setPostCount(data.posts_count);
    });
  }, [fightID, headers]);

  const removePostFromFeed = (post) => {
    setPostList((list) => list.filter((p) => post !== p));
    setPostCount((c) => c - 1);
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

  const toggle = () => setModal(!modal);

  const submitPost = (item) => {
    toggle();
    axios
      .post("/post/create/", item, headers)
      .then((res) => setPostList((p) => [res.data, ...p]))
      .then(() => setPostCount((c) => c + 1));
  };

  const createItem = () => {
    const item = {
      fight: fight.id,
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
            <Fight fightData={fight} />
            <br />
            {renderCreatePost()}
            <hr />
            <h4 className="text-center">{postCount} Posts</h4>
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
