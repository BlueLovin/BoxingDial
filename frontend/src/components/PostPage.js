import React, { Component, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
  Container
} from "reactstrap";


export default function Comments() {

  const params = useParams();
  const postID = params.id;

  const [postList, setPostList] = useState([]);

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

    const item = {post: postID, [name]: value };

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

    setActiveItem({})
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
    return(
    <Container>
      <div className="list-group-item d-flex justify-content-between align-items-center">
        <p>{post.content}</p> by fuckhead123
      </div>
    </Container>
    )
  }

  const renderComments = () => {
    return commentList.map((comment) => (
      <Container>
      <div className="list-group-item d-flex justify-content-between align-items-center">
        <p>{comment.content}</p>
        <a>by user123</a>
        <button
              className="btn btn-danger"
              onClick={() => deleteComment(comment)}
            >
              Delete
          </button>
      </div>
      </Container>
    ));
  }

  return (
    <div>
      {renderPost(currentPost)}


      <Container>
      <div className="h3 text-info">
        comments
        </div>
      <div className="list-group-item d-flex justify-content-between align-items-center">
        share your dumbass thoughts
        <FormGroup>
          <textarea type="text"
            name="content"
            value={activeItem.content} 
            onChange={handleChange}/>
            </FormGroup>
          <Button onClick={() => submitComment(activeItem)}>post</Button>
      </div>
      </Container>
      <div>
        {renderComments()}
      </div>

    </div>
  );

}
