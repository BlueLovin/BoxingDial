import React, {useContext, useState} from "react";
import {Link} from 'react-router-dom';
import axios from "axios";
import {
    Button
  } from "reactstrap";
import { UserContext } from "../../UserContext";

export default function Register() {
    const [activeItem, setActiveItem] = useState({
        username: '',
        email: '',
        password: ''
    });
    const {setUser} = useContext(UserContext);

    const handleChange = (e) => { // this.setState({ [e.target.name]: e.target.value });
        let {name, value} = e.target;

        const item = {
            ...activeItem,
            [name]: value
        };

        setActiveItem(item);
        console.log(activeItem)
    }

    const submitUser = (item) => {

        console.log(activeItem)
        axios // create
        .post("/api/token-auth/register", item)
        .then((res) => {
            localStorage.setItem('token', res.data.token);
            setUser(res.data);
        });

        setActiveItem({ // RESET TEXT BOX
            username: '',
            email: '',
            password: ''
        })
    };


    return (
        <div className="col-md-6 m-auto">
            <div className="card card-body mt-5">
                <h2 className="text-center">Register</h2>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-control" name="username"
                            onChange={handleChange}
                            value={
                                activeItem.username
                            }/>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-control" name="email"
                            onChange={handleChange}
                            value={
                                activeItem.email
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
                        <label>Confirm Password</label>
                        <input type="password" className="form-control" name="confirmationPassword"
                            onChange={handleChange}
                            />
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
                        Already have an account? 
                        <Link to="/login"> Login</Link>
                    </p>
            </div>
        </div>
    )
}
