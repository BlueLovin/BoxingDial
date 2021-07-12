import React, { useEffect, useContext } from 'react';
import RecentPosts from './posts/RecentPosts';
import RecentFights from './fights/RecentFights';
import { UserContext } from '../UserContext';
import { Row, Col } from 'reactstrap';
import UserFeed from './feed/UserFeed';

function App() {
	const { userVal } = useContext(UserContext);
	const [user] = userVal;

	useEffect(() => {}, [user]);

	return (
		<main className="container">
			<br />
			{user ? (
				<UserFeed />
			) : (
				<Row>
					<Col>
						<RecentFights />
					</Col>
					<hr />
					<Col>
						<RecentPosts />
					</Col>
				</Row>
			)}
		</main>
	);
}

export default App;
