import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import Comment from "../comments/Comment";

export default function ProfileComments(props) {
  const { username } = props;
  const [commentsList, setCommentsList] = useState([]);
  const { headersVal } = useContext(UserContext);
  const [headers] = headersVal;
  useEffect(() => {
    axios
      .get(`/users/${username}/comments/`, headers)
      .then((res) => setCommentsList(res.data));
  }, [headers, username]);

  const renderProfileComments = () => {
    return commentsList.map((comment) => (
      <div key={comment.id}>
        <br />
        <Comment comment={comment} showContextButton={true} />
      </div>
    ));
  };

  return <>{renderProfileComments()}</>;
}
