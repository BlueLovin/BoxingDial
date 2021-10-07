import React, { useContext } from "react";
import RecentPosts from "../../components/posts/RecentPosts";
import RecentFights from "../../components/fights/RecentFights";
import { UserContext } from "../../UserContext";
import { Row, Col } from "reactstrap";
import UserFeed from "../../components/feed/UserFeed";

export default function HomePage() {
  const { loggedInVal } = useContext(UserContext);
  const [loggedIn] = loggedInVal;

  const renderHome = () => {
    if (loggedIn) {
      return <UserFeed />;
    }
    if (loggedIn === false) {
      return (
        <Row>
          <Col>
            <RecentFights />
          </Col>
          <hr />
          <Col>
            <RecentPosts />
          </Col>
        </Row>
      );
    } else {
      return <p>loading...</p>;
    }
  };

  return (
    <main className="container">
      <br />
      <h2 className="text-center">Home</h2>
      <hr />
      {renderHome()}
    </main>
  );
}