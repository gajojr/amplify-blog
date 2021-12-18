import React, { useState, useEffect } from 'react';
import { listPosts } from '../graphql/queries';
import { API, graphqlOperation } from 'aws-amplify';
import { onCreateComment, onCreatePost, onDeletePost, onUpdatePost } from '../graphql/subscriptions';

import DeletePost from './DeletePost';
import EditPost from './EditPost';
import CreateCommentPost from './CreateCommentPost';
import CommentPost from './CommentPost';

const DisplayPosts = () => {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		getPosts();
	}, []);

	useEffect(() => {
		const createPostListener = API.graphql(graphqlOperation(onCreatePost)).subscribe({
			next: postData => {
				const newPost = postData.value.data.onCreatePost;
				const previousPosts = posts.filter(post => post.id !== newPost.id);

				const updatedPosts = [newPost, ...previousPosts];
				setPosts(updatedPosts);
			}
		});

		const deletePostListener = API.graphql(graphqlOperation(onDeletePost)).subscribe({
			next: postData => {
				const deletedPost = postData.value.data.onDeletePost;
				const updatedPosts = posts.filter(post => post.id !== deletedPost.id);
				setPosts(updatedPosts);
			}
		});

		const updatePostListener = API.graphql(graphqlOperation(onUpdatePost)).subscribe({
			next: postData => {
				const updatedPost = postData.value.data.onUpdatePost;
				const indexOfUpdatedPost = posts.findIndex(post => post.id === updatedPost.id);
				const updatedPosts = [
					...posts.slice(0, indexOfUpdatedPost),
					updatedPost,
					...posts.slice(indexOfUpdatedPost + 1)
				];

				setPosts(updatedPosts);
			}
		});

		const createPostCommentListener = API.graphql(graphqlOperation(onCreateComment)).subscribe({
			next: commentData => {
				const createdComment = commentData.value.data.onCreateComment;
				const modifiedPosts = [...posts];

				for (const post of modifiedPosts) {
					if (createdComment.post.id === post.id) {
						post.comments.items.push(createdComment);
					}
				}

				setPosts(modifiedPosts);
			}
		})

		return () => {
			createPostListener.unsubscribe();
			deletePostListener.unsubscribe();
			updatePostListener.unsubscribe();
			createPostCommentListener.unsubscribe();
		}
	}, [posts]);

	async function getPosts() {
		const response = await API.graphql(graphqlOperation(listPosts));
		console.log(response.data.listPosts.items);
		setPosts(response.data.listPosts.items);
	}

	return (
		<div>
			{posts.length > 0 && posts.map(post => {
				return (
					<div key={post.id} className='posts' style={rowStyle}>
						<h1>{post.postTitle}</h1>
						<span style={{ fontStyle: 'italic', color: '#0ca5e297' }}>
							{`Written by: ${post.postOwnerUsername}`}
							<time>{` on ${new Date(post.createdAt).toDateString()}`}</time>
						</span>
						<p>{post.postBody}</p>
						<span>
							<DeletePost post={post} />
							<EditPost data={post} />
						</span>
						<span>
							<CreateCommentPost postId={post.id} />
							{post.comments?.items?.length > 0 &&
								<span style={{ fontSize: '19px', color: 'gray' }}>
									Comments:
									{
										post.comments.items.map((comment, index) => {
											return <CommentPost key={index} commentData={comment} />
										})
									}
								</span>}
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
