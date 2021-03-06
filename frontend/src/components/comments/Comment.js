import axios from "axios";
import React, { useCallback, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { Button, Container, FormGroup, Input } from "reactstrap";
import VotingButtons from "./VotingButtons";
import HighlightedContent from "../posts/HighlightedContent";
import ItemAuthor from "../accounts/ItemAuthor";

export default function Comment(props) {
  const {
    comment,
    removeCommentFromParentList = null,
    showContextButton = false,
    addNewReply = null,
    removeReply = null,
    parentComment = null,
  } = props;

  const { userVal, headersVal, loggedInVal } = useContext(UserContext);
  const [user] = userVal;
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;
  const [newReply, setNewReply] = useState({
    content: `@${comment.username} `,
  });
  const [showReplyBox, setShowReplyBox] = useState(false);

  const deleteComment = () => {
    axios.delete(`/comments/${comment.id}/`, headers).then(() => {
      if (removeCommentFromParentList) {
        removeCommentFromParentList(comment);
      }
    });
  };

  const handleChange = useCallback(
    (e) => {
      let { value } = e.target;

      const item = { content: value };
      setNewReply(item);
    },
    [setNewReply]
  );

  const addNewReplyToView = (_newReply) => {
    //replying to parent comment
    if (parentComment === null) {
      addNewReply(comment, _newReply);
    }

    // replying to reply
    else {
      addNewReply(parentComment, _newReply);
    }

    // reset text box
    setNewReply({ content: `@${comment.username} ` });
    setShowReplyBox(false);
  };

  const postReply = () => {
    const newReplyLength =
      newReply.content.length - `@${comment.username} `.length;

    //if five or more characters
    if (newReplyLength <= 5) {
      alert("comments must be longer than 5 characters");
      return;
    }

    axios
      .post(`/comments/${comment.id}/reply`, newReply, headers)
      .then((res) => addNewReplyToView(res.data.result));
  };

  const renderReplies = () => {
    if (comment.replies) {
      return comment.replies.map((reply) => (
        <>
          <hr />
          <Comment
            comment={reply}
            parentComment={comment}
            removeCommentFromParentList={() => removeReply(comment, reply)}
            addNewReply={addNewReply}
            key={reply.id}
            id={reply.id}
          />
        </>
      ));
    }
  };

  const renderReplyButton = () => {
    if (!addNewReply) return null;

    return (
      <button
        className="btn btn-primary"
        onClick={() => {
          if (!loggedIn) {
            alert("Log in to reply to comments!");
            return;
          }
          setShowReplyBox(!showReplyBox);
        }}
      >
        Reply
      </button>
    );
  };

  const renderReplyBox = () => {
    if (!showReplyBox) {
      return null;
    }

    return (
      <span className="p-4 ">
        <h4 className="text-center">share your thoughts</h4>
        <FormGroup>
          <Input
            type="textarea"
            name="content"
            onChange={handleChange}
            value={newReply.content}
          />
        </FormGroup>
        <Button
          className="float-right btn-lg"
          color="success"
          onClick={postReply}
        >
          Post
        </Button>
      </span>
    );
  };

  if (!comment) {
    return null;
  }
  return (
    <Container>
      <div
        id={comment.id}
        className="list-group-item bg-light justify-content-center preserve-line-breaks"
      >
        <p>
          <HighlightedContent
            content={comment.content}
            userList={comment.entities.mentioned_users}
          />
        </p>
        <div className="list-group-item p-auto m-auto d-flex justify-content-between align-items-center">
          <ItemAuthor user={comment.owner} />
          {showContextButton && comment.post !== null ? (
            <Link to={`/post/${comment.post}/${comment.id}`}>
              <span>context</span>
            </Link>
          ) : null}

          <div className="h1">
            <VotingButtons comment={comment} />
          </div>
          <div>
            {renderReplyButton()}
            {user && user.username === comment.owner.username ? (
              <React.Fragment>
                <button className="btn-sm btn-danger" onClick={deleteComment}>
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
