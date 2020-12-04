import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Radio,
  Divider } from 'antd';
import { FolderAddOutlined, CloudDownloadOutlined, LoadingOutlined } from '@ant-design/icons';

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
    title: 'Description',
    dataIndex: 'description',
  },
];

export default function Archive (props) {

  const [dataSelect, setDataSelect] = useState(false)
  const [pathName, setPathName] = useState({path: ""});

  const data = props.archivemeta // Store table data

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
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setDataSelect(true)
    },
  };

  // Fetch archive list when component loads
  useEffect(() => {
    loadArchive()
  }, []);

  // Handle download path selection, mediated by preload.js
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

  async function downloadData () {
    console.log("test")
    //Pass metadata and download path into a state variable
  }

  async function loadArchive () {
    // If cahced version of archive exists then load it
    if (localStorage.hasOwnProperty('archive') == true) {
      console.log("Cached archive found")
      var cachedarchive = JSON.parse(localStorage.getItem('archive'))
      props.setarchivemeta(cachedarchive)
    }
    // Otherwise download it
    else {
      props.setgetarchive(true)
    }
  }

  async function reloadArchive () {
    props.setgetarchive(true)
  }

  return (
    <Card title="Data Archive" bordered={true} >
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
      <Button disabled={dataSelect == false || pathName.path == ''} type="primary" onClick={downloadData} icon={<CloudDownloadOutlined />} >Download</Button>
      <Button onClick={reloadArchive}>Reload</Button>
    </Card>
  )
}
