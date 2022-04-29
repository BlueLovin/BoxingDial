import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Button, FormGroup, Input } from "reactstrap";
import DeleteAccount from "../../components/profiles/DeleteAccount";
import { UserContext } from "../../context/UserContext";

export default function EditProfile() {
  const { userVal, loggedInVal, headersVal } = useContext(UserContext);
  const [user] = userVal;
  const [headers] = headersVal;
  const [loggedIn] = loggedInVal;
  const [profile, setNewProfile] = useState({});
  const [fieldCharCounts, setFieldCharCounts] = useState({
    screen_name: 0,
    bio: 0,
  });
  const history = useHistory();

  const MAX_CHAR_COUNT = {
    screen_name: 15,
    bio: 500,
  };

  useEffect(() => {
    if (loggedIn === true) {
      setNewProfile(user.profile);
      setFieldCharCounts({
        screen_name: user.profile.screen_name.length,
        bio: user.profile.bio.length,
      });
    } else {
      // if not logged in, go to home page
      history.push("/");
    }
  }, [user, loggedIn, history]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    console.log(profile);
    if (name === "new_avatar") {
      setNewProfile((p) => ({ ...p, new_avatar: e.target.files[0] }));
      return;
    }
    setNewProfile((p) => ({ ...p, [name]: value }));
    setFieldCharCounts((oldCount) => ({ ...oldCount, [name]: value.length }));
  };

  const sumbitNewProfile = (e) => {
    e.preventDefault();

    const _headers = { ...headers, "content-type": "multipart/form-data" };
    let formData = new FormData();
    if (profile.new_avatar) {
      formData.append(
        "new_avatar",
        profile.new_avatar,
        profile.new_avatar.name
      );
    }
    formData.append("bio", profile.bio);
    formData.append("screen_name", profile.screen_name);
    axios
      .post("/user/change-profile", formData, _headers)
      .then(() => history.push(`/user/${user.username}`));
  };

  return (
    <div className="container login-container">
      <div className="card card-body mt-5">
        <h2 className="text-center">Profile Settings</h2>
        <form onSubmit={sumbitNewProfile}>
          <FormGroup>
            <div>screen name:</div>
            <Input
              type="text"
              name="screen_name"
              value={profile.screen_name}
              onChange={handleChange}
              maxLength={MAX_CHAR_COUNT.screen_name}
            />
            {`${fieldCharCounts.screen_name} / 15`}
          </FormGroup>
          <FormGroup>
            <div>bio:</div>
            <Input
              type="textarea"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              maxLength={MAX_CHAR_COUNT.bio}
            />
            {`${fieldCharCounts.bio} / 500`}
          </FormGroup>
          <FormGroup>
            <div>avatar:</div>
            <Input
              type="file"
              name="new_avatar"
              accept="image/*"
              onChange={handleChange}
            />
          </FormGroup>
          <Button type="submit" className="btn btn-primary">
            Update
          </Button>
        </form>
      </div>
      <DeleteAccount />
    </div>
  );
}
