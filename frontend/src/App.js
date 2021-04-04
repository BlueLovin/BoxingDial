import React, { Component, useEffect, useState } from "react";
import Modal from "./components/Modal";
import axios from "axios";

function App() {
  const [postList, setpostList] = useState([]);
  const [modal, setModal] = useState(false);
  const [activeItem, setActiveItem] = useState({
    fight: "",
    content: "",
  })
  useEffect (() => {
    refreshList();
  },[])

  const refreshList = () => {
    axios
      .get("/api/posts/")
      // .then((res) => this.setState({ postList: res.data }))
      .then((res) => setpostList(res.data))
      .catch((err) => console.log(err));
  };

  const toggle = () => {
    setModal(!modal);
  };

  const handleSubmit = (item) => {
    toggle();

    if (item.id) {
      axios
        .put(`/api/posts/${item.id}/`, item)
        .then((res) => refreshList());
      return;
    }
    axios
      .post("/api/posts/", item)
      .then((res) => refreshList());
  };

  const handleDelete = (item) => {
    axios
      .delete(`/api/posts/${item.id}/`)
      .then((res) => refreshList());
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



  const renderItems = () => {

    return postList.map((item) => (
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
                {renderItems()}
              </ul>
            </div>
          </div>
        </div>
        {modal ? (
          <Modal
            activeItem={activeItem}
            toggle={toggle}
            onSave={handleSubmit}
          />
        ) : null}
      </main>
    );
}

export default App;
