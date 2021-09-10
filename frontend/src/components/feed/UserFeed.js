import { UserContext } from "../../UserContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Post from "../posts/Post";
import FeedComment from "../comments/FeedComment";
import Modal from "../posts/PostModal";
import { Button, Card, Container } from "reactstrap";

export default function UserFeed() {
  const [feed, setFeed] = useState(null);
  const { userVal } = useContext(UserContext);
  const [modal, setModal] = useState(false);
  const [headers, setHeaders] = useState({});
  const [user] = userVal;
  const [activeItem, setActiveItem] = useState({});

  const fetchPostsAndComments = async () => {
    let token = localStorage.getItem("token");
    let config = {
      headers: {
        Authorization: `Token ${token}`,
      },
    };
    setHeaders(config);
    if (token) {
      await axios.get("/api/feed/recent", config).then((res) => {
        setFeed(res.data);
      });
    }
  };

  useEffect(() => {
    fetchPostsAndComments();
  }, []);

  const toggleModal = () => {
    setModal(!modal);
  };
  const submitPost = async (item) => {
    await axios
      .post("/api/post/create/", item, { headers: headers })
      .then(() => {
        toggleModal();
        fetchPostsAndComments();
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
          Create Post
        </Button>
      </div>
    );
  };

  const renderPosts = () => {
    //logged in, not following anybody feed
    if (user && user.following.length === 0) {
      //link here to see all the users of the site?
      //maybe an explore page?
      return (
        <p className="text-center p-3 m-3">
          Welcome to your feed! Follow somebody to see their posts here.
        </p>
      );
    }

    if (feed) {
      // the following ternary is
      // to determine if the current item
      // is a post or a comment.
      return feed.map((item, i) => (
        <div key={i}>
          {/* if the item contains a "comment_count" field, it is a post */}
          {item.comment_count != null ? (
            <Post post={item} updateStateFunction={fetchPostsAndComments} />
          ) : (
            <FeedComment comment={item} user={user} contextButton={true} />
          )}
          <hr />
        </div>
      ));
    }
  };

  return (
    <>
      <Container>
        {renderCreatePost()}
        <Card className="p-3 m-3">
          <div>{feed ? renderPosts() : "loading"}</div>
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
