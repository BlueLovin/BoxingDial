import { useState, useContext, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../../UserContext";
import axios from "axios";


export default function UserProfile() {
  const params = useParams();
  const userID = params.userID;

  const [postsList, setPostsList] = useState({});
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    setLoading(true);
    await axios.get(`/api/users/${userID}/posts`)
      .then((res) => {
        setPostsList(res.data);
        setLoading(false);
        // console.log(res.data);
      });
  };

  const fetchProfile = async () => {
    await axios.get(`/api/users/${userID}`)
      .then((res) => {
        setProfile(res.data[0]);
        console.log(profile);
      })
  }

  const renderPosts = () => {
    if (!loading) {
      // console.log("render posts called");
      return postsList.map((post) => (
        <Link to={`/post/${post.id}`}>{post.content}</Link>
      ));
    }
  }

  return (
    <>
      {loading || !profile ? "loading" :
        <>
          <h1 className="text-center">
            {profile.username}'s Profile
            </h1>
          <br />
          <h3>Posts</h3>
          {renderPosts()}
        </>
      }
    </>
  );
}