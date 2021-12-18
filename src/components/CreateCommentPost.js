import { API, Auth, graphqlOperation } from 'aws-amplify';
import React, { useState, useEffect } from 'react';
import { createComment } from '../graphql/mutations';

const CreateCommentPost = ({ postId }) => {
	const [comment, setComment] = useState({
		commentOwnerId: '',
		commentOwnerUsername: '',
		content: ''
	});

	useEffect(() => {
		(async () => {
			const user = await Auth.currentUserInfo();
			setComment(prevState => ({
				...prevState,
				commentOwnerId: user.attributes.sub,
				commentOwnerUsername: user.username
			}));
		})();
	}, []);

	function handleChangeContent(event) {
		setComment(prevState => ({
			...prevState,
			content: event.target.value
		}));
	}

	async function handleAddComment(event) {
		event.preventDefault();

		const input = {
			commentOwnerId: comment.commentOwnerId,
			commentOwnerUsername: comment.commentOwnerUsername,
			content: comment.content,
			createdAt: new Date().toISOString(),
			postCommentsId: postId
		};

		await API.graphql(graphqlOperation(createComment, { input }));
		setComment(prevState => ({
			...prevState,
			content: ''
		}));
	}

	return (
		<div>
			<form className='add-comment' onSubmit={handleAddComment}>
				<textarea
					name="content"
					rows="3"
					cols="40"
					required
					placeholder='Add Your comment'
					value={comment.content}
					onChange={handleChangeContent}
				></textarea>
				<input
					style={{ fontSize: '19px' }}
					value="Add Comment"
					className='btn'
					type="submit"
				/>
			</form>
		</div>
	)
}

export default CreateCommentPost;
