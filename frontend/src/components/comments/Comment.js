import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { Container } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faArrowAltCircleDown,
  faArrowAltCircleUp
} from "@fortawesome/free-solid-svg-icons";

const DIRECTION = {
  UP: "UP",
  DOWN: "DOWN",
  NEUTRAL: "NEUTRAL",
};

export default function Comment(props) {
  //props
  const { contextButton = false } = props;
  const { updateStateFunction = null } = props;
  const comment = props.comment;
  //context
  const { userVal, headersVal } = useContext(UserContext);
  const [commentScore, setCommentScore] = useState(comment.vote_score)
  const [scoreBeforeVote, setScoreBeforeVote] = useState();
  const [voteDirection, setVoteDirection] = useState(DIRECTION.NEUTRAL);
  const [user] = userVal;
  const [headers] = headersVal;

  useEffect(() => {
    const checkVoteDirection = () => {
      if (comment.is_voted_up) {
        setScoreBeforeVote(comment.vote_score - 1);
        setVoteDirection(DIRECTION.UP);
        return;
      }
      if (comment.is_voted_down) {
        setScoreBeforeVote(comment.vote_score + 1);
        setVoteDirection(DIRECTION.DOWN);
        return;
      }
      else{
        setScoreBeforeVote(comment.vote_score);
        setVoteDirection(DIRECTION.NEUTRAL);
      }
    };
    checkVoteDirection();
  }, [])

  const serializeDirection = (direction) => {
    if (direction === "up" || direction === "down") {
      return {
        "action": direction,
      };
    }
  };

  const renderVotingButtons = () => {
    if (voteDirection === DIRECTION.UP) {
      return (
        <>
          <a href="#" onClick={() => unvote(-1)}>
            <FontAwesomeIcon icon={faArrowAltCircleUp} />
          </a>

          <a href="#" onClick={() => vote("down")}>
            <FontAwesomeIcon icon={faArrowDown} />
          </a>
          <h4>
            {commentScore}
          </h4>
        </>
      );
    }
    else if (voteDirection === DIRECTION.DOWN) {
      return (
        <>
          <a href="#" onClick={() => vote("up")}>
            <FontAwesomeIcon icon={faArrowUp} />
          </a>

          <a href="#" onClick={() => unvote(1)}>
            <FontAwesomeIcon icon={faArrowAltCircleDown} />
          </a>
          <h4>
            {commentScore}
          </h4>
        </>
      );
    }
    else {
      return (
        <>
          <a href="#" onClick={() => vote("up")}>
            <FontAwesomeIcon icon={faArrowUp} />
          </a>

          <a href="#" onClick={() => vote("down")}>
            <FontAwesomeIcon icon={faArrowDown} />
          </a>
          <h4>
            {commentScore}
          </h4>
        </>
      );
    }
  };

  const vote = async (direction) => {
    const data = serializeDirection(direction);
    await axios.post(`/api/comments/${comment.id}/vote/`, data, headers);
    if (direction === "up") {
      setCommentScore(scoreBeforeVote + 1);
      setVoteDirection(DIRECTION.UP);
    }
    if (direction === "down") {
      setCommentScore(scoreBeforeVote - 1);
      setVoteDirection(DIRECTION.DOWN);
    }
  };
  const unvote = async (unvoteValue) => {
    await axios.delete(`/api/comments/${comment.id}/vote/`, headers);
    setVoteDirection(DIRECTION.NEUTRAL);
    setCommentScore(scoreBeforeVote)
  };

  const deleteComment = () => {
    axios.delete(`/api/comments/${comment.id}/`, headers).then(() => {
      if (updateStateFunction) {
        updateStateFunction();
      }
    });
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
          {contextButton ? (
            <Link to={`/post/${comment.post}`}>
              <span className="">context</span>
            </Link>
          ) : null}
          <div className="h1">
            {renderVotingButtons()}
          </div>
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
      <hr />
    </Container>
  );
};
