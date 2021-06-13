import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Post from "../posts/Post";

export default function UserProfile() {
  const params = useParams();
  const userID = params.userID;

  const [postsList, setPostsList] = useState({});
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserPosts = async () => {
    setLoading(true);
    await axios.get(`/api/users/${userID}/posts`).then((res) => {
      setPostsList(res.data);
      setLoading(false);
    });
  };

  const fetchProfile = async () => {
    await axios.get(`/api/users/${userID}`).then((res) => {
      setProfile(res.data[0]);
      console.log(profile);
    });
  };

  const renderPosts = () => {
    return postsList.map((post) => (
      <>
        <Post post={post} />
      </>
    ));
  };

  return (
    <>
      {loading || !profile ? (
        "loading"
      ) : (
        <>
          <h1 className="text-center">{profile.username}'s Profile</h1>
          <br />
          <h3 className="text-center">Posts</h3>
          {renderPosts()}
        </>
      )}
    </>
  );
}
