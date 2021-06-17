import { Link } from "react-router-dom";
import { Container } from "reactstrap";

const Post = (props) => {
  //yes the following line is terrible. it checks if the argument was passed in or not. what the fuck
  //it works tho...
  let commentsButton = props.commentsButton !== false ? true : false;
  let post = props.post;
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
              <Link to={`/post/${post.id}`}>comments</Link>
            </p>
          ) : null}
        </div>
      </div>
    </Container>
  );
};
export default Post;
