import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button, } from 'antd';
import {
  HddOutlined,
  CloudUploadOutlined,
  SettingOutlined, } from '@ant-design/icons';
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import Cookies from 'js-cookie'
import './App.css';
import Archive from './Archive.js';
import Session from './Session.js';
import Settings from './Settings.js';
import Login from './Login.js';

// Import AWS
import AWS from 'aws-sdk';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';
import { Amplify } from 'aws-amplify';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, CognitoIdentityCredentials, CognitoCachingCredentialsProvider } from 'amazon-cognito-identity-js';

// AWS authentication
var data = {
    UserPoolId: 'us-east-1_jfISkLHGg',
    ClientId: '59l85geov36gnrk0pj9rfg45dv',
  };

var userPool = new CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();
if (cognitoUser != null) {
	cognitoUser.getSession(function(err, result) {
		if (result) {
			console.log('You are now logged in.');

      // Initialize the Amazon Cognito credentials provider
      AWS.config.region = 'us-east-1'; // Region
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:c6729a0c-1214-4b75-8059-2b62345c0427',
        Logins: {
					'cognito-idp.us-east-1.amazonaws.com/us-east-1_jfISkLHGg': result.getIdToken().getJwtToken()
				}
      });
		}
	});
}

function App() {

  const [uiToggle, setUiToggle] = useState(false)
  const [metaData, setMetaData] = useState({})
  const [transferState, setTransferState] = useState(false);
  const [uploadState, setUploadState] = useState(false);
  const [transferCount, setTransferCount] = useState(0);

  return (
    <Switch>
      <Route path='/app' exact component={PublicLayout} />
      <Route path='/' render={(props) => (<ProtectedLayout
        uitoggle={uiToggle}
        setuitoggle={setUiToggle}
        metadata={metaData}
        setmetadata={setMetaData}
        transferstate={transferState}
        settransferstate={setTransferState}
        uploadstate={uploadState}
        setuploadstate={setUploadState}
        transfercount={transferCount}
        settransfercount={setTransferCount}
      /> )} />
    </Switch>
  );
}

// Public layout
export const PublicLayout = (props) =>
  <BrowserRouter>
    <Layout>
      <Switch>
        <Route path="/" component={Login} />
      </Switch>
    </Layout>
  </BrowserRouter>

// Private layout
export const ProtectedLayout = (props) =>
  <BrowserRouter>
    <Layout>
      <Layout.Header>
        <AmplifySignOut />
        <Link to="/archive" className="btn-data-archive" >
          <Button icon={<HddOutlined />}>Data Archive</Button>
        </Link>
        <Link to="/session" className="btn-manager" >
          <Button icon={<CloudUploadOutlined />}>Session Manager</Button>
        </Link>
        <Link to="/settings" className="btn-settings" >
          <Button icon={<SettingOutlined />}>Settings</Button>
        </Link>
      </Layout.Header>
      <Layout.Content>
        <Switch>
          <Route path="/archive">
            <Archive />
          </Route>
          <Route path={["/app", "/session"]}>
            <Session
              user={cognitoUser}
              uitoggle={props.uitoggle}
              setuitoggle={props.setuitoggle}
              metadata={props.metadata}
              setmetadata={props.setmetadata}
              transferstate={props.transferstate}
              settransferstate={props.settransferstate}
              uploadstate={props.uploadstate}
              setuploadstate={props.setuploadstate}
              transfercount={props.transfercount}
              settransfercount={props.settransfercount}
            />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
        </Switch>
      </Layout.Content>
      <Layout.Footer>
      </Layout.Footer>
    </Layout>
  </BrowserRouter>

export default withAuthenticator(App)
//export default App
