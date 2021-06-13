import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { Button, FormGroup, Input, Container } from "reactstrap";
import Post from "./Post";

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

  const getPost = useCallback(async () => {
    await axios
      .get("/api/posts/" + postID) // get current post
      .then((res) => {
        setCurrentPost(res.data[0]);
        setCommentList(res.data[0].comments);
      })
      .catch((err) => alert(err));
  }, [postID]);
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

  const deleteComment = (comment) => {
    axios.delete(`/api/comments/${comment.id}/`).then((res) => getPost());
  };

  const renderPost = (post) => {
    return (
      <>
        {post.fight ? <Post post={post} commentsButton={false} /> : "loading"}
      </>
    );
  };

  const renderComments = () => {
    return commentList
      .slice(0)
      .reverse()
      .map((comment) => (
        <Container>
          <div className="list-group-item bg-light">
            <p>{comment.content}</p>
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <Link to={`/user/${comment.owner}`}>
                <p className="text-muted"> by {comment.username}</p>
              </Link>
              {user && user.username === comment.username ? (
                <React.Fragment>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteComment(comment)}
                  >
                    Delete
                  </button>
                </React.Fragment>
              ) : null}
            </div>
          </div>
          <hr />
        </Container>
      ));
  };

  return (
    <div>
      <br />
      {currentPost ? renderPost(currentPost) : "loading"}
      <Container>
        <div className="h3 text-info font-weight-bold">
          <br />
          {commentList ? commentList.length + " comments" : "loading"}
        </div>
        <br />
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
      </Container>
      <br />
      <div>{commentList ? renderComments() : "loading"}</div>
    </div>
  );
}
