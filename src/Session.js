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
import { fs } from 'fs';

export default function Session () {

  // Get time stamp for meta data
  const date = new Date().getDate(); //Current date
  const month = new Date().getMonth() + 1; //Current month
  const year = new Date().getFullYear(); //Current year
  const hours = new Date().getHours(); //Current hours
  const min = new Date().getMinutes(); //Current minutes
  const sec = new Date().getSeconds(); //Current seconds
  const time = year + '-' + month + '-' + date + ' ' + hours + ':' + min + ':' + sec

  const [metaData, setMetaData] = useState({
    timestamp: time,
    path: "",
    dataset: "",
    date: "",
    description: "",
    microscope: "",
    camera: "",
    filter: "false",
    voltage: "",
    cs: "",
    mag: "",
    apix: "",
    frames: "",
    exposuretime: "",
    dose: "",
  });

  // Handle data path input, mediated by preload.js
  async function choosePath (){
    var dataPath = await window.electron.sendOpenDialog()
    var key = 'path'
    var value = dataPath
    setMetaData({
      ...metaData,
      [key]: value})
  }

  // Handle input changes
  async function handleInput (e) {
    var key = e.target.name
    var value = e.target.value
    setMetaData({
      ...metaData,
      [key]: value})
      console.log(metaData)
  }

  // Handle date changes
  async function handleDate(date, dateString) {
    var key = 'date'
    var value = dateString
    setMetaData({
      ...metaData,
      [key]: value})
  }

  // Handle start transfer session
  async function startSession() {
    // Check metaData for completeness
    // Create S3 bucket or S3 deep glacier vault
    // Start transfer from local directory to S3 using fs, chokidar, AWS SDK, Node.js stream object
    const localPath = metaData.path[0]
    const files = await window.electron.listDirectory(localPath)
    console.log(files)
  }

  return (
    <Card title="Session Builder" bordered={true} >
      <Form labelCol={{ span: 10 }} wrapperCol={{ span: 20 }} layout="horizontal" size={"small"} >
        <Form.Item label="Local Data Path" >
          <Input value={metaData.path} addonAfter={
              <span onClick={choosePath}>
              <FolderAddOutlined />
              </span>
          } />
        </Form.Item>

        <Form.Item label="Dataset Name" validateStatus="warning" >
          <Input name='dataset' onChange={handleInput}/>
        </Form.Item>

        <Form.Item label="Date" >
          <DatePicker name='date' onChange={handleDate} />
        </Form.Item>

        <Form.Item label="Sample Information">
          <Input.TextArea name='description' onChange={handleInput} autoSize={{minRows: 4, maxRows: 4}} allowClear={true} />
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
          <InputNumber  min={0} max={1000} step={1} />
        </Form.Item>

        <Form.Item label="Exposure Time (sec)">
          <InputNumber min={0} max={1000} step={1} />
        </Form.Item>

        <Form.Item label="Total Dose (e/A^2)">
          <InputNumber min={0} max={100} step={0.01} />
        </Form.Item>

        <Form.Item label="Start">
          <Button onClick={startSession}>Start Transfer</Button>
        </Form.Item>

      </Form>
    </Card>
  );
};
