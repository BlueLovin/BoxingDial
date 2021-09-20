import axios from "axios";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import { UserContext } from "../../UserContext";

const Comment = (props) => {
  const comment = props.comment;
  const { updateStateFunction = null } = props;
  const { userVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;

  const deleteComment = (_comment) => {
    axios.delete(`/api/comments/${_comment.id}/`, headers).then(() => {
      if (updateStateFunction) {
        updateStateFunction();
      }
    });
  };
  return (
    <Container>
      <p>
        <Link to={`/user/${comment.username}`}>{comment.username}</Link>
        {" posted on "}
        <Link to={`/post/${comment.post.id}`}>
          {comment.post.truncated_content}
        </Link>
        {" by "}
        <Link to={`/user/${comment.post.username}`}>
          {comment.post.username}
        </Link>
      </p>
      <div className="list-group-item bg-light justify-content-center preserve-line-breaks">
        <p>{comment.content}</p>
        <div className="list-group-item p-auto m-auto d-flex justify-content-between align-items-center">
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
    </Container>
  );
};

export default Comment;
