import axios from "axios";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { Button, Container, FormGroup, Input } from "reactstrap";
import VotingButtons from "./UpvoteButtons";

export default function Comment(props) {
  //props
  const { contextButton = false } = props;
  const { updateStateFunction = null } = props;
  const comment = props.comment;
  //context
  const { userVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;
  //state
  const [activeItem, setActiveItem] = useState({ content: "" });
  const [showReplyBox, setShowReplyBox] = useState(false);

  const deleteComment = () => {
    axios.delete(`/api/comments/${comment.id}/`, headers).then(() => {
      if (updateStateFunction) {
        updateStateFunction();
      }
    });
  };

  const renderReplyButton = () => {
    if (comment.replies) {
      return (
        <button
          className="btn btn-primary"
          onClick={() => setShowReplyBox(!showReplyBox)}
        >
          Reply
        </button>
      );
    }
  };

  const handleChange = (e) => {
    let { value } = e.target;

    const item = { content: value };
    setActiveItem(item);
  };

  const renderReplyBox = () => {
    if (showReplyBox) {
      return (
        <span class="p-4 ">
          <h4 className="text-center">share your thoughts</h4>
          <FormGroup>
            <Input
              type="textarea"
              name="content"
              onChange={handleChange}
              value={activeItem.content}
            />
          </FormGroup>
          <Button
            className="float-right btn-lg"
            color="success"
            onClick={() => postReply()}
          >
            Post
          </Button>
        </span>
      );
    } else {
      return null;
    }
  };

  const postReply = () => {
    //if five or more characters
    if (activeItem.content.length >= 5) {
      axios
        .post(`/api/comments/${comment.id}/reply`, activeItem, headers)
        .then(() => {
          if (updateStateFunction !== null) {
            updateStateFunction();
          }
        });
    } else {
      alert("comments must be longer than 5 characters");
    }
  };

  const renderReplies = () => {
    if (comment.replies) {
      // if this comment has replies, and is NOT a reply
      return comment.replies.map((reply) => (
        <>
          <hr />
          <Comment comment={reply} />
        </>
      ));
    }
  };

  return (
    <Container>
      <div className="list-group-item bg-light justify-content-center preserve-line-breaks">
        <p>{comment.content}</p>
        <div className="list-group-item p-auto m-auto d-flex justify-content-between align-items-center">
          <div>
            <span className="text-muted">by </span>
            <Link to={`/user/${comment.username}`}>{comment.username}</Link>
          </div>
          {contextButton && comment.post !== null ? (
            <Link to={`/post/${comment.post}`}>
              <span className="">context</span>
            </Link>
          ) : null}

          <div className="h1">
            <VotingButtons comment={comment} />
          </div>
          <div>
            {renderReplyButton()}
            {user && user.username === comment.username ? (
              <React.Fragment>
                <button
                  className="btn-sm btn-danger"
                  onClick={() => deleteComment()}
                >
                  Delete
                </button>
              </React.Fragment>
            ) : null}
          </div>
        </div>
        {renderReplyBox()}
        {renderReplies()}
      </div>
      <hr />
    </Container>
  );
}
