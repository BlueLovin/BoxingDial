import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";

const Comment = (props) => {
  const { updateStateFunction = null } = props;
  const comment = props.comment;
  const user = props.user;
  const token = props.token;

  const deleteComment = (comment) => {
    axios
      .delete(`/api/comments/${comment.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then(() => {
        if (updateStateFunction) {
          updateStateFunction();
        }
      });
  };

  return (
    <Container>
      <h5>
        <Link to={`/user/${comment.username}`}>{comment.username + " "}</Link>
        posted on
        <Link to={`/post/${comment.post.id}`}>
          {" " + comment.post.truncated_content}
        </Link>
      </h5>
      <div className="list-group-item bg-light justify-content-center">
        <p>{comment.content}</p>
        <div className="list-group-item p-auto  m-auto d-flex justify-content-between align-items-center ">
          <div>
            <span className="text-muted">by </span>
            <Link to={`/user/${comment.username}`}>{comment.username}</Link>
          </div>
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
