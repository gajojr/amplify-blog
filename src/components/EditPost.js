import { Auth } from 'aws-amplify';
import React, { useState, useEffect } from 'react';
import { updatePost } from '../graphql/mutations';
import { API, graphqlOperation } from 'aws-amplify';

const EditPost = ({ data }) => {
	const [post, setPost] = useState({
		show: false,
		id: '',
		postOwnerId: '',
		postOwnerUsername: '',
		postTitle: '',
		postBody: '',
		postData: {
			postTitle: data.postTitle,
			postBody: data.postBody
		}
	});

	function handleModal() {
		setPost(prevState => ({
			...prevState,
			show: !post.show
		}));

		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	}

	async function handleUpdatePost(event) {
		event.preventDefault();

		const input = {
			id: data.id,
			postOwnerId: post.postOwnerId,
			postOwnerUsername: post.postOwnerUsername,
			postTitle: post.postData.postTitle,
			postBody: post.postData.postBody,
		}

		await API.graphql(graphqlOperation(updatePost, { input }));

		setPost(prevState => ({
			...prevState,
			show: !post.show
		}));
	}

	function handleTitle(event) {
		console.log(event.target.value)
		setPost(prevState => ({
			...prevState,
			postData: {
				...post.postData,
				postTitle: event.target.value
			}
		}));
	}

	function handleBody(event) {
		setPost(prevState => ({
			...prevState,
			postData: {
				...post.postData,
				postBody: event.target.value
			}
		}));
	}

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

	return (
		<>
			{post.show && (
				<div className='modal'>
					<button className='close' onClick={handleModal}>
						X
					</button>

					<form className='add-post' onSubmit={handleUpdatePost}>
						<input
							type="text"
							style={{ fontSize: '19px' }}
							placeholder='title'
							name='postTitle'
							value={post.postData.postTitle}
							onChange={handleTitle}
						/>
						<input
							style={{ height: '150px', fontSize: '19px' }}
							type="text"
							name="postBody"
							value={post.postData.postBody}
							onChange={handleBody}
						/>
						<button>Update post</button>
					</form>
				</div>
			)}
			<button onClick={handleModal}>
				Edit
			</button>
		</>
	)
}

export default EditPost;
