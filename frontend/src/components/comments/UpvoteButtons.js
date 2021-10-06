import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faArrowAltCircleDown,
  faArrowAltCircleUp,
} from "@fortawesome/free-solid-svg-icons";

// javascript doesn't have ENUMs? oh brother. . .
const DIRECTION = {
  UP: "UP",
  DOWN: "DOWN",
  NEUTRAL: "NEUTRAL",
};

export default function VotingButtons(props) {
  const comment = props.comment;

  const { headersVal, loggedInVal } = useContext(UserContext);
  const [loggedIn] = loggedInVal;
  const [headers] = headersVal;

  const [commentScore, setCommentScore] = useState(comment.vote_score);
  const [scoreBeforeVote, setScoreBeforeVote] = useState();
  const [voteDirection, setVoteDirection] = useState(DIRECTION.NEUTRAL);

  useEffect(() => {
    // this function calculates the "score before vote". This is useful over
    // simply using the {comment.vote_score}, because the user could have
    // already voted on this comment. So we take the score, take the vote
    // direction, and can calculate the comment's score "before" the user's
    // vote.
    const checkVoteDirection = () => {
      if (comment.is_voted_up) {
        setScoreBeforeVote(comment.vote_score - 1);
        setVoteDirection(DIRECTION.UP);
        return;
      }
      if (comment.is_voted_down) {
        setScoreBeforeVote(comment.vote_score + 1);
        setVoteDirection(DIRECTION.DOWN);
      } else {
        setScoreBeforeVote(comment.vote_score);
        setVoteDirection(DIRECTION.NEUTRAL);
      }
    };
    checkVoteDirection();
  }, [comment.vote_score, comment.is_voted_down, comment.is_voted_up]);

  //this function serializes the direction that we will send to the API to vote
  const serializeDirection = (direction) => {
    if (direction === "up" || direction === "down") {
      return {
        action: direction,
      };
    }
  };

  const renderVotingButtons = () => {
    if (voteDirection === DIRECTION.UP) {
      return (
        <div className="text-center">
          <button className="btn btn-link" onClick={() => unvote()}>
            <FontAwesomeIcon icon={faArrowAltCircleUp} />
          </button>

          <button className="btn" onClick={() => vote("down")}>
            <FontAwesomeIcon icon={faArrowDown} />
          </button>
          <h4>{commentScore}</h4>
        </div>
      );
    } else if (voteDirection === DIRECTION.DOWN) {
      return (
        <div className="text-center">
          <button className="btn" onClick={() => vote("up")}>
            <FontAwesomeIcon icon={faArrowUp} />
          </button>

          <button className="btn btn-link" onClick={() => unvote()}>
            <FontAwesomeIcon icon={faArrowAltCircleDown} />
          </button>
          <h4>{commentScore}</h4>
        </div>
      );
    } else {
      // neutral vote direction
      return (
        <div className="text-center">
          <button className="btn" onClick={() => vote("up")}>
            <FontAwesomeIcon icon={faArrowUp} />
          </button>

          <button className="btn" onClick={() => vote("down")}>
            <FontAwesomeIcon icon={faArrowDown} />
          </button>
          <h4>{commentScore}</h4>
        </div>
      );
    }
  };
  //post voting data to server and set DOM state for better UX
  const vote = async (direction) => {
    if (loggedIn) {
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
    } else {
      alert("You must log in to be able to vote on comments!");
    }
  };
  //unvote sets the state back to the "scoreBeforeVote" variable
  const unvote = async () => {
    await axios.delete(`/api/comments/${comment.id}/vote/`, headers);
    setVoteDirection(DIRECTION.NEUTRAL);
    setCommentScore(scoreBeforeVote);
  };

  return <>{renderVotingButtons()}</>;
}
