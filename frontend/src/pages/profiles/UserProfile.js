import { ProfilePageTabs } from "./../../components/profiles/ProfilePageTabs";
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Post from "../../components/posts/Post";
import { Button } from "reactstrap";
import { UserContext } from "../../context/UserContext";
import FollowButton from "../../components/profiles/FollowButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import BlockButton from "../../components/profiles/BlockButton";
import { UserNotFoundPage } from "./UserNotFoundErrorPage";

export default function UserProfile() {
  const params = useParams();
  const username = params.username;
  const [userBlocksYou, setUserBlocksYou] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [postsList, setPostsList] = useState([]);
  const [profileFollowingList, setFollowingList] = useState([]);
  const [profileFollowersList, setFollowersList] = useState([]);

  const [profile, setProfile] = useState({});

  const [activeTab, setActiveTab] = useState("1");

  const { headersVal } = useContext(UserContext);
  const [headers] = headersVal;
  const { userVal } = useContext(UserContext);
  const [user] = userVal;

  // get user posts if you are not blocking this profile
  useEffect(() => setIsBlocked(profile.blocked), [profile, headers, username]);

  useEffect(() => {
    const fetchUserPosts = () => {
      const notBlocked =
        (profile.blocks_you === false || profile.blocks_you === undefined) &&
        (profile.blocked === false || profile.blocked === undefined);

      if (profile !== undefined && notBlocked) {
        axios
          .get(`/users/${username}/posts/`, headers)
          .then((res) => setPostsList(res.data));
      } else {
        setPostsList([]);
      }
    };
    if (profile.id !== undefined) {
      fetchUserPosts();
    }
  }, [isBlocked, headers, profile, username]);

  useEffect(() => {
    const fetchProfile = () => {
      //fetch profile with token
      //if token fails, fetch without token
      axios
        .get(`/users/${username}/`, headers)
        .then((res) => {
          setProfile(res.data);
          setIsBlocked(res.data.blocked);
          setUserBlocksYou(res.data.blocks_you);
        })
        //404 if user doesnt exist
        .catch(() => (window.location = "/404/"));
      // set profile followers list
      axios
        .get(`/users/${username}/following/`)
        .then((res) => setFollowingList(res.data));
      // set profile following list
      axios
        .get(`/users/${username}/followers/`)
        .then((res) => setFollowersList(res.data));
    };
    fetchProfile();
  }, [username, headers]);

  const removePostFromView = (post) => {
    setPostsList(postsList.filter((i) => post !== i));
  };

  const renderProfilePosts = () => {
    return postsList.map((post) => (
      <div key={post.id}>
        <br />
        <Post
          post={post}
          removePostFromParentList={() => removePostFromView(post)}
        />
      </div>
    ));
  };

  const renderProfileFollowers = () => {
    if (profileFollowersList) {
      return profileFollowersList.map((follower) => (
        <div key={follower.id}>
          <br />
          <p>{follower.user_id.username}</p>
        </div>
      ));
    }
    return "loading...";
  };
  const renderProfileFollowing = () => {
    if (profileFollowingList) {
      return profileFollowingList.map((following_user) => (
        <div key={following_user.following_user_id}>
          <br />
          <p>{following_user.following_user_id.username}</p>
        </div>
      ));
    }
    return "loading...";
  };

  if (!profile) {
    return "loading";
  }

  if (userBlocksYou) {
    return (
      <>
        <UserNotFoundPage />
      </>
    );
  }

  return (
    <>
      <h1 className="text-center">
        {/* show screen name if they have one */}
        {`${
          profile.profile ? profile.profile.screen_name : username
        }'s Profile`}

        {/* show follow button if user is not blocked */}
        {!isBlocked ? <FollowButton profile={profile} /> : null}

        <BlockButton
          isBlockedState={[isBlocked, setIsBlocked]}
          profile={profile}
        />
      </h1>
      <div className="container justify-content-center d-flex">
        <p className="list-group-item w-25 text-center">
          {/* show bio if they have one */}
          {profile.profile && profile.profile.bio.length > 0
            ? profile.profile.bio
            : null}
        </p>
      </div>

      {/* only shows on YOUR profile */}
      <div className="d-flex justify-content-center">
        {user && user.username === username ? (
          <Button href="/edit-profile">
            <FontAwesomeIcon icon={faPencilAlt}></FontAwesomeIcon>
            {" Edit Profile"}
          </Button>
        ) : null}
      </div>

      <br />

      <br />
      <ProfilePageTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderProfilePosts={renderProfilePosts}
        username={username}
        renderProfileFollowing={renderProfileFollowing}
        renderProfileFollowers={renderProfileFollowers}
      />
    </>
  );
}
