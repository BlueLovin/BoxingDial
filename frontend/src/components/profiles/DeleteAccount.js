import axios from "axios";
import { useState, useContext } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Button } from "reactstrap";
import { UserContext } from "../../UserContext";
import DeleteAccountModal from "../modals/DeleteAccountModal";

export default function DeleteAccount() {
  // context
  const { headersVal } = useContext(UserContext);
  const [headers] = headersVal;

  // state
  const [modal, setModal] = useState(false);
  const [password, setPassword] = useState();
  const history = useHistory();
  const [error, setError] = useState("");

  const toggleModal = () => {
    setModal(!modal);
  };

  const deleteAccount = () => {
    const data = { password: password };
    const temp_headers = { ...headers, data: data };

    axios
      .delete("/api/user/delete", temp_headers)
      .then(() => {
        // send to home page and reload page.
        history.push("/");
        window.location.reload();
      })
      .catch((err) => {
        setError(err.response.data.error);
      });
  };

  const verifyUserDecision = () => {
    const confirmed = window.confirm(
      "Are you ABSOLUTELY sure you want to " +
        "delete your account, along with all of your posts/comments?"
    );

    if (confirmed) {
      deleteAccount();
    }
  };

  return (
    <>
      <div className="card card-body mt-5">
        <h2 className="text-center">Security</h2>
        <hr />
        <Button className="btn btn-danger" onClick={() => toggleModal()}>
          Delete Account
        </Button>
      </div>

      {modal ? (
        <DeleteAccountModal
          password={password}
          setPassword={setPassword}
          error={error}
          onSave={verifyUserDecision}
          toggle={toggleModal}
          autoFocus={false}
        />
      ) : null}
    </>
  );
}
