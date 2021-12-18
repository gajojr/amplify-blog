import React, { useState, useEffect } from 'react';
import { listPosts } from '../graphql/queries';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import { onCreateComment, onCreatePost, onDeletePost, onUpdatePost, onCreateLike } from '../graphql/subscriptions';

import DeletePost from './DeletePost';
import EditPost from './EditPost';
import CreateCommentPost from './CreateCommentPost';
import CommentPost from './CommentPost';
import UsersWhoLikedPost from './UsersWhoLikedPost';

import { FaSadTear, FaThumbsUp } from 'react-icons/fa';
import { createLike } from '../graphql/mutations';

const DisplayPosts = () => {
	const [posts, setPosts] = useState([]);
	const [owner, setOwner] = useState({
		ownerId: '',
		ownerUsername: ''
	});
	const [errorMessage, setErrorMessage] = useState('');
	const [postLikedBy, setPostLikedBy] = useState('');
	const [hovering, setHovering] = useState({
		state: false,
		postId: ''
	});

	useEffect(() => {
		getPosts();
		getOwner();
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
		});

		const createPostLikeListener = API.graphql(graphqlOperation(onCreateLike)).subscribe({
			next: postData => {
				const createdLike = postData.value.data.onCreateLike;

				let modifiedPosts = [...posts];
				for (const post of modifiedPosts) {
					if (createdLike.post.id === post.id) {
						post.likes.items.push(createdLike);
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
			createPostLikeListener.unsubscribe();
		}
	}, [posts]);

	async function getPosts() {
		const response = await API.graphql(graphqlOperation(listPosts));
		setPosts(response.data.listPosts.items);
	}

	async function getOwner() {
		const user = await Auth.currentUserInfo();
		setOwner({
			ownerId: user.attributes.sub,
			ownerUsername: user.username
		});
	}

	function likedPost(postId) {
		for (const post of posts) {
			if (post.id === postId) {
				if (post.postOwnerId === owner.ownerId) {
					return true;
				}

				for (const like of post.likes.items) {
					if (like.likeOwnerId === owner.ownerId) {
						return true;
					}
				}
			}
		}

		return false;
	}

	async function handleLike(postId) {
		if (likedPost(postId)) {
			return setErrorMessage(`Can't like your own post`);
		}

		const input = {
			numberLikes: 1,
			likeOwnerId: owner.ownerId,
			likeOwnerUsername: owner.ownerUsername,
			postLikesId: postId
		}

		try {
			const result = await API.graphql(graphqlOperation(createLike, { input }));

			console.log(result.data);
		} catch (err) {
			console.error(err);
		}
	}

	async function handleMouseHover(postId) {
		setHovering({
			state: !hovering.state,
			postId
		});

		let innerLikes = [...postLikedBy];

		for (const post of posts) {
			if (post.id === postId) {
				for (const like of post.likes.items) {
					innerLikes.push(like.likeOwnerUsername);
				}

				setPostLikedBy(innerLikes);
			}
		}
	}

	async function handleMouseHoverLeave() {
		setHovering({
			state: !hovering.state,
			postId: ''
		});
		setPostLikedBy([]);
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
							{post.postOwnerId === owner.ownerId && <DeletePost post={post} />}
							{post.postOwnerId === owner.ownerId && <EditPost data={post} />}
							<span>
								<p className='alert'>{post.postOwnerId === owner.ownerId && errorMessage}</p>
								<p
									style={{
										color: `${post.likes.items.find(like => like.likeOwnerId === owner.ownerId) !== undefined ? 'blue' : 'gray'}`
									}}
									className='like-button'
									onMouseEnter={() => handleMouseHover(post.id)}
									onMouseLeave={handleMouseHoverLeave}
									onClick={() => handleLike(post.id)}
								>
									<FaThumbsUp />
									{post.likes.items.length}
								</p>
								{
									hovering && post.id === hovering.postId &&
									<div className='users-liked'>
										{
											postLikedBy.length === 0 ?
												'Liked by no one' :
												'Liked by: '
										}
										{
											postLikedBy.length === 0 ?
												<FaSadTear /> :
												<UsersWhoLikedPost users={postLikedBy} />
										}
									</div>
								}
							</span>
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
