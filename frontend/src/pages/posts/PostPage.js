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

  const { userVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;

  const history = useHistory();
  const isMounted = useRef(false);

  const [currentPost, setCurrentPost] = useState({
    content: "",
  });
  const [activeItem, setActiveItem] = useState({
    post: postID,
    content: "",
    owner: user ? user.id : null,
  });

  const toggleModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (isMounted.current) {
      // only if rerender
      setCommentList([]);
      if (commentOrder === "date") {
        axios
          .get(`/api/posts/${postID}/comments`, headers)
          .then((res) => setCommentList(res.data));
      } else if (commentOrder === "score") {
        axios
          .get(`/api/posts/${postID}/comments?order_by=score`, headers)
          .then((res) => setCommentList(res.data));
      }
    } else {
      // DO NOTHING ON MOUNT
      isMounted.current = true;
    }
  }, [commentOrder, headers, postID]);

  //get post WITH auth headers
  const getPost = useCallback(async () => {
    await axios
      .get(`/api/posts/${postID}/`, headers) // get current post
      .then((res) => {
        setCurrentPost(res.data);
        setCommentList(res.data.comments);
      })
      .catch(() => history.push("/404"));
  }, [postID, history, headers]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  var handleChange = (e) => {
    let { name, value } = e.target;

    const item = {
      post: postID,
      [name]: value,
      username: user ? user.username : "null",
      owner: user ? user.id : null,
    };
    setActiveItem(item);
  };

  const submitComment = (item) => {
    axios // create
      .post("/api/comments/", item, headers)
      .then(() => getPost());

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
        <div class="col-sm-12 my-auto">
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
        <div className="list-group-item text-center align-items-center p-5">
          <h4>
            Please <Link to={`/login/`}>login</Link> to post a comment
          </h4>
        </div>
      );
    }
  };

  const renderComments = () => {
    return commentList.map((comment, i) => (
      <Comment comment={comment} updateStateFunction={getPost} key={i} />
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
            <div class="row h-100">{renderCommentInput()}</div>
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
