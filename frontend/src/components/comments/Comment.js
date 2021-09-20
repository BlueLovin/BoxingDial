import axios from "axios";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { Container } from "reactstrap";

const Comment = (props) => {
  //props
  const { contextButton = false } = props;
  const { updateStateFunction = null } = props;
  const comment = props.comment;
  //context
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
      <div className="list-group-item bg-light justify-content-center preserve-line-breaks">
        <p>{comment.content}</p>
        <div className="list-group-item p-auto m-auto d-flex justify-content-between align-items-center">
          <div>
            <span className="text-muted">by </span>
            <Link to={`/user/${comment.username}`}>{comment.username}</Link>
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
