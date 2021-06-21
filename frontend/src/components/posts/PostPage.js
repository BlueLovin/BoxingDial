import React, { useEffect, useState, useContext, useCallback } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { Button, FormGroup, Input, Container } from "reactstrap";
import Post from "./Post";
import Comment from "../comments/Comment";

export default function Comments() {
  const params = useParams();
  const postID = params.id;

  const [commentList, setCommentList] = useState([]);

  const [currentPost, setCurrentPost] = useState({
    content: "",
  });

  const { tokenVal, userVal } = useContext(UserContext);
  const [token] = tokenVal;
  const [user] = userVal;
  const [activeItem, setActiveItem] = useState({
    post: postID,
    content: "",
    owner: user ? user.id : null,
  });
  const history = useHistory();

  const getPost = useCallback(async () => {
    await axios
      .get("/api/posts/" + postID) // get current post
      .then((res) => {
        setCurrentPost(res.data);
        setCommentList(res.data.comments);
      })
      .catch((err) => history.push('/404'));
  }, [postID, history]);

  useEffect(() => {
    getPost();
  }, [getPost]);

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

  const options = {
    "content-type": "application/json",
    Authorization: `Token ${token}`,
  };
  const submitComment = (item) => {
    axios // create
      .post("/api/comments/", item, { headers: options })
      .then((res) => getPost());

    setActiveItem({
      // RESET TEXT BOX
      post: postID,
      content: "",
    });
  };

  const renderPost = (post) => {
    return (
      <>
        {post.content ? <Post post={post} commentsButton={false} /> : "loading"}
      </>
    );
  };

  const renderCommentInput = () => {
    if (user) {
      return (
        <div className="list-group-item text-center align-items-center p-5">
          <h4>share your dumbass thoughts</h4>

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
          <h4>Please <Link to={`/login/`}>login</Link> to post a comment</h4>
        </div>
      );
    }
  };

  const renderComments = () => {
    return commentList
      .slice(0)
      .reverse()
      .map((comment) => <Comment comment={comment} user={user} />);
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
                ? currentPost.comment_count + " comments"
                : "loading"}
            </div>
            <br />
            {renderCommentInput()}
          </Container>
          <br />
          <div>{commentList ? renderComments() : null}</div>
        </>
      ) : 
        "loading"}
    </div>
  );
}
