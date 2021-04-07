import React, { Component, useEffect, useState } from "react";
import Modal from "./Modal";
import axios from "axios";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

function App() {
  const [postList, setpostList] = useState([]);
  const [modal, setModal] = useState(false);
  const [activeItem, setActiveItem] = useState({
    fight: "",
    content: "",
  })
  useEffect(() => {
    refreshPostList();
  }, [])

  const refreshPostList = () => {
    axios
      .get("/api/posts/")
      // .then((res) => this.setState({ postList: res.data }))
      .then((res) => setpostList(res.data))
      .catch((err) => console.log(err));
  };

  const toggle = () => {
    setModal(!modal);
  };

  const submitPost = (item) => {
    toggle();

    if (item.id) {
      axios
        .put(`/api/posts/${item.id}/`, item)
        .then((res) => refreshPostList());
      return;
    }
    axios
      .post("/api/posts/", item)
      .then((res) => refreshPostList());
  };

  const handleDelete = (item) => {
    axios
      .delete(`/api/posts/${item.id}/`)
      .then((res) => refreshPostList());
  };

  const createItem = () => {
    const item = { fight: "", content: "" };
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
      <div>
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
          <span>
            fucl yuo
        </span>
        </li>
        <div className="container flex-d">
          by username123
        </div>
      </div>
    ));


  };
  return (
    <main className="container">
      <h1 className="text-white text-uppercase text-center my-4">Post app</h1>
      <div className="row">
        <div className="col-md-6 col-sm-10 mx-auto p-0">
          <div className="card p-3">
            <div className="mb-4">
              <button
                className="btn btn-primary"
                onClick={createItem}
              >
                Add task
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
    </main>
  );
}

export default App;
