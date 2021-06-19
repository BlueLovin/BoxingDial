import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Post from '../posts/Post';
import { Nav, NavItem, TabContent, TabPane, NavLink } from 'reactstrap';
import Comment from '../comments/Comment';
import { UserContext } from '../../UserContext';

export default function UserProfile() {
	const params = useParams();
	const userID = params.userID;

	const [postsList, setPostsList] = useState({});
	const [commentsList, setCommentsList] = useState({});
	const [profile, setProfile] = useState({});
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('1');
  const { userVal } = useContext(UserContext);
  const [user] = userVal;

	const toggle = (tab) => {
		if (activeTab !== tab) setActiveTab(tab);
	};
	useEffect(() => {
		const fetchUserPosts = async () => {
			setLoading(true);
			await axios.get(`/api/users/${userID}/posts`).then((res) => {
				setPostsList(res.data);
			});
      await axios.get(`/api/users/${userID}/comments`).then((res) => {
				setCommentsList(res.data);
				setLoading(false);
			});
		};

		const fetchProfile = async () => {
			await axios.get(`/api/users/${userID}`).then((res) => {
				setProfile(res.data[0]);
			});
		};
		fetchProfile();
		fetchUserPosts();
	}, [userID]);

	const renderUserPosts = () => {
		return postsList.map((post) => (
			<>
				<br />
				<Post post={post} />
			</>
		));
	};

  const renderUserComments = () => {
		return commentsList.map((comment) => (
			<>
				<br />
				<Comment comment={comment} user={user} />
			</>
		));
	};

	return (
		<>
			{loading || !profile ? (
				'loading'
			) : (
				<>
					<h1 className="text-center">{profile.username}'s Profile</h1>
					<br />
					<div className="">
						<Nav tabs className="justify-content-center">
							<NavItem>
								<NavLink className={activeTab == '1' ? 'active' : ''} onClick={() => setActiveTab('1')}>
									Posts
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink className={activeTab == '2' ? 'active' : ''} onClick={() => setActiveTab('2')}>
									Comments and Replies
								</NavLink>
							</NavItem>
						</Nav>
						<TabContent activeTab={activeTab}>
							<TabPane tabId="1">{renderUserPosts()}</TabPane>
							<TabPane tabId="2">{renderUserComments()}</TabPane>
						</TabContent>
					</div>
				</>
			)}
		</>
	);
}
