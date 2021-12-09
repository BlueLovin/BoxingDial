import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../UserContext";
import {
  Container,
} from "reactstrap";
import Post from "../../components/posts/Post";
import PostLikesModal from "../../components/modals/PostLikesModal";
import PostPageComments from "../../components/comments/PostPageComments";

export default function Comments() {
  const params = useParams();
  const postID = params.id;


  const [modal, setModal] = useState(false);

  const { headersVal, loggedInVal } = useContext(UserContext);
  const [headers, setHeaders] = headersVal;

  const history = useHistory();

  const [currentPost, setCurrentPost] = useState({
    content: "",
  });


  const toggleModal = () => {
    setModal(!modal);
  };



  //get post with headers
  const getPost = useCallback(async () => {
    axios
      .get(`/api/posts/${postID}/`, headers) // get current post
      .then((res) => {
        setCurrentPost(res.data);
      })
      .catch((res) => {
        // if invalid token, try again without headers
        if (res.data["detail"] === "Invalid token.") {
          setHeaders(null);
        }
        history.push("/404");
      });
  }, [postID, history, headers, setHeaders]);

  useEffect(() => {
    getPost();
  }, [getPost]);



 
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


  return (
    <div>
      <br />
      {currentPost ? (
        <>
          {renderPost(currentPost)}

         <PostPageComments post={currentPost}/> 
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
