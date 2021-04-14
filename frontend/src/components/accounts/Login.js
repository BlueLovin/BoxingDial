import React, {useState} from "react";
import useLocalStorage from "../hooks/useLocalStorage"
import {Link, Redirect} from 'react-router-dom';
import axios from "axios";
import {
    Button
  } from "reactstrap";
  

export default function Register() {
    const [activeItem, setActiveItem] = useState({
        username: '',
        password: '',
    });
    // const [token, setToken] = useLocalStorage("token", "");
    const [loggedIn, setLoggedIn] = useState(false);

    const handleChange = (e) => { // this.setState({ [e.target.name]: e.target.value });
        let {name, value} = e.target;

        const item = {
            ...activeItem,
            [name]: value.trim(),
        };

        setActiveItem(item);
        console.log(activeItem)
    }

    const submitUser = (item) => {
        console.log(activeItem)
        axios // create
        .post("/api/token-auth/login", item)
        .then(res => {
          localStorage.setItem('token', res.data.token);
        //   axios.get("api/token-auth/user", { headers: {"Authorization" : `Token ${res.data.token}`}}).then((res)=>alert(JSON.stringify(res)));
        }).catch((res) => alert(res));

        setActiveItem({ // RESET TEXT BOX
            username: '',
            password: '',
        })
    };

    return (
        <div className="col-md-6 m-auto">
            <div className="card card-body mt-5">
            {loggedIn ? <Redirect to="/"/> : null}
                <h2 className="text-center">Login</h2>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-control" name="username"
                            onChange={handleChange}
                            value={
                                activeItem.username
                            }/>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" name="password"
                            onChange={handleChange}
                            value={
                                activeItem.password
                            }/>
                    </div>
                    <div className="form-group">
                        <Button color="success"
                            onClick={
                                () => submitUser(activeItem)
                        }>
                            Register
                        </Button>
                    </div>
                    <p>
                        Don't have an account?
                        <Link to="/register">Login</Link>
                    </p>
            </div>
        </div>
    )
}