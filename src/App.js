import React, { useState } from 'react';
import {
  Layout,
  Button, } from 'antd';
import {
  HddOutlined,
  CloudUploadOutlined,
  DashboardOutlined,
  SettingOutlined, } from '@ant-design/icons';
import { BrowserRouter, Route, Switch, Link, Redirect } from "react-router-dom";
import Cookies from 'js-cookie'
import aws from 'aws-sdk/dist/aws-sdk-react-native';
import './App.css';
import Archive from './Archive.js';
import Session from './Session.js';
import Jobs from './Jobs.js';
import Settings from './Settings.js';
import Login from './Login.js';

const fs = require('fs');
const path = require('path');

export const getAccessToken = () => Cookies.get('access_token')
export const getRefreshToken = () => Cookies.get('refresh_token')
export const isAuthenticated = () => !!getAccessToken()

export default function App() {

  return (
    <Switch>
      <Route path='/app' exact component={PublicLayout} />
      <Route path='/' render={(props) => (<ProtectedLayout {...props} isAuthed={true} /> )} />
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
        <Link to="/archive" className="btn-data-archive" >
          <Button icon={<HddOutlined />}>Data Archive</Button>
        </Link>
        <Link to="/session" className="btn-manager" >
          <Button icon={<CloudUploadOutlined />}>Session Manager</Button>
        </Link>
        <Link to="/jobs" className="btn-jobs" >
          <Button icon={<DashboardOutlined />}>Jobs</Button>
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
            <Session />
          </Route>
          <Route path="/jobs">
            <Jobs />
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
