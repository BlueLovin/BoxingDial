import React, {useState} from "react";
import useLocalStorage from "../hooks/useLocalStorage"
import {Link, Redirect} from 'react-router-dom';
import axios from "axios";

export default function Logout() {
    const [token, setToken] = useLocalStorage();

    setToken(localStorage.getItem('token'));

    axios.get("api/token-auth/user", {
        headers: {
            "Authorization": `Token ${
                token
            }`
        }
    }).then(//redirect
    )
    .catch(function (error) {
        console.log(error.response.status) // 401
        console.log(error.response.data.error) //Please Authenticate or whatever returned from server
    });
}