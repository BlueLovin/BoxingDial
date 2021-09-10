import React from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";

const Comment = (props) => {
  const comment = props.comment;

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
        </div>
      </div>
    </Container>
  );
};

export default Comment;
