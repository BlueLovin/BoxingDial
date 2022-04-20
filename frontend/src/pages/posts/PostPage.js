import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import { useHistory, useParams } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../UserContext";

import Post from "../../components/posts/Post";
import PostPageComments from "../../components/comments/PostPageComments";

export default function PostPage() {
  //props
  const { postID, highlightCommentID = null } = useParams();

  //context
  const { headersVal } = useContext(UserContext);
  const history = useHistory();

  //state
  const [headers, setHeaders] = headersVal;
  const [currentPost, setCurrentPost] = useState({
    content: "",
  });
  const [error, setError] = useState("");
  const [childrenLoaded, setChildrenLoaded] = useState(false);

  useLayoutEffect(() => {
    const highlightComment = () => {
      const highlightedComment = document.getElementById(
        parseInt(highlightCommentID)
      );
      if (highlightedComment === null) {
        return;
      }
      highlightedComment.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      highlightedComment.classList.remove("bg-light");
      highlightedComment.classList.add("highlight-background");
    };
    highlightComment();
  }, [currentPost, highlightCommentID, childrenLoaded]);

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
      <>{post.content ? <Post post={post} fullPostPage={true} /> : "loading"}</>
    );
  };

  if (error !== "") {
    return <h1 class="text-center">{error}</h1>;
  }

  return (
    <>
      <br />
      {currentPost ? (
        <>
          {renderPost(currentPost)}
          <PostPageComments post={currentPost} setLoaded={setChildrenLoaded} />
        </>
      ) : (
        "loading"
      )}
    </>
  );
}
