import { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Post from "../posts/Post";
import { Nav, NavItem, TabContent, TabPane, NavLink, Button } from "reactstrap";
import Comment from "../comments/Comment";
import { UserContext } from "../../UserContext";
import FollowButton from "./FollowButton";

export default function UserProfile() {
  const params = useParams();
  const username = params.username;
  const [postsList, setPostsList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [profileFollowingList, setFollowingList] = useState(null);
  const [profileFollowersList, setFollowersList] = useState(null);

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const { headersVal } = useContext(UserContext);
  const [headers] = headersVal;

  const fetchUserPosts = useCallback(async () => {
    setLoading(true);
    await axios.get(`/api/users/${username}/posts/`, headers).then((res) => {
      setPostsList(res.data);
    });
    await axios.get(`/api/users/${username}/comments/`).then((res) => {
      setCommentsList(res.data);
      setLoading(false);
    });
  }, [username, headers]);

  useEffect(() => {
    setLoading(true);
    const fetchProfile = async () => {
      //fetch profile with token
      //if token fails, fetch without token
      await axios
        .get(`/api/users/${username}/`, headers)
        .then((res) => {
          setProfile(res.data);
        })
        .catch(() => {
          window.location = "/404/"; //404 if user doesnt exist
        });
      // set profile followers list
      await axios.get(`/api/users/${username}/following/`).then((res) => {
        setFollowingList(res.data);
      });
      // set profile following list
      await axios.get(`/api/users/${username}/followers/`).then((res) => {
        setFollowersList(res.data);
      });
      setLoading(false);
    };
    fetchUserPosts();
    fetchProfile();
  }, [fetchUserPosts, username, headers]);

  const renderProfilePosts = () => {
    return postsList.map((post, i) => (
      <div key={i}>
        <br />
        <Post post={post} updateStateFunction={fetchUserPosts} />
      </div>
    ));
  };

  const renderProfileComments = () => {
    return commentsList.map((comment, i) => (
      <div key={i}>
        <br />
        <Comment comment={comment} contextButton={true} />
      </div>
    ));
  };
  const renderProfileFollowers = () => {
    if (profileFollowersList !== null) {
      return profileFollowersList.map((follower, i) => (
        <div key={i}>
          <br />
          <p>{follower.user_id.username}</p>
        </div>
      ));
    }
    return "loading...";
  };
  const renderProfileFollowing = () => {
    if (profileFollowingList) {
      return profileFollowingList.map((following_user, i) => (
        <div key={i}>
          <br />
          <p>{following_user.following_user_id.username}</p>
        </div>
      ));
    }
    return "loading...";
  };

  return (
    <>
      {loading || !profile ? (
        "loading"
      ) : (
        <>
          <h1 className="text-center">
            {`${username}'s Profile `}
            <FollowButton profile={profile} />
          </h1>
          <br />

          <br />
          <Nav tabs className="justify-content-center">
            <NavItem>
              <NavLink
                className={activeTab === "1" ? "active" : ""}
                onClick={() => setActiveTab("1")}
              >
                Posts
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === "2" ? "active" : ""}
                onClick={() => setActiveTab("2")}
              >
                Comments and Replies
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === "3" ? "active" : ""}
                onClick={() => {
                  setActiveTab("3");
                }}
              >
                Following
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === "4" ? "active" : ""}
                onClick={() => {
                  setActiveTab("4");
                }}
              >
                Followers
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">{renderProfilePosts()}</TabPane>
            <TabPane tabId="2">{renderProfileComments()}</TabPane>
            <TabPane tabId="3">{renderProfileFollowing()}</TabPane>
            <TabPane tabId="4">{renderProfileFollowers()}</TabPane>
          </TabContent>
        </>
      )}
    </>
  );
}
