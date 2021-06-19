import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';

const Comment = (props) => {
	const comment = props.comment;
    const user = props.user;

	const deleteComment = (comment) => {
		axios.delete(`/api/comments/${comment.id}/`);
	};

	return (
		<Container>
			<div className="list-group-item bg-light">
				<p>{comment.content}</p>
				<div className="list-group-item d-flex justify-content-between align-items-center">
					<Link to={`/user/${comment.owner}`}>
						<p className="text-muted"> by {comment.username}</p>
					</Link>
					{user && user.username === comment.username ? (
						<React.Fragment>
							<button className="btn btn-danger" onClick={() => deleteComment(comment)}>
								Delete
							</button>
						</React.Fragment>
					) : null}
				</div>
			</div>
			<hr />
		</Container>
	);
};

export default Comment;