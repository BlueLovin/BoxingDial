import axios from "axios";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { Button, Container, FormGroup, Input } from "reactstrap";
import VotingButtons from "./UpvoteButtons";
import HighlightedContent from "../posts/HighlightedContent";

export default function Comment(props) {
  //props
  const { contextButton = false } = props;
  const {
    removeCommentFromParentList = null,
    addNewReply = null,
    removeReply = null,
  } = props;
  const comment = props.comment;
  //context
  const { userVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;
  //state
  const [activeItem, setActiveItem] = useState({
    content: `@${comment.username} `,
  });
  const [showReplyBox, setShowReplyBox] = useState(false);

  const deleteComment = () => {
    axios.delete(`/api/comments/${comment.id}/`, headers).then(() => {
      if (removeCommentFromParentList) {
        removeCommentFromParentList();
      }
    });
  };

  const handleChange = (e) => {
    let { value } = e.target;

    const item = { content: value };
    setActiveItem(item);
  };

  const postReply = () => {
    //if five or more characters
    if (activeItem.content.length >= 5) {
      axios
        .post(`/api/comments/${comment.id}/reply`, activeItem, headers)
        .then((res) => {
          addNewReply(comment, res.data.result);
          setActiveItem({ content: `@${comment.username}` });
          setShowReplyBox(false);
        });
    } else {
      alert("comments must be longer than 5 characters");
    }
  };

  const renderReplies = () => {
    if (comment.replies) {
      return comment.replies.map((reply) => (
        <>
          <hr />
          <Comment
            comment={reply}
            removeCommentFromParentList={() => removeReply(comment, reply)}
          />
        </>
      ));
    }
  };
  const renderReplyButton = () => {
    return (
      <button
        className="btn btn-primary"
        onClick={() => setShowReplyBox(!showReplyBox)}
      >
        Reply
      </button>
    );
  };

  const renderReplyBox = () => {
    if (showReplyBox) {
      return (
        <span className="p-4 ">
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
  if (!comment) {
    return null;
  }
  return (
    <Container>
      <div className="list-group-item bg-light justify-content-center preserve-line-breaks">
        <p>
          <HighlightedContent post={comment} />
        </p>
        <div className="list-group-item p-auto m-auto d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted">
              by{" "}
              <span className="text-dark font-weight-bold">
                {comment.owner.profile.screen_name}
              </span>
            </div>
            <Link to={`/user/${comment.owner.username}`}>
              @{comment.username}
            </Link>
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
            {user && user.username === comment.owner.username ? (
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
