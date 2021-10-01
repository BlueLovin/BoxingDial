import axios from "axios";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import { UserContext } from "../../UserContext";
import Comment from "./Comment";

export default function FeedComment(props) {
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
      <Comment comment={comment} contextButton={true}/>
    </Container>
  );
};
