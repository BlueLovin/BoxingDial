import { UserContext } from "../../UserContext";
import axios from "axios";
import { useContext, useEffect, useState, useCallback } from "react";
import Post from "../posts/Post";
import { FeedComment } from "../comments/FeedComment";
import PostModal from "../modals/PostModal";
import { Button, Card, Container } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";

export default function UserFeed() {
  const [feed, setFeed] = useState(null);
  const { userVal, loggedInVal, headersVal } = useContext(UserContext);
  const [loggedIn] = loggedInVal;
  const [modal, setModal] = useState(false);
  const [headers] = headersVal;
  const [user] = userVal;
  const [activeItem, setActiveItem] = useState({});

  const fetchPostsAndComments = useCallback(() => {
    if (loggedIn) {
      axios.get("/feed/recent", headers).then((res) => {
        setFeed(res.data);
      });
    }
  }, [loggedIn, headers]);

  useEffect(() => {
    fetchPostsAndComments();
  }, [fetchPostsAndComments]);

  const toggleModal = () => {
    setModal(!modal);
  };
  const submitPost = (item) => {
    axios
      .post("/post/create/", item, headers)
      .then((res) => {
        toggleModal();
        console.log(res.data);
        setFeed((f) => [res.data, ...f]);
      })
      .catch((err) => alert(err.response.data.error));
  };
  const createItem = () => {
    const item = {
      fight: null,
      content: "",
      comments: [],
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
  const removePostFromView = (item) => {
    setFeed(feed.filter((i) => item !== i));
  };

  const renderPosts = () => {
    if (feed && feed.length > 0) {
      return feed.map((item) => (
        <div key={item.id}>
          {item.comment_count != null ? (
            // if the item contains a "comment_count" field, it is a post
            <Post
              key={item.id}
              post={item}
              removePostFromParentList={() => removePostFromView(item)}
            />
          ) : (
            // and if it doesn't... it is definitely a comment
            <FeedComment
              key={item.id}
              comment={item}
              removeCommentFromParentList={() => removePostFromView(item)}
            />
          )}
          <hr />
        </div>
      ));
    } else {
      return "nothing to see here... make a post!";
    }
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
          <div>{renderPosts()}</div>
        </Card>
      </Container>

      {modal ? (
        <PostModal
          activeItem={activeItem}
          toggle={toggleModal}
          onSave={submitPost}
          autoFocus={false}
        />
      ) : null}
    </>
  );
}
