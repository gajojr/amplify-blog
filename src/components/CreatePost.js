import { API, graphqlOperation, Auth } from 'aws-amplify';
import React, { useState, useEffect } from 'react';
import { createPost } from '../graphql/mutations';

const CreatePost = () => {
	const [post, setPost] = useState({
		postOwnerId: '',
		postOwnerUsername: '',
		postTitle: '',
		postBody: ''
	});

	useEffect(() => {
		(async () => {
			const user = await Auth.currentUserInfo();
			setPost(prevState => ({
				...prevState,
				postOwnerId: user.attributes.sub,
				postOwnerUsername: user.username
			}));
		})();
	}, []);

	function handleInputChange(event) {
		setPost(prevState => ({ ...prevState, [event.target.name]: event.target.value }));
	}

	async function addPost(event) {
		event.preventDefault();

		const input = {
			postOwnerId: post.postOwnerId,
			postOwnerUsername: post.postOwnerUsername,
			postTitle: post.postTitle,
			postBody: post.postBody,
			createdAt: new Date().toISOString()
		}

		console.log(input);

		await API.graphql(graphqlOperation(createPost, { input }));
		setPost(prevState => ({
			...prevState,
			postTitle: '',
			postBody: ''
		}));
	}

	return (
		<form className='add-post' onSubmit={addPost}>
			<input
				style={{ font: '19px' }}
				type='text'
				placeholder='Title'
				name='postTitle'
				required
				value={post.postTitle}
				onChange={handleInputChange}
			/>
			<textarea
				name="postBody"
				cols="40"
				rows="3"
				required
				placeholder='New Blog Post'
				value={post.postBody}
				onChange={handleInputChange}
			></textarea>
			<input
				className='btn'
				type="submit"
				style={{ fontSize: '19px' }}
			/>
		</form>
	)
}

export default CreatePost;
