import React from 'react';

const CommentPost = ({ commentData }) => {
	const { commentOwnerUsername, createdAt, content } = commentData;

	return (
		<div className='comment'>
			<span style={{ fontStyle: 'italic', color: '#0ca5e297' }}>
				{`Comment by: ${commentOwnerUsername} on `}
				<time style={{ fontStyle: 'italic' }}>
					{new Date(createdAt).toString()}
				</time>
			</span>
			<p>
				{content}
			</p>
		</div>
	)
}

export default CommentPost;