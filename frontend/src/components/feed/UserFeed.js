import { UserContext } from "../../UserContext";
import axios from "axios";
import { useContext, useEffect, useState, useCallback } from "react";
import Post from "../posts/Post";
import FeedComment from "../comments/FeedComment";
import Modal from "../posts/PostModal";
import { Button, Card, Container } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";

export default function UserFeed() {
  const [feed, setFeed] = useState(null);
  const { userVal, tokenVal } = useContext(UserContext);
  const [token] = tokenVal;
  const [modal, setModal] = useState(false);
  const [headers, setHeaders] = useState({});
  const [user] = userVal;
  const [activeItem, setActiveItem] = useState({});
  let v = 0;

  const fetchPostsAndComments = useCallback(async () => {
    let this_token = localStorage.getItem("token");
    let config = {
      headers: {
        Authorization: `Token ${this_token}`,
      },
    };
    setHeaders(config);
    if (token && user) {
      await axios.get("/api/feed/recent", config).then((res) => {
        setFeed(res.data);
      });
    }
  }, [token, user]);

  useEffect(() => {
    let config = {
      headers: {
        Authorization: `Token ${token}`,
      },
    };
    setHeaders(config);
  }, [token]);

  useEffect(() => {
    fetchPostsAndComments();
  }, [fetchPostsAndComments]);

  const toggleModal = () => {
    setModal(!modal);
  };
  const submitPost = async (item) => {
    await axios
      .post("/api/post/create/", item, headers)
      .then(() => {
        toggleModal();
        window.location.reload(false);
      })
      .catch(() => alert("Error creating your post. Please try again."));
  };
  const createItem = () => {
    const item = {
      fight: null,
      content: "",
      comments: [],
      owner: user.id,
      username: user.username,
    };
    setActiveItem(item);
    toggleModal();
  };
  const renderCreatePost = () => {
    return (
      <div className="text-center">
        <Button size="lg" color="primary" onClick={createItem}>
          <FontAwesomeIcon icon={faPencilAlt} />
          {" Create Post"}
        </Button>
      </div>
    );
  };

  const renderPosts = () => {
    console.log("render posts v=" + v);
    v++;
    return feed.map((item, i) => (
      <div key={i}>
        {item.comment_count != null ? (
          // if the item contains a "comment_count" field, it is a post
          <Post
            post={item}
            updateStateFunction={() => window.location.reload(false)}
          />
        ) : (
          // and if it doesn't... it is definitely a comment
          <FeedComment comment={item} contextButton={true} />
        )}
        <hr />
      </div>
    ));
  };

  return (
    <>
      <Container>
        {renderCreatePost()}

        <Card className="p-3 m-3">
          {user && user.following.length === 0 ? (
            <p className="text-center p-3 m-3">
              Welcome to your feed! Follow somebody to see their posts here.
            </p>
          ) : null}
          <div>
            {feed && feed.length > 0
              ? renderPosts()
              : "nothing to see here... make a post!"}
          </div>
        </Card>
      </Container>

      {modal ? (
        <Modal
          activeItem={activeItem}
          toggle={toggleModal}
          onSave={submitPost}
          autoFocus={false}
        />
      ) : null}
    </>
  );
}
