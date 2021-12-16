import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
Auth.configure(aws_exports);

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);