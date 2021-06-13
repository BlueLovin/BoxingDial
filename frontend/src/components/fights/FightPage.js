import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { UserContext } from "../../UserContext";
import Post from "../posts/Post";
import Fight from "./Fight";
import Modal from "../posts/PostModal";
export default function FightPage() {
  const params = useParams();
  const fightID = params.fightID;

  const { tokenVal, userVal } = useContext(UserContext);
  const [user] = userVal;
  const [token] = tokenVal;
  const [modal, setModal] = useState(false);
  const [fightData, setFightData] = useState();
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState({
    fight: null,
    content: "",
    comments: [],
    owner: null,
    username: null,
  });

  useEffect(() => {
    fetchFightData();
  }, []);

  const fetchFightData = async () => {
    setLoading(true);
    let data = {};
    //fetch fight data
    await axios.get(`/api/fights/${fightID}/`).then((res) => {
      data = res.data;
    });
    console.log(data);
    setFightData(data); // set local fight object
    setLoading(false);
  };
  const options = {
    "content-type": "application/json",
    Authorization: `Token ${token}`,
  };
  const renderPosts = () => {
    return fightData.posts
      .slice(0)
      .reverse()
      .map((post) => (
        <>
          <Post post={post} /> <br />
        </>
      ));
  };
  const toggle = () => {
    setModal(!modal);
  };
  const submitPost = async (item) => {
    toggle();

    await axios
      .post("/api/post/create/", item, { headers: options })
      .then((res) => fetchFightData());
  };
  const createItem = () => {
    const item = {
      fight: fightData.id,
      content: "",
      comments: [],
      owner: user.id,
      username: user.username,
    };
    setActiveItem(item);
    setModal(!modal);
  };
  const renderCreatePost = () => {
    if (!user) {
      return (
        <div>
          <h3 className="text-center">Log in to make a post</h3>
        </div>
      );
    } else {
      return (
        <div>
          <h3 className="text-center">Create a post!</h3>
          <div className="text-center">
            <button className="btn btn-primary " onClick={createItem}>
              Create Post
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <br />
      {loading ? (
        "loading"
      ) : (
        <>
          <div className="container w-75 bg-light bg-gradient">
            <h1 className="text-center display-4">{fightData.title}</h1>
            <hr />
            <Fight fightData={fightData} />
            <br />
            {renderCreatePost()}
            <h4 className="text-center">Posts</h4>
            {renderPosts()}
          </div>{" "}
          {modal ? (
            <Modal
              activeItem={activeItem}
              toggle={toggle}
              onSave={submitPost}
            />
          ) : null}
        </>
      )}
    </>
  );
}
