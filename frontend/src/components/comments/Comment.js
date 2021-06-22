import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";

const Comment = (props) => {
  const comment = props.comment;
  const user = props.user;
  let contextButton = props.contextButton !== true ? false : true; // what the f#ck? this means default false. unless stated otherwise

  const deleteComment = (comment) => {
    axios.delete(`/api/comments/${comment.id}/`);
  };

  return (
    <Container>
      <div className="list-group-item bg-light justify-content-center">
        <p>{comment.content}</p>
        <div className="list-group-item p-auto  m-auto d-flex justify-content-between align-items-center ">
          <div>
            <span className="text-muted">by </span>
            <Link to={`/user/${comment.owner}`}>{comment.username}</Link>
          </div>
          {contextButton ? (
            <Link to={`/post/${comment.post}`}>
              <span className="">context</span>
            </Link>
          ) : null}
          {user && user.username === comment.username ? (
            <React.Fragment>
              <button
                className="btn-sm btn-danger"
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
  );
};

export default Comment;
