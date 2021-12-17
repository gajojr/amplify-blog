import { API, graphqlOperation } from 'aws-amplify';
import React from 'react';
import { deletePost } from '../graphql/mutations';

const DeletePost = ({ post }) => {
	async function handleDeletePost(id) {
		const input = {
			id
		}

		await API.graphql(graphqlOperation(deletePost, { input }));
	}

	return (
		<button onClick={() => handleDeletePost(post.id)}>Delete</button>
	)
}

export default DeletePost;
