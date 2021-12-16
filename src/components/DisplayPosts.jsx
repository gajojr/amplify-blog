import React, { useState, useEffect } from 'react';
import { listPosts } from '../graphql/queries';
import { API, graphqlOperation } from 'aws-amplify';
import { onCreatePost } from '../graphql/subscriptions';

import DeletePost from './DeletePost';
import EditPost from './EditPost';

const DisplayPosts = () => {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		getPosts();
	}, []);

	useEffect(() => {
		let createPostListener = () => {
			API.graphql(graphqlOperation(onCreatePost)).subscribe({
				next: postData => {
					const newPost = postData.value.data.onCreatePost;
					const previousPosts = posts.filter(post => post.id !== newPost.id);

					const updatedPosts = [newPost, ...previousPosts];
					setPosts(updatedPosts);
				}
			});
		}
		createPostListener();

		return () => {
			createPostListener = null;
		}
	}, [posts]);

	async function getPosts() {
		const response = await API.graphql(graphqlOperation(listPosts));
		console.log(response.data.listPosts.items);
		setPosts(response.data.listPosts.items);
	}

	return (
		<div>
			{posts.length && posts.map(post => {
				return (
					<div key={post.id} className='posts' style={rowStyle}>
						<h1>{post.postTitle}</h1>
						<span style={{ fontStyle: 'italic', color: '#0ca5e297' }}>
							{`Written by: ${post.postOwnerUsername}`}
							<time>{` on ${new Date(post.createdAt).toDateString()}`}</time>
						</span>
						<p>{post.postBody}</p>
						<span>
							<DeletePost />
							<EditPost />
						</span>
					</div>
				)
			})}
		</div>
	)
}

const rowStyle = {
	background: '#f4f4f4',
	padding: '10px',
	border: '1px #ccc dotted',
	margin: '14px'
}

export default DisplayPosts;
