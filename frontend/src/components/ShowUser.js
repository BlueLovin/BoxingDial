import { useEffect, useContext } from "react"
import useLocalStorage from "./hooks/useLocalStorage"
import axios from "axios";
import { NavbarBrand } from "reactstrap";
import { NavLink } from "react-router-dom";
import { UserContext } from "../UserContext";


export default function ShowUser() {
    const [token, setToken] = useLocalStorage();
    const {userVal} = useContext(UserContext);
    const [user, setUser] = userVal; 

    useEffect(() => { // update user
        getToken();
        renderUsername();
    }, [token]);

    const getToken = () => {
        setToken(localStorage.getItem('token'));
    }

    const Logout = async () => {
        setUser(null);

        getToken();

        axios.post("api/token-auth/logout", {}, {
            headers: {
                "Authorization": `Token ${token
                    }`
            }
        }).then(
            window.location.reload()// reload page
        )
            .catch(function (error) {
                console.log(error.response.status) // 401
                console.log(error.response.data.error) //Please Authenticate or whatever returned from server
            });
        localStorage.removeItem('token');
    }


    


    const renderUsername = () => {

        if (user) {
            return (
                <div>
                    <NavbarBrand>Welcome, {user.username}! </NavbarBrand>
                    <NavLink onClick={() => Logout()} to="/">Logout</NavLink>
                </div>
            )
        }
        else {
            return (
                <div>
                    <NavLink to="/login">Login</NavLink>
                </div>
            )
        }
    }

    return (
        <div className="text-center">
            {renderUsername()}
        </div>
    )
}
