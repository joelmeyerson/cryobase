import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Switch, } from 'antd';
import { FolderAddOutlined, } from '@ant-design/icons';

export default function Session () {

  return (
    <Card title="Session Builder" bordered={true} >
      <Form labelCol={{ span: 10 }} wrapperCol={{ span: 20 }} layout="horizontal" size={"small"} >
        <Form.Item label="Local Data Path" >
          <Input addonAfter={
              <FolderAddOutlined />
          } />
        </Form.Item>

        <Form.Item label="Dataset Name" validateStatus="warning" >
          <Input />
        </Form.Item>

        <Form.Item label="Date" >
          <DatePicker />
        </Form.Item>

        <Form.Item label="Sample Information">
          <Input.TextArea autoSize={{minRows: 4, maxRows: 4}} allowClear={true} />
        </Form.Item>

        <Form.Item label="Microscope">
          <Select>
            <Select.Option value="glacios">Glacios</Select.Option>
            <Select.Option value="arctica">Arctica</Select.Option>
            <Select.Option value="krios">Krios</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Camera">
          <Select>
            <Select.Option value="k2">K2</Select.Option>
            <Select.Option value="k3">K3</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Energy filter">
          <Switch />
        </Form.Item>

        <Form.Item label="Voltage (kV)">
          <InputNumber min={10} max={300} step={10} />
        </Form.Item>

        <Form.Item label="Cs (mm)">
          <InputNumber min={0} max={100} step={0.1} />
        </Form.Item>

        <Form.Item label="Magnification (X)">
          <InputNumber min={0} max={1000000} step={1000} />
        </Form.Item>

        <Form.Item label="Pixel Size (Å)">
          <InputNumber min={0} max={100} step={0.01} />
        </Form.Item>

        <Form.Item label="Frames per Movie">
          <InputNumber min={0} max={1000} step={1} />
        </Form.Item>

        <Form.Item label="Exposure Time (sec)">
          <InputNumber min={0} max={1000} step={1} />
        </Form.Item>

        <Form.Item label="Total Dose (e/A^2)">
          <InputNumber min={0} max={100} step={0.01} />
        </Form.Item>

        <Form.Item label="Start">
          <Button>Start Transfer</Button>
        </Form.Item>

      </Form>
    </Card>
  );
};
