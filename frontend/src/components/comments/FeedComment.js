import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import Comment from "./Comment";

export default function FeedComment(props) {
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
      <Comment comment={comment} contextButton={true} />
    </Container>
  );
}
