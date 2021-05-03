import { useState, useContext, useParams } from 'react';
import { UserContext } from "../../UserContext";


export default function UserProfile() {
    const params = useParams();
    const postID = params.username;

    const { userVal } = useContext(UserContext);
    const [user] = userVal;

    const renderPosts = () => {
        return 
    }

    return (
        <>
        </>
    );
}