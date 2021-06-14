import { Link } from "react-router-dom";
import { Container } from "reactstrap";

const Post = (props) => {
  let post = props.post;
  let commentsButton = props.commentsButton !== false ? true : false;
  return (
    <Container>
      <div className="list-group-item">
        <p>
          <Link to={`/user/${post.owner}`}>{post.username}</Link>
        </p>
        <p className="font-weight-light list-group-item bg-light">
          {post.content}
        </p>
        <div className="d-flex text-center justify-content-between text-muted">
          <p>
            on: <Link to={`/fight/${post.fight.id}`}>{post.fight.title}</Link>
          </p>
          {commentsButton ? (
            <p>
              <Link to={`/post/${post.id}`}>view comments</Link>
            </p>
          ) : null}
        </div>
      </div>
    </Container>
  );
};
export default Post;
