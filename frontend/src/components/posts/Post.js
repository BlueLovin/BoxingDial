import { Link, useHistory } from "react-router-dom";
import { Container } from "reactstrap";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const Post = (props) => {
  const { commentsButton = true } = props;
  const { updateStateFunction = null } = props;
  const post = props.post;
  const [likeCount, setLikeCount] = useState(post.like_count);
  const { userVal, headersVal } = useContext(UserContext);
  const [buttonClass, setButtonClass] = useState("btn-sm btn-primary");

  const [user] = userVal;
  const [headers] = headersVal;
  const history = useHistory();
  const deletePost = (_post) => {
    axios.delete(`/api/posts/${_post.id}/`, headers).then(() => {
      if (updateStateFunction != null) {
        updateStateFunction();
      } else {
        history.goBack();
      }
    });
  };

  useEffect(() => {
    if (post.liked) {
      setButtonClass("btn-sm btn-danger");
    } else {
      setButtonClass("btn-sm btn-primary");
    }
  }, [post]);

  const likePost = async (_post) => {
    if (!user) {
      alert("login to be able to like posts!");
      return;
    }
    await axios.post(`/api/posts/${_post.id}/like`, {}, headers).then((res) => {
      // LIKE
      if (res.data["result"] === "liked") {
        // increment like count if server responds "liked"
        setLikeCount(likeCount + 1);
        setButtonClass("btn-sm btn-danger");
      }
      // UNLIKE
      if (res.data["result"] === "unliked") {
        // vice versa with "unliked"
        setLikeCount(likeCount - 1);
        setButtonClass("btn-sm btn-primary");
      }
    });
  };

  const formatDateTime = (date) => {
    const dateTime = new Date(date);
    return dateTime.toLocaleString();
  };

  return (
    <Container>
      <div className="list-group-item p-3">
        <span>
          <Link to={`/user/${post.username}`}>{post.username}</Link>
        </span>
        <br />
        <br />
        <span className="font-weight-light list-group-item bg-light p-2 m-1 preserve-line-breaks">
          {post.content}
        </span>

        {/* like button */}
        <div className="text-left m-1">
          <button className={buttonClass} onClick={() => likePost(post)}>
            <FontAwesomeIcon icon={faHeart} />
            {" " + likeCount}
          </button>
        </div>
        <div className="text-right m-1">{formatDateTime(post.date)}</div>

        <div className="text-right m-1">
          {/* if the component was called with a comments button */}
          {commentsButton ? (
            <p>
              <Link to={`/post/${post.id}`}>{post.comment_count} comments</Link>
            </p>
          ) : null}

          {/* if the post has a fight */}
          {post.fight !== null ? (
            <>
              <span>
                on:{" "}
                <Link to={`/fight/${post.fight.id}`}>{post.fight.title} </Link>
              </span>
              <br />
              <br />
            </>
          ) : null}

          <div>
            {/* if the post belongs to the logged in user */}
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
