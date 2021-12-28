import React, { useContext, useEffect, useRef, useState } from "react";
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
  const { post } = props;

  //context
  const { userVal, loggedInVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  // state
  const [commentList, setCommentList] = useState(post.comments);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [commentOrder, setCommentOrder] = useState("date");
  const [activeItem, setActiveItem] = useState({
    post: post.id,
    content: "",
  });
  const isMounted = useRef(false);

  useEffect(() => {
    // only if rerender, never on mount
    if (isMounted.current) {
      axios
        .get(`/api/posts/${post.id}/comments?order_by=${commentOrder}`, headers)
        .then((res) => setCommentList(res.data));
    } else {
      // DO NOTHING ON MOUNT
      isMounted.current = true;
    }
  }, [commentOrder, headers, post.id, loggedIn]);

  var handleChange = (e) => {
    let { name, value } = e.target;

    const item = {
      post: post.id,
      [name]: value,
    };
    setActiveItem(item);
  };

  const submitComment = (item) => {
    if (loggedIn === false) {
      alert("must be logged in to post a comment.");
      return;
    }

    axios // create
      .post("/api/comments/create", item, headers)
      .then((res) => {
        setCommentList((oldList) => [res.data, ...oldList]);
        setCommentCount((c) => c + 1);
      });

    setActiveItem({
      // RESET TEXT BOX
      post: post.id,
      content: "",
    });
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

  // update state after deleting comment
  const removeCommentFromView = (comment) => {
    setCommentList(commentList.filter((c) => comment !== c));
    setCommentCount((c) => c - 1);
  };

  const renderComments = () => {
    return commentList.map((comment) => (
      <Comment
        comment={comment}
        removeCommentFromParentList={() => removeCommentFromView(comment)}
        key={comment.id}
      />
    ));
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
      <div>{commentList != null ? renderComments() : null}</div>
    </>
  );
}
