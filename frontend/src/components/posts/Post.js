import { Link, useHistory } from "react-router-dom";
import { Container } from "reactstrap";
import React, { useContext } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";

const Post = (props) => {
  const { commentsButton = true } = props;
  const { updateStateFunction = null } = props;
  const post = props.post;
  const { userVal, tokenVal } = useContext(UserContext);
  const [user] = userVal;
  const [token] = tokenVal;
  const history = useHistory();
  const deletePost = (post) => {
    axios
      .delete(`/api/posts/${post.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then(() => {
        if (updateStateFunction) {
          updateStateFunction();
        }
        else{
          history.goBack();
        }
      });
  };

  return (
    <Container>
      <div className="list-group-item p-3">
        <span>
          <Link to={`/user/${post.owner}`}>{post.username}</Link>
        </span>
        <br />
        <br />
        <span className="font-weight-light list-group-item bg-light p-2 m-1 preserve-line-breaks">
          {post.content}
        </span>
        <div>
          
        </div>
        <div className="text-right m-1">
          {commentsButton ? (
            <p>
              <Link to={`/post/${post.id}`}>{post.comment_count} comments</Link>
            </p>
          ) : null}
          <span>
            on: <Link to={`/fight/${post.fight.id}`}>{post.fight.title} </Link>
          </span>
          <br/><br/>
          <div>
          {user && user.username === post.username ? (
            <React.Fragment>
              <button
                className="btn-sm btn-danger"
                onClick={() => deletePost(post)}
              >
                Delete
              </button>
            </React.Fragment>
          ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
};
export default Post;
