import React from 'react';
import {
  Card,
  Button,
  Table, } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import jsondata from './data-archive.json';

console.log(jsondata)

const columns = [
  {
    title: 'Dataset',
    dataIndex: 'dataset',
    width: 120,

    sorter: (a, b) => a.dataset.localeCompare(b.dataset),
  },
  {
    title: 'Date',
    dataIndex: 'date',
    width: 150,
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
  },
  {
    title: 'Microscope',
    dataIndex: 'microscope',
    width: 150,
    sorter: (a, b) => a.microscope.localeCompare(b.microscope),
  },
  {
    title: 'Camera',
    dataIndex: 'camera',
    width: 120,
    sorter: (a, b) => a.camera.localeCompare(b.camera),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    width: 400,
  },
];

const data = [];
for (let i = 0; i <= jsondata.length-1; i++) {
  data.push({
    key: i,
    dataset: jsondata[i].dataset,
    date: jsondata[i].date,
    microscope: jsondata[i].microscope,
    camera: jsondata[i].camera,
    description: jsondata[i].description,
  });
}

const showHeader = true;
const footer = () => '';
const pagination = { position: 'bottom' };

class Archive extends React.Component {
  state = {
    bordered: true,
    loading: false,
    pagination,
    size: 'middle ',
    title: undefined,
    showHeader,
    footer,
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
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const { xScroll, yScroll, ...state } = this.state;
    const scroll = {};
    scroll.y = 500;
    const tableColumns = columns.map(item => ({ ...item, ellipsis: state.ellipsis }));

    return (
      <Card title="Data Archive" bordered={true} >
        <Table
          {...this.state}
          rowSelection={rowSelection}
          pagination={false}
          columns={tableColumns}
          dataSource={state.hasData ? data : null}
          scroll={scroll}
        />
        <Button block icon={<CloudDownloadOutlined />}>Download</Button>
      </Card>
      );
  }
}

export default Archive
