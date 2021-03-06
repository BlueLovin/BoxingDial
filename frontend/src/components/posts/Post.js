import { Link, useHistory } from "react-router-dom";
import { Container } from "reactstrap";
import { useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import HighlightedContent from "./HighlightedContent";
import LikeButton from "./buttons/LikeButton";
import RepostButton from "./buttons/RepostButton";
import ItemAuthor from "../accounts/ItemAuthor";

export default function Post(props) {
  const {
    post,
    fullPostPage = false,
    removePostFromParentList = null,
    toggleLikesModal = null,
    toggleRepostsModal = null,
  } = props;

  const { userVal, headersVal } = useContext(UserContext);

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

  const formatDateTime = (date) => {
    const dateTime = new Date(date);
    return dateTime.toLocaleString();
  };

  const renderContent = () => {
    if (post.entities.mentioned_users !== []) {
      return (
        <HighlightedContent
          content={post.content}
          userList={post.entities.mentioned_users}
        />
      );
    }

    return post.content;
  };

  return (
    <Container>
      <div className="list-group-item p-3">
        <ItemAuthor user={post.owner} />

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
                <LikeButton
                  toggleModal={toggleLikesModal}
                  post={post}
                  fullPostPage={fullPostPage}
                />
                <RepostButton post={post} fullPostPage={fullPostPage} />
                <p>share</p>
                <p>copy</p>
              </div>
            </>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center">
                {/* like button */}
                <LikeButton
                  toggleModal={toggleLikesModal}
                  post={post}
                  fullPostPage={fullPostPage}
                />
                <RepostButton
                  post={post}
                  toggleModal={toggleRepostsModal}
                  fullPostPage={fullPostPage}
                />
                {/* comments link */}
                <Link to={`/post/${post.id}`}>
                  {post.comment_count} comments
                </Link>
              </div>
            </>
          )}

          {/* if the post has a fight */}
          {post.fight !== null && (
            <>
              <span>
                on:{" "}
                <Link to={`/fight/${post.fight.id}`}>{post.fight.title} </Link>
              </span>
              <br />
              <br />
            </>
          )}

          {/* show delete button */}
          {user &&
            user.username === post.username &&
            removePostFromParentList !== null && (
              <div>
                <button
                  className="btn-sm btn-danger"
                  onClick={() => deletePost(post)}
                >
                  Delete
                </button>
              </div>
            )}
        </div>
      </div>
    </Container>
  );
}
