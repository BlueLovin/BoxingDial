import { UserContext } from "../../UserContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Post from "../posts/Post";
import FeedComment from "../comments/FeedComment";
import { Card, Container } from "reactstrap";

export default function UserFeed() {
  const [feed, setFeed] = useState(null);
  const { userVal } = useContext(UserContext);
  const [user] = userVal;

  useEffect(() => {
    const fetchPostsAndComments = async () => {
      let token = localStorage.getItem("token");
      let config = {
        headers: {
          Authorization: `Token ${token}`,
        },
      };
      if (token) {
        await axios.get("/api/feed/recent", config)
        .then((res) => {
          setFeed(res.data);
        });
      }
    };
    fetchPostsAndComments();
  }, []);

  const renderPosts = () => {
    //logged in, not following anybody feed
    if (user && user.following.length === 0) {
      //link here to see all the users of the site?
      //maybe an explore page?
      return (
        <p className="text-center p-3 m-3">
          Welcome to your feed! Follow somebody to see their posts here.
        </p>
      );
    }

    if (feed) {
      console.log(feed);
      // the following ternary is to determine if the current item
      // is a post or a comment, and
      return feed.map((item, i) => (
        <div key={i}>
          {item.fight ? (
            <Post post={item} />
          ) : (
            <FeedComment comment={item} user={user} contextButton={true} />
          )}
          <br />
        </div>
      ));
    }
  };

  return (
    <>
      <Container>
        <Card className="p-3 m-3">
          <div>{feed ? renderPosts() : "loading"}</div>
        </Card>
      </Container>
    </>
  );
}
