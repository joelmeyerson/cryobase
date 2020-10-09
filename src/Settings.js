import React from 'react';
import {
  Form,
  Card,
  Input, } from 'antd';

class Settings extends React.Component {
  render() {
    return (
        <Card title="Settings" bordered={true} >
          <Form labelCol={{ span: 10 }} wrapperCol={{ span: 20 }} layout="horizontal" size={"small"} >

            <Form.Item label="Account Name">
              <Input />
            </Form.Item>

            <Form.Item label="User Name">
              <Input />
            </Form.Item>

          </Form>
        </Card>
    );
  };
};

export default Settings;
