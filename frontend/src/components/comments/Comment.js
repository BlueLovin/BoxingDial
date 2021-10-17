import axios from "axios";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { Container } from "reactstrap";
import VotingButtons from "./UpvoteButtons";

export default function Comment(props) {
  //props
  const { contextButton = false } = props;
  const { updateStateFunction = null } = props;
  const comment = props.comment;
  //context
  const { userVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;

  const deleteComment = () => {
    axios.delete(`/api/comments/${comment.id}/`, headers).then(() => {
      if (updateStateFunction) {
        updateStateFunction();
      }
    });
  };

  const renderReplies = () => {
    if (comment.replies) {
      // if this comment has replies, and is NOT a reply
      return comment.replies.map((reply) => (
        <>
          <hr/>
          <Comment comment={reply} />
        </>
      ));
    }
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
          {contextButton && comment.post !== null ? (
            <Link to={`/post/${comment.post}`}>
              <span className="">context</span>
            </Link>
          ) : null}

          <div className="h1">
            <VotingButtons comment={comment} />
          </div>
          {user && user.username === comment.username ? (
            <React.Fragment>
              <button
                className="btn-sm btn-danger"
                onClick={() => deleteComment()}
              >
                Delete
              </button>
            </React.Fragment>
          ) : null}
        </div>
        {renderReplies()}
      </div>
      <hr />
    </Container>
  );
}
