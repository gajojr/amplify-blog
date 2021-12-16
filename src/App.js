import React from 'react';
import './App.css';

import DisplayPosts from './components/DisplayPosts';
import CreatePost from './components/CreatePost';

import { withAuthenticator } from '@aws-amplify/ui-react'

function App() {
	return (
		<div className="App">
			<CreatePost />
			<DisplayPosts />
		</div>
	);
}

export default withAuthenticator(App);
