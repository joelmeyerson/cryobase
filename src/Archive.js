import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Radio,
  Popover,
  Divider } from 'antd';
import {
  InfoCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  FolderAddOutlined,
  CloudDownloadOutlined,
  CheckCircleTwoTone,
  LoadingOutlined } from '@ant-design/icons';
const AWS = require('aws-sdk');

export default function Archive (props) {

  // Set up state
  const [selectedData, setSelectedData] = useState({
    dataid: '',
    storage: '',
    userid: AWS.config.credentials.identityId,
  })
  const [pathName, setPathName] = useState({path: ""});

  const data = props.archivemeta // Store table data
  const columns = [
    {
      title: 'Dataset',
      dataIndex: 'dataset',
      width: 80,
      sorter: {
        compare: (a, b) => a.dataset.localeCompare(b.dataset),
      },
      showSorterTooltip: false,
    },
    {
      title: '',
      dataIndex: 'description',
      width: 40,
      render: function (text, record, index) {
        if (record.description !== '') {
          return (
            <Popover content={record.description} title="Description" >
              <Button disabled='true' size='small'>
                {"D"}
              </Button>
            </Popover>
          )
        }
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: {
        compare: (a, b) => new Date(a.date) - new Date(b.date),
      },
      showSorterTooltip: false,
    },
    {
      title: 'Microscope',
      dataIndex: 'microscope',
      sorter: {
        compare: (a, b) => a.microscope.localeCompare(b.microscope),
      },
      showSorterTooltip: false,
    },
    {
      title: "Camera",
      dataIndex: 'camera',
      sorter: {
        compare: (a, b) => a.camera.localeCompare(b.camera),
      },
      showSorterTooltip: false,
    },
    {
      title: 'File Count',
      dataIndex: 'filecount',
      sorter: {
        compare: (a, b) => a.filecount - b.filecount,
      },
      showSorterTooltip: false,
    },
    {
      title: 'Storage Class',
      dataIndex: 'storage',
      sorter: {
        compare: (a, b) => a.storage.localeCompare(b.storage),
      },
      showSorterTooltip: false,
    },
    {
      title: 'Data Status',
      dataIndex: 'status',
      showSorterTooltip: false,
      render: function (text, record, index) {
        if (record.storage == 'DEEP_ARCHIVE') {
          return (
            <Popover content={"Click to restore archive."} >
              <Button onClick={restoreDataset} size='small'>
                {"Restore"}
              </Button>
            </Popover>

          )
        }
        else {
          return (
            <span><CheckCircleTwoTone twoToneColor="#52c41a" /> Available</span>
          )
        }
      }
    },

  ];

  // Custom table loading indicator
  const customLoading = {
    spinning: props.getarchive,
    indicator: (
      <div style={{ fontSize: "20px"}}>
        <LoadingOutlined />
      </div>
    )
  }

  const rowSelection = { // rowSelection object indicates the need for row selection
    onChange: (selectedRowKeys, selectedRows) => {
      var rowKey = selectedRowKeys[0]
      setSelectedData({
        dataid: data[rowKey-1].dataid,
        storage: data[rowKey-1].storage,
        userid: selectedData.userid
      })
    }
  }

  // Fetch archive list when component loads
  useEffect(() => {
    loadArchive()
  }, []);

  // Load archive from local-store or by fetching from AWS
  async function loadArchive () {
    // If cahced version of archive exists then load it
    if (localStorage.hasOwnProperty('archive') === true) {
      console.log("Cached archive found")
      var cachedarchive = JSON.parse(localStorage.getItem('archive'))
      props.setarchivemeta(cachedarchive)
    }
    else {  // Otherwise download it
      props.setgetarchive(true)
    }
  }

  // Manually re-fetch archive
  async function reloadArchive () {
    props.setgetarchive(true)
  }

  // Start restore or check restore status for Deep Glacier data
  async function restoreDataset () {
    var restorestatus = await window.electron.restoredata(selectedData)
  }

  // Handle data path input, mediated by preload.js
  async function choosePath (props) {
    var dataPath = await window.electron.selectdirectory()
    if (dataPath.length == 0) {
      console.log("Cancelled path selection.")
    }
    else {
      var key = 'path'
      var value = dataPath[0]
      setPathName({
        //...pathName,
        [key]: value})
    }
  }



  // Handle download path selection, mediated by preload.js
  async function choosePath (props) {
    var dataPath = await window.electron.selectdirectory()
    if (dataPath.length === 0) {
      console.log("Cancelled path selection.")
    }
    else {
      var key = 'path'
      var value = dataPath[0]
      setPathName({
        //...pathName,
        [key]: value})
    }
  }

  // Download dataset
  async function downloadData () {
    console.log("test")
    //Pass metadata and download path into a state variable
  }

  return (
    <Card title="Data Archive" bordered={true} >
      <Button onClick={reloadArchive} icon={<ReloadOutlined />}>Reload</Button>
      <Divider />
      <Table
        loading={customLoading} // Table is loading if fetch archive is triggered
        bordered={true}
        rowSelection={{
          type: 'radio',
          ...rowSelection
        }}
        pagination={false}
        columns={columns}
        dataSource={data}
        scroll={{
          y: 500,
          x: 'max-content',
        }}
      />
      <Divider />
      <Input disabled={false} value={pathName.path} onKeyDown={(e) => e.preventDefault()}
        addonAfter={
          <span onClick={choosePath}>
            <FolderAddOutlined />
          </span>
        }
      />
      <Divider />
      <Button disabled={selectedData !== "" || pathName.path === ''} type="primary" onClick={downloadData} icon={<CloudDownloadOutlined />} >Download</Button>
    </Card>
  )
}
