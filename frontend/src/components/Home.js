import React, { useEffect, useState, useContext } from "react";
import Modal from "./Modal";
import Register from "./accounts/Register"
import ShowUser from "./ShowUser"
import axios from "axios";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { UserContext } from "../UserContext";

function App() {
  const [postList, setpostList] = useState([]);
  const [modal, setModal] = useState(false);
  const {tokenVal, userVal} = useContext(UserContext);
  const [user, setUser] = userVal;
  const [token, setToken] = tokenVal;
  const [activeItem, setActiveItem] = useState({
    fight: "",
    content: "",
    comments: [],
    owner: user ? user.id : null,
    username: user ? user.username : null,
  })

  useEffect(async () => {
    refreshPostList();
  }, [token])



const options = {
  'content-type': 'application/json',
  'Authorization': `Token ${token}`,
}

  const refreshPostList = () => {
    axios
      .get("/api/posts/")
      .then((res) => setpostList(res.data))
      .catch((err) => console.log(err));
  };

  const toggle = () => {
    setModal(!modal);
  };

  const submitPost = async (item) => {
    toggle();

    if (item.id) {
      await axios
        .put(`/api/posts/${item.id}/`, item)
        .then((res) => refreshPostList());
      return;
    }
    await axios
      .post("/api/posts/", item, {headers: options})
      .then((res) => refreshPostList());
  };

  const handleDelete = (item) => {
    axios
      .delete(`/api/posts/${item.id}/`)
      .then((res) => refreshPostList());
  };

  const createItem = () => {
    const item = { fight: "", content: "", comments: [], owner: user.id , username: user.username};
    setActiveItem(item);
    setModal(!modal);

    // this.setState({ activeItem: item, modal: !this.state.modal });
  };

  const editItem = (item) => {
    // this.setState({ activeItem: item, modal: !this.state.modal });
    setActiveItem(item);
    setModal(!modal);
  };


  const renderPosts = () => {

    return postList.map((item) => (
      <>
        <li
          key={item.id}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <span
            fight={item.content}
          >
            {item.fight}
          </span>
          <span>
            <Link to={"/post/" + item.id}>
              <button
                className="btn btn-secondary mr-2"
                href="/post/"
              >
                View
          </button>
            </Link>
            <button
              className="btn btn-secondary mr-2"
              onClick={() => editItem(item)}
            >
              Edit
          </button>
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(item)}
            >
              Delete
          </button>
          </span>
        </li>
        <div className="container flex-d">
          by {item.username ? item.username : "null"}
        </div>
        <hr />
      </>
    ));


  };
  return (
    <main className="container">
      <ShowUser />
      {JSON.stringify(user)}<br/>
      {JSON.stringify(token)}
      <div className="row">
        <div className="col-md-6 col-sm-10 mx-auto p-0">
          <div className="card p-3">
            <div className="mb-4 text-center">
              <button
                className="btn btn-primary "
                onClick={createItem}
              >
                Create Post
                </button>
            </div>
            <ul className="list-group list-group-flush border-top-0">
              {renderPosts()}
            </ul>
          </div>
        </div>
      </div>
      {modal ? (
        <Modal
          activeItem={activeItem}
          toggle={toggle}
          onSave={submitPost}
        />
      ) : null}
      <Register />
    </main>
  );
}

export default App;
