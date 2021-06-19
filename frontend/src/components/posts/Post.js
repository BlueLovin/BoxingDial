import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';

const Post = (props) => {
	//yes the following line is terrible. it checks if the argument was passed in or not. what the fuck
	//it works tho...
	let commentsButton = props.commentsButton !== false ? true : false;
	let post = props.post;
	return (
		<Container>
			<div className="list-group-item p-3">
				<span>
					<Link to={`/user/${post.owner}`}>{post.username}</Link>
				</span>
				<br />
				<br />
				<span className="font-weight-light list-group-item bg-light p-2 m-1 preserve-line-breaks">
					{post.content}
				</span>
				<div className="text-right m-1">
					{commentsButton ? (
						<p>
							<Link to={`/post/${post.id}`}>comments</Link>
						</p>
					) : null}
					<span>
						on: <Link to={`/fight/${post.fight.id}`}>{post.fight.title}</Link>
					</span>
				</div>
			</div>
		</Container>
	);
};
export default Post;
