import React from 'react';
import {
  Card,
  Button, } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

class Jobs extends React.Component {
  state = {
    bordered: true,
    loading: false,
    size: 'middle ',
    title: undefined,
    rowSelection: {},
    selectedRowKeys: [],
    scroll: undefined,
    hasData: true,
    tableLayout: undefined,
    top: 'none',
    bottom: 'none',
  };

  onSelectChange = selectedRowKeys => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  render() {
    return (
      <Card>
      <Card title="Upload Job #1" bordered={true} >
        <Button icon={<DashboardOutlined />}>'Terminate'</Button>
      </Card>
      <Card title="Upload Job #2" bordered={true} >
        <Button icon={<DashboardOutlined />}>'Remove from queue'</Button>
      </Card>
      <Card title="Download Job #1" bordered={true} >
        <Button icon={<DashboardOutlined />}>'Remove from queue'</Button>
      </Card>
      <Card title="Upload Job #3" bordered={true} >
        <Button icon={<DashboardOutlined />}>'Remove from queue'</Button>
      </Card>
      </Card>
      );
  }
}

export default Jobs
