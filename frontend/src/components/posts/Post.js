import { Link, useHistory } from "react-router-dom";
import { Container } from "reactstrap";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";
import HighlightedContent from "./HighlightedContent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

export default function Post(props) {
  const {
    post,
    fullPostPage = false,
    removePostFromParentList = null,
    toggleModal = null,
  } = props;

  const [likeCount, setLikeCount] = useState(post.like_count);
  const { userVal, headersVal } = useContext(UserContext);
  const [buttonClass, setButtonClass] = useState("btn-sm btn-primary");

  const [user] = userVal;
  const [headers] = headersVal;
  const history = useHistory();

  const deletePost = (_post) => {
    axios.delete(`/posts/${_post.id}/`, headers).then(() => {
      if (removePostFromParentList != null) {
        removePostFromParentList();
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

  const likePost = (_post) => {
    if (!user) {
      alert("login to be able to like posts!");
      return;
    }
    axios.post(`/posts/${_post.id}/like`, {}, headers).then((res) => {
      const result = res.data["result"];
      // LIKE
      if (result === "liked") {
        // increment like count if server responds "liked"
        setLikeCount(likeCount + 1);
        setButtonClass("btn-sm btn-danger");
      }
      // UNLIKE
      if (result === "unliked") {
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

  const renderContent = () => {
    if (post.entities.mentioned_users !== []) {
      return <HighlightedContent post={post} />;
    }

    return post.content;
  };

  return (
    <Container>
      <div className="list-group-item p-3">
        <span>
          {post.owner.profile ? post.owner.profile.screen_name : null}
          <Link to={`/user/${post.owner.username}`}>
            <div>@{post.owner.username}</div>
          </Link>
        </span>
        <br />
        <span className="font-weight-light list-group-item bg-light p-2 m-1 preserve-line-breaks">
          {renderContent()}
        </span>

        <div className="text-right m-1">{formatDateTime(post.date)}</div>

        <div className="text-right m-1">
          {/* if the component was called on the post page or not */}
          {fullPostPage ? (
            <>
              <div className="list-group-item p-auto m-auto d-flex justify-content-between align-items-center">
                <p>
                  <button
                    className={buttonClass}
                    onClick={() => likePost(post)}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                  </button>{" "}
                  {/* likes area */}
                  <Link onClick={() => toggleModal()} to="#">
                    {likeCount > 1 || likeCount === 0
                      ? `${likeCount} likes`
                      : `${likeCount} like`}
                  </Link>
                </p>
                <p>placeholder</p>
                <p>share</p>
                <p>copy</p>
              </div>
            </>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center">
                {/* like button */}
                <button className={buttonClass} onClick={() => likePost(post)}>
                  <FontAwesomeIcon icon={faHeart} />
                  {" " + likeCount}
                </button>
                {/* comments link */}
                <Link to={`/post/${post.id}`}>
                  {post.comment_count} comments
                </Link>
              </div>
            </>
          )}

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
            {/* show delete button */}
            {user &&
            user.username === post.username &&
            removePostFromParentList != null ? (
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
}
