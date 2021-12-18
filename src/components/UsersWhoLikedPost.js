import React from 'react';

const UsersWhoLikedPost = ({ users }) => {
	return (
		<div>
			{users.map(user => {
				return (
					<>
						<div key={user}>
							<span style={{ fontStyle: 'bold', color: '#ged' }}>
								{user}
							</span>
						</div>
					</>
				)
			})}
		</div>
	)
}

export default UsersWhoLikedPost;
