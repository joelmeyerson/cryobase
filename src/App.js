import React from 'react';
import {
  Layout,
  Button, } from 'antd';
import {
  HddOutlined,
  CloudUploadOutlined,
  DashboardOutlined,
  SettingOutlined, } from '@ant-design/icons';
import './App.css';
import Archive from './Archive.js';
import Session from './Session.js';
import Jobs from './Jobs.js';
import Settings from './Settings.js';
import Login from './Login.js';

var AWS = require('aws-sdk/dist/aws-sdk-react-native');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleArchiveClick = this.handleArchiveClick.bind(this);
    this.handleSessionClick = this.handleSessionClick.bind(this);
    this.handleJobsClick = this.handleJobsClick.bind(this);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
    this.state = {contentState: 'login'};
  }

  handleArchiveClick() {
    this.setState({contentState: 'archive'});
  }

  handleSessionClick() {
    this.setState({contentState: 'session'});
  }

  handleJobsClick() {
    this.setState({contentState: 'jobs'});
  }

  handleSettingsClick() {
    this.setState({contentState: 'settings'});
  }

  handleLoginClick() {
    this.setState({contentState: 'login'});
  }

  render() {
    const contentState = this.state.contentState;
    var content;
    if (contentState === 'archive') {
      content = <Archive />;
    } else if (contentState === 'session') {
      content = <Session />;
    } else if (contentState === 'jobs') {
      content = <Jobs />;
    } else if (contentState === 'settings') {
      content = <Settings />;
    } else if (contentState === 'login') {
      content = <Login />;
    }

    return (
        <Layout>
          <Layout.Header>
            <Button onClick={this.handleArchiveClick} className="btn-data-archive" icon={<HddOutlined />}>Data Archive</Button>
            <Button onClick={this.handleSessionClick} className="btn-manager" icon={<CloudUploadOutlined />}>Session Manager</Button>
            <Button onClick={this.handleJobsClick} className="btn-jobs" icon={<DashboardOutlined />}>Jobs</Button>
            <Button onClick={this.handleSettingsClick} className="btn-settings" icon={<SettingOutlined />}>Settings</Button>
            <Button onClick={this.handleLoginClick} className="btn-login" >Login</Button>
          </Layout.Header>
          <Layout.Content>
            {content}
          </Layout.Content>
          <Layout.Footer>
          </Layout.Footer>
        </Layout>
    );
  }
}

export default App;
