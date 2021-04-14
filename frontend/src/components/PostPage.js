import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Button,
  FormGroup,
  Input,
  Label,
  Container
} from "reactstrap";


export default function Comments() {

  const params = useParams();
  const postID = params.id;

  const [commentList, setCommentList] = useState([]);

  const [currentPost, setCurrentPost] = useState({
    content: "",
  });

  const [activeItem, setActiveItem] = useState({
    post: postID,
    content: "",
  })

  useEffect(() => {
    getComments();
    getPost();
  }, [])

  var handleChange = (e) => {
    let { name, value } = e.target;

    const item = { post: postID, [name]: value };

    setActiveItem(item);
  };

  const submitComment = (item) => {
    if (item.id) { // edit
      axios
        .put(`/api/comments/${item.id}/`, item)
        .then((res) => getComments());
      return;
    }
    axios // create
      .post("/api/comments/", item)
      .then((res) => getComments());

    setActiveItem({ // RESET TEXT BOX
      post: postID,
      content: "",
    })
  };

  const deleteComment = (comment) => {
    axios
      .delete(`/api/comments/${comment.id}/`)
      .then((res) => getComments());
  };

  const getPost = () => {
    axios
      .get("/api/posts/" + postID) // get current post
      .then((res) => setCurrentPost(res.data))// grabs the comments right here
      .catch((err) => alert(err));
  }

  const getComments = () => {
    axios
      .get("/api/posts/" + postID) // get current post
      .then((res) => setCommentList(res.data.comments))// grabs the comments right here
      .catch((err) => alert(err));
  };

  const renderPost = (post) => {
    return (
      <Container>
        <div className="list-group-item">
          <p className="font-weight-light list-group-item bg-light">{post.content}</p>
          <p className="text-muted"> by fuckhead123</p>
        </div>
      </Container>
    )
  }

  const renderComments = () => {
    return commentList.slice(0).reverse().map((comment) => (
      <Container>

        <div className="list-group-item bg-light">
          <p>{comment.content}</p>
          <div className="list-group-item d-flex justify-content-between align-items-center">
            <Label>by user123</Label>
            <button
              className="btn btn-danger"
              onClick={() => deleteComment(comment)}
            >
              Delete
          </button>
          </div>
        </div>
        <hr />
      </Container>

    ));
  }

  return (
    <div>
      {renderPost(currentPost)}
      <Container>
        <div className="h3 text-info font-weight-bold">
          <br />
          {commentList.length} comments
        </div>
        <br />
        <div className="list-group-item text-center align-items-center p-5">
          <h4>share your dumbass thoughts</h4>

          <FormGroup>
            <Input type="textarea"
              name="content"
              value={activeItem.content}
              onChange={handleChange} />
          </FormGroup>

          <Button color="success" onClick={() => submitComment(activeItem)}>
            Post
            </Button>
        </div>
      </Container>
      <br />
      <div>
        {renderComments()}
      </div>

    </div>
  );

}
