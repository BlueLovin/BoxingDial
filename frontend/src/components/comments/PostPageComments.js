import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { UserContext } from "../../UserContext";
import { Link } from "react-router-dom";
import {
  Button,
  FormGroup,
  Input,
  DropdownItem,
  DropdownMenu,
  UncontrolledDropdown,
  DropdownToggle,
  Container,
} from "reactstrap";
import Comment from "../../components/comments/Comment";
import axios from "axios";

export default function PostPageComments(props) {
  //props
  const { post, setLoaded } = props;

  //context
  const { userVal, loggedInVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  // state
  const [commentList, setCommentList] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [commentOrder, setCommentOrder] = useState("date");
  const [newComment, setNewComment] = useState({
    post: post.id,
    content: "",
  });
  const isMounted = useRef(false);

  useEffect(() => {
    if (post.id === undefined) {
      return;
    }
    // only if rerender, never on mount
    if (isMounted.current) {
      axios
        .get(`/posts/${post.id}/comments?order_by=${commentOrder}`, headers)
        .then((res) => setCommentList(res.data));
    } else {
      // DO NOTHING ON MOUNT
      isMounted.current = true;
      setLoaded(true);
    }
  }, [commentOrder, post.id, headers, loggedIn, setLoaded]);

  useEffect(() => {
    setCommentCount(post.comment_count);
    setCommentList(post.comments);
  }, [post]);

  var handleChange = (e) => {
    let { name, value } = e.target;

    const item = {
      post: post.id,
      [name]: value,
    };
    setNewComment(item);
  };

  const submitComment = (item) => {
    if (loggedIn === false) {
      alert("must be logged in to post a comment.");
      return;
    }

    axios // create
      .post("/comments/create", item, headers)
      .then((res) => {
        setCommentList((oldList) => [res.data, ...oldList]);
        setCommentCount((c) => c + 1);
      });

    setNewComment({
      // RESET TEXT BOX
      post: post.id,
      content: "",
    });
  };

  // when you update the reply list of a comment locally, pass it here and
  // this function will update the comment in the state
  const replaceComment = useCallback(
    (_newComment) => {
      return commentList.map((comment) => {
        if (comment.id === _newComment.id) {
          return _newComment;
        }
        return comment;
      });
    },
    [commentList]
  );

  const addReplyToView = useCallback(
    (parentComment, newReply) => {
      // add reply to beginning of parent comment locally
      parentComment.replies = [newReply, ...parentComment.replies];

      // replace the parent comment with our new modified comment with new reply array
      const updatedList = replaceComment(parentComment);

      setCommentList(updatedList);
    },
    [replaceComment]
  );

  const removeReplyFromView = useCallback(
    (parentComment, reply) => {
      // update reply list locally
      parentComment.replies = parentComment.replies.filter(
        (_reply) => _reply !== reply
      );

      // set parent comment to our modified comment with new reply list
      const updatedReplyList = replaceComment(parentComment);

      setCommentList(updatedReplyList);
    },
    [setCommentList, replaceComment]
  );

  // update state after deleting comment
  const removeCommentFromView = useCallback(
    (comment) => {
      setCommentList(commentList.filter((c) => comment !== c));
      setCommentCount((c) => c - 1);
    },
    [setCommentCount, setCommentList, commentList]
  );

  const renderComments = () => {
    return commentList.map((comment) => (
      <Comment
        comment={comment}
        removeCommentFromParentList={removeCommentFromView}
        removeReply={removeReplyFromView}
        addNewReply={addReplyToView}
        key={comment.id}
        id={comment.id}
      />
    ));
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
              active={commentOrder === "date"}
              onClick={() => setCommentOrder("date")}
            >
              Date
            </DropdownItem>
            <DropdownItem
              active={commentOrder === "score"}
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
              value={newComment.content}
              onChange={handleChange}
            />
          </FormGroup>
          <Button
            className="float-right btn-lg"
            color="success"
            onClick={() => submitComment(newComment)}
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

  return (
    <>
      <Container>
        <div className="h3 text-info font-weight-bold">
          <br />
          {`${commentCount} comments`}
        </div>
        <br />
        <div className="row h-100">{renderCommentInput()}</div>
      </Container>
      {renderOrderBy()}
      <br />
      <div>{commentList == null || renderComments()}</div>
    </>
  );
}
