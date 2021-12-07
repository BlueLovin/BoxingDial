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
  Button,
  FormGroup,
  Input,
  Container,
  DropdownItem,
  DropdownMenu,
  UncontrolledDropdown,
  DropdownToggle,
} from "reactstrap";
import Post from "../../components/posts/Post";
import Comment from "../../components/comments/Comment";
import PostLikesModal from "../../components/modals/PostLikesModal";

export default function Comments() {
  const params = useParams();
  const postID = params.id;

  const [commentList, setCommentList] = useState([]);
  const [commentOrder, setCommentOrder] = useState("date");
  const [modal, setModal] = useState(false);

  const { userVal, headersVal, loggedInVal } = useContext(UserContext);
  const [user] = userVal;
  const [loggedIn] = loggedInVal;
  const [headers, setHeaders] = headersVal;

  const history = useHistory();
  const isMounted = useRef(false);

  const [currentPost, setCurrentPost] = useState({
    content: "",
  });
  const [activeItem, setActiveItem] = useState({
    post: postID,
    content: "",
  });

  const toggleModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    // only if rerender, never on mount
    if (isMounted.current) {
      setCommentList([]);
      axios
        .get(`/api/posts/${postID}/comments?order_by=${commentOrder}`, headers)
        .then((res) => setCommentList(res.data));
    } else {
      // DO NOTHING ON MOUNT
      isMounted.current = true;
    }
  }, [commentOrder, headers, postID, loggedIn]);

  //get post with headers
  const getPost = useCallback(async () => {
      axios
      .get(`/api/posts/${postID}/`, headers) // get current post
      .then((res) => {
        setCurrentPost(res.data);
        setCommentList([]);
        setCommentList(res.data.comments);
      })
      .catch((res) => {
        // if invalid token, try again without headers
        if(res.data["detail"] === "Invalid token."){
          setHeaders(null);
        }
        history.push("/404")
      });

  }, [postID, history, headers, setHeaders]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  var handleChange = (e) => {
    let { name, value } = e.target;

    const item = {
      post: postID,
      [name]: value,
    };
    setActiveItem(item);
  };

  const submitComment = async (item) => {
    if(loggedIn === false){
      alert("must be logged in to post a comment.")
      return;
    }

    await axios // create
      .post("/api/comments/", item, headers)
      .then((res) => {
        let temp_list = commentList;
        setCommentList([]);
        setCommentList([res.data, ...temp_list]);
      });

    setActiveItem({
      // RESET TEXT BOX
      post: postID,
      content: "",
    });
  };

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

  const renderOrderBy = () => {
    return (
      <div className="container text-right">
        <br />
        <UncontrolledDropdown>
          <DropdownToggle caret color="light">
            Sort by
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem
              active={commentOrder === "date" ? true : false}
              onClick={() => setCommentOrder("date")}
            >
              Date
            </DropdownItem>
            <DropdownItem
              active={commentOrder === "score" ? true : false}
              onClick={() => setCommentOrder("score")}
            >
              Score
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  };

  const renderCommentInput = () => {
    if (user) {
      return (
        <div className="col-sm-12 my-auto">
          <h4 className="text-center">share your thoughts</h4>
          <FormGroup>
            <Input
              type="textarea"
              name="content"
              value={activeItem.content}
              onChange={handleChange}
            />
          </FormGroup>
          <Button
            className="float-right btn-lg"
            color="success"
            onClick={() => submitComment(activeItem)}
          >
            Post
          </Button>
        </div>
      );
    } else {
      return (
        <div className="container list-group-item text-center align-items-center p-5">
          <h4>
            Please <Link to={`/login/`}>login</Link> to post a comment
          </h4>
        </div>
      );
    }
  };

  const renderComments = () => {
    return commentList.map((comment) => (
      <Comment comment={comment} updateStateFunction={getPost} key={comment.id} />
    ));
  };

  return (
    <div>
      <br />
      {currentPost ? (
        <>
          {renderPost(currentPost)}

          <Container>
            <div className="h3 text-info font-weight-bold">
              <br />
              {currentPost.comment_count !== null
                ? `${currentPost.comment_count} comments`
                : "loading"}
            </div>
            <br />
            <div className="row h-100">{renderCommentInput()}</div>
          </Container>
          {renderOrderBy()}
          <br />
          <div>{commentList != null ? renderComments() : null}</div>
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
