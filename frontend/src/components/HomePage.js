import React, { useEffect, useContext } from 'react';
import RecentPosts from './posts/RecentPosts';
import RecentFights from './fights/RecentFights';
import { UserContext } from '../UserContext';
import { Row, Col } from 'reactstrap';
import UserFeed from './feed/UserFeed';

function App() {
	const { userVal, loggedInVal } = useContext(UserContext);
	const [user] = userVal;
	const [loggedIn] = loggedInVal;

	const renderHome = () => {
		if(loggedIn !== null && user){
			if(loggedIn){
				return <UserFeed />;
			}
		}
    if(loggedIn === false){
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
    }
    else{
      return <p>loading...</p>
    }
	}

	return (
		<main className="container">
			<br />
      <h4>Home</h4>
			{renderHome()}
		</main>
	);
}

export default App;
