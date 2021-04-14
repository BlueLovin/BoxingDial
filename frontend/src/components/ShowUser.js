import {useEffect, useState} from "react"
import useLocalStorage from "./hooks/useLocalStorage"
import axios from "axios";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import Logout from "./accounts/Logout";


export default function ShowUser() {
    const [user, setUser] = useState({});
    const [token, setToken] = useLocalStorage();
    const [loggedIn, setLoggedIn] = useState();


    useEffect(() => { // update user
        getToken();
        fetchUser();
    });

    const getToken = () => {
        setToken(localStorage.getItem('token'));
        if(token.Length > 1){
            setLoggedIn(true);
        }
    }

    const Logout = () => {
        setLoggedIn(false);

        getToken();
    
        axios.post("api/token-auth/logout", {}, {
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


    const fetchUser = () => {
            axios.get("api/token-auth/user", {
                headers: {
                    "Authorization": `Token ${
                        token
                    }`
                }
            }).then((res) => setUser(res.data)).catch(function (error) {
                console.log(error.response.status) // 401
                console.log(error.response.data.error) //Please Authenticate or whatever returned from server
            });
        }
    
        console.log(user);

    const renderUsername = () => {

        if(user.username){
            return(
                <div>
                    <h1>
                        Welcome, {user.username}! <Link onClick={() => Logout()}>Logout</Link>
                    </h1>
                </div>
            )
        }
        else{
            return(
                <div>
                    <h1>
                    <Link to='/login'>Login</Link>
                    </h1>
                </div>
            )
        }
    }

    return(
        <div className="text-center">
            <h1>
                {renderUsername()}
            </h1>
        </div>
    )
}
