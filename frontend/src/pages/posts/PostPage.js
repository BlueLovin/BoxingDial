import React, { useEffect, useState, useContext, useCallback } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { Button, FormGroup, Input, Container } from "reactstrap";
import Post from "../../components/posts/Post";
import Comment from "../../components/comments/Comment";
import PostLikesModal from "../../components/modals/PostLikesModal";

export default function Comments() {
  const params = useParams();
  const postID = params.id;

  const [commentList, setCommentList] = useState([]);

  

  const { loggedInVal, userVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;
  const [modal, setModal] = useState(false);
  const history = useHistory();

  const [currentPost, setCurrentPost] = useState({
    content: "",
  });
  const [activeItem, setActiveItem] = useState({
    post: postID,
    content: "",
    owner: user ? user.id : null,
  });

  const toggleModal = () => {
    setModal(!modal);
  };

  //get post WITH auth headers
  const getLoggedInPost = useCallback(async () => {
    await axios
      .get(`/api/posts/${postID}/`, headers) // get current post
      .then((res) => {
        setCurrentPost(res.data);
        setCommentList(res.data.comments);
      })
      .catch(() => history.push("/404"));
  }, [postID, history, headers]);

  //get post WITHOUT auth headers
  const getLoggedOutPost = useCallback(async () => {
    await axios
      .get(`/api/posts/${postID}/`)
      .then((res) => {
        setCurrentPost(res.data);
        setCommentList(res.data.comments);
      })
      .catch(() => history.push("/404"));
  }, [postID, history]);

  useEffect(() => {
    if (loggedIn !== null) {
      console.log("logged in val = " + loggedIn);
      //LOGGED OUT
      if (!loggedIn) {
        getLoggedOutPost();
      }
      // LOGGED IN
      if (loggedIn) {
        getLoggedInPost();
      }
    }
  }, [getLoggedInPost, getLoggedOutPost, loggedIn]);

  var handleChange = (e) => {
    let { name, value } = e.target;

    const item = {
      post: postID,
      [name]: value,
      username: user ? user.username : "null",
      owner: user ? user.id : null,
    };
    setActiveItem(item);
  };

  const submitComment = (item) => {
    axios // create
      .post("/api/comments/", item, headers)
      .then(() => getLoggedInPost());

    setActiveItem({
      // RESET TEXT BOX
      post: postID,
      content: "",
    });
  };

  const renderPost = (post) => {
    return (
      <>
        {post.content ? (
          <Post
            post={post}
            fullPostPage={true}
            toggleModal={() => toggleModal()}
          />
        ) : (
          "loading"
        )}
      </>
    );
  };

  const renderCommentInput = () => {
    if (user) {
      return (
        <div className="list-group-item text-center align-items-center p-5">
          <h4>share your thoughts</h4>

          <FormGroup>
            <Input
              type="textarea"
              name="content"
              value={activeItem.content}
              onChange={handleChange}
            />
          </FormGroup>

          <Button color="success" onClick={() => submitComment(activeItem)}>
            Post
          </Button>
        </div>
      );
    } else {
      return (
        <div className="list-group-item text-center align-items-center p-5">
          <h4>
            Please <Link to={`/login/`}>login</Link> to post a comment
          </h4>
        </div>
      );
    }
  };

  const renderComments = () => {
    return commentList.map((comment, i) => (
      <Comment
        comment={comment}
        updateStateFunction={getLoggedInPost}
        key={i}
      />
    ));
  };

  return (
    <div>
      <br />
      {currentPost ? (
        <>
          {renderPost(currentPost)}
          <Container>
            <div className="h3 text-info font-weight-bold">
              <br />
              {currentPost.comment_count !== null
                ? `${currentPost.comment_count} comments`
                : "loading"}
            </div>
            <br />
            {renderCommentInput()}
          </Container>
          <br />
          <div>{commentList != null ? renderComments() : null}</div>
          {modal ? (
            <PostLikesModal toggle={toggleModal} postID={postID} />
          ) : null}
        </>
      ) : (
        "loading"
      )}
    </div>
  );
}
