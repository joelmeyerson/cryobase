import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Table, } from 'antd';
import { FolderAddOutlined, ContainerOutlined, LoadingOutlined, } from '@ant-design/icons';

export default function Session (props) {

  // Get time stamp for meta data
  const date = new Date().getDate(); //Current date
  const month = new Date().getMonth() + 1; //Current month
  const year = new Date().getFullYear(); //Current year
  const hours = new Date().getHours(); //Current hours
  const min = new Date().getMinutes(); //Current minutes
  const sec = new Date().getSeconds(); //Current seconds
  const time = year + '' + month + '' + date + '-' + hours + '' + min + '' + sec
  const [form] = Form.useForm()

  // Custom empty table display (locale)
  const localeOn = {
    emptyText: (
      <div style={{ fontSize: "40px" }}>
        <ContainerOutlined />
      </div>
    )
  }
  const localeOff = {
    emptyText: (
      <div>
      </div>
    )
  }

  // State declarations
  const [pathName, setPathName] = useState({path: ""});
  const [fileList, setFileList] = useState([{key: "", name: ""}]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableLocale, setTableLocale] = useState(localeOn);

  // Table set up
  const tableColumns = [
    {
      title: 'Files',
      dataIndex: 'name',
    }
  ];
  const scroll = {};
  scroll.y = 300;

  // Custom table loading indicator
  const customLoading = {
    spinning: tableLoading, // tableLoading is state with boolean
    indicator: (
      <div style={{ fontSize: "20px"}}>
        <LoadingOutlined />
      </div>
    )
  }

  // Update form fields when metaData state updates
  useEffect(() => {
    form.setFieldsValue(pathName)

    // Populate file listing after selecting path
    async function populateTable () {
      if (pathName.path !== "" ) {
        await setTableLocale(localeOff)
        await setTableLoading(true)
        const files = await window.electron.listDirectory(pathName.path)
        const filesObjArray = []
        files.forEach((file, index) => {
          var entry = {}
          entry.key = index
          entry.name = file
          filesObjArray.push(entry)
        })
        setFileList(filesObjArray)
      }
      await setTableLoading(false)
      await setTableLocale(localeOn)
    }

    populateTable()
  }, [pathName])

  // Handle data path input, mediated by preload.js
  async function choosePath (props) {
    var dataPath = await window.electron.sendOpenDialog()
    var key = 'path'
    var value = dataPath[0]
    setPathName({
      ...pathName,
      [key]: value})
  }

  // Display file counts after selecting path
  function countFiles (ext) {
    if (fileList === undefined || fileList.length === 0 || fileList[0].key === "") {
      return ""
    }
    else if (ext === 'total') {
      return fileList.length
    }
    else {
      var files = [];
      for (var i = 0; i < fileList.length; i++) {
        files.push(fileList[i].name);
      }
      const countlower = files.filter(file => file.endsWith(ext.toLowerCase())).length
      const countupper = files.filter(file => file.endsWith(ext.toUpperCase())).length
      return countlower + countupper
    }
  }

  // Handle form completion
  async function onFinish (values) {
    // Create session ID from timestamp and dataset name
    const idname = time.concat("-" + values.dataset)
    const metadata = {
        ...values,
      timestamp: time,
      id: idname,
      date: values.date.format("YYYY-MM-DD")
    }
    localStorage.setItem('sessiondata',JSON.stringify(metadata));
    const sessionStatus = await window.electron.createSession(props.awscred, metadata)
    console.log(sessionStatus)
  };

  return (
      <Card id="session" title="Session Builder" bordered={true} >
        <Form
          id="sessionbuilder"
          form={form}
          name="metadata"
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 20 }}
          layout="horizontal"
          size="small"
          requiredMark={false}
          initialValues={{
            path: pathName.path,
            description: "",
            filter: false
          }}
          onFinish={onFinish}
        >

          <Form.Item label="Local Data Path" name="path" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
            ]}
          >
            <Input value={pathName.path} onKeyDown={(e) => e.preventDefault()}
              addonAfter={
                <span onClick={choosePath}>
                  <FolderAddOutlined />
                </span>
              }
            />
          </Form.Item>

          <Form.Item label="Dataset Name" name='dataset' valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
              {pattern: /^[a-zA-Z0-9-]+$/, message: 'Letters, numbers, and dashes only.'},
              {max: 30, message: 'Maximum 30 characters.'},
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Acquisition Date" name='date' valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
              {type: 'date', message: 'Must be a date.'},
            ]}
          >
            <DatePicker allowClear={false} onKeyDown={(e) => e.preventDefault()} />
          </Form.Item>

          <Form.Item label="Sample Information" name='description' valuePropName="value"
            rules={[
              {pattern: /^[a-zA-Z0-9\s,.]+$/, message: 'Letters, numbers, spaces, commas, and periods only.'},
              {max: 100, message: 'Maximum 100 characters.'},
            ]}>
            <Input.TextArea placeholder="Optional sample details." autoSize={{minRows: 4, maxRows: 4}} allowClear={false} />
          </Form.Item>

          <hr></hr>

          <Form.Item label="Camera" name="camera" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
            ]}
          >
            <Select>
              <Select.Option value="k3">K3</Select.Option>
              <Select.Option value="k2">K2</Select.Option>
              <Select.Option value="falcon4">Falcon IV</Select.Option>
              <Select.Option value="falcon3">Falcon III</Select.Option>
              <Select.Option value="falcon2">Falcon II</Select.Option>
              <Select.Option value="falcon1">Falcon</Select.Option>
              <Select.Option value="rio">Rio</Select.Option>
              <Select.Option value="oneview">OneView</Select.Option>
              <Select.Option value="de20">DE-20</Select.Option>
              <Select.Option value="de16">DE-16</Select.Option>
              <Select.Option value="de12">DE-12</Select.Option>
              <Select.Option value="de10">DE-10</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Microscope" name="microscope" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
            ]}
          >
            <Select>
              <Select.Option value="krios">Krios</Select.Option>
              <Select.Option value="arctica">Arctica</Select.Option>
              <Select.Option value="glacios">Glacios</Select.Option>
              <Select.Option value="f30">F30</Select.Option>
              <Select.Option value="f20">F20</Select.Option>
              <Select.Option value="polara">Polara</Select.Option>
              <Select.Option value="cryoarm">CryoARM</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Voltage (kV)" name="voltage" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
            ]}
          >
            <Select>
              <Select.Option value="300">300</Select.Option>
              <Select.Option value="200">200</Select.Option>
              <Select.Option value="120">120</Select.Option>
              <Select.Option value="80">80</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Magnification (X)" name="mag" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
              {type: 'integer', message: 'Must be an integer number.'},
            ]}
          >
            <InputNumber min={1000} max={1000000} step={1000} />
          </Form.Item>

          <Form.Item label="Pixel Size (Å)" name="apix" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
              {type: 'number', message: 'Must be a number.'},
            ]}
          >
            <InputNumber min={0.1} max={100} step={0.01} />
          </Form.Item>

          <Form.Item label="Cs (mm)" name="cs" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
              {type: 'number', message: 'Must be a number.'},
            ]}
          >
            <InputNumber min={0.1} max={100} step={0.1} />
          </Form.Item>

          <Form.Item label="Energy filter" name="filter" valuePropName="checked" >
            <Switch/>
          </Form.Item>

          <hr></hr>

          <Form.Item label="Frames per Movie" name="frames" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
              {type: 'integer', message: 'Must be an integer number.'},
            ]}
          >
            <InputNumber min={1} max={1000} step={1} />
          </Form.Item>

          <Form.Item label="Exposure Time (sec)" name="exposuretime" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
              {type: 'number', message: 'Must be a number.'},
            ]}
          >
            <InputNumber min={0.1} max={1000} step={0.1} />
          </Form.Item>

          <Form.Item label="Total Dose (e/A^2)" name="dose" valuePropName="value"
            rules={[
              {required: 'true', message: "Required field."},
              {type: 'number', message: 'Must be a number.'},
            ]}
          >
            <InputNumber min={1} max={1000} step={0.01} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" >Build Session</Button>
          </Form.Item>

        </Form>

        <Table
          id="sessioninfo"
          columns={tableColumns}
          dataSource={fileList}
          size="small"
          scroll={scroll}
          locale={tableLocale}
          loading={customLoading}
          pagination={false}
          />
          <div id="sessionfilecount">
            TIF files: {countFiles('tif')} <br></br>
            TIFF files: {countFiles('tiff')} <br></br>
            MRC files: {countFiles('mrc')} <br></br>
            MRCS files: {countFiles('mrcs')} <br></br>
            DM4 files: {countFiles('dm4')} <br></br>
            Total files: {countFiles('total')} <br></br>
          </div>
      </Card>
  );
};
