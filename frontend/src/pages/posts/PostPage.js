import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../UserContext";

import Post from "../../components/posts/Post";
import PostLikesModal from "../../components/modals/PostLikesModal";
import PostPageComments from "../../components/comments/PostPageComments";

export default function PostPage() {
  //props
  const { postID, highlightCommentID = null } = useParams();

  //context
  const { headersVal } = useContext(UserContext);
  const history = useHistory();

  //state
  const [modal, setModal] = useState(false);
  const [headers, setHeaders] = headersVal;
  const [currentPost, setCurrentPost] = useState({
    content: "",
  });
  const [error, setError] = useState("");
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const highlightedCommentRef = useRef(null);

  useLayoutEffect(() => {
    console.log(parseInt(highlightCommentID));

    const highlightedComment = document.getElementById(
      parseInt(highlightCommentID)
    );
    if (highlightedComment === null) {
      return;
    }
    console.log("WNEIWNA");
    highlightedComment.scrollIntoView({ behavior: "smooth", block: "start" });
    highlightedComment.classList.remove("bg-light");
    highlightedComment.classList.add("highlight-background");
  }, [currentPost, highlightCommentID, childrenLoaded]);

  const toggleModal = () => setModal(!modal);

  //get post with headers
  const getPost = useCallback(() => {
    axios
      .get(`/posts/${postID}/`, headers) // get current post
      .then((res) => setCurrentPost(res.data))
      .catch((res) => {
        const data = res.response.data;
        if (data.error) {
          setError(res.response.data.error);
          return;
        }
        // if invalid token, try again without headers
        if (res.response.data.detail === "Invalid token.") {
          setHeaders(null);
          return;
        }
        history.push("/404");
      });
  }, [postID, history, headers, setHeaders]);

  useEffect(() => getPost(), [getPost]);

  const renderPost = (post) => {
    return (
      <>
        {post.content ? (
          <Post
            post={post}
            fullPostPage={true}
            toggleModal={() => toggleModal()}
          />
        ) : (
          "loading"
        )}
      </>
    );
  };

  if (error !== "") {
    return <h1 class="text-center">{error}</h1>;
  }

  return (
    <div>
      <br />
      {currentPost ? (
        <>
          {renderPost(currentPost)}

          <PostPageComments post={currentPost} setLoaded={setChildrenLoaded} />

          {modal ? (
            <PostLikesModal toggle={toggleModal} postID={postID} />
          ) : null}
        </>
      ) : (
        "loading"
      )}
    </div>
  );
}
