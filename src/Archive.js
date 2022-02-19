import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Popover, Tag, Row, Col } from "antd";
import {
  SwitcherOutlined,
  WalletOutlined,
  ReloadOutlined,
  FolderOutlined,
  CloudDownloadOutlined,
  CheckCircleTwoTone,
  LoadingOutlined,
  FieldTimeOutlined,
  HistoryOutlined,
  CloseCircleOutlined,
  WarningTwoTone,
  StopOutlined,
} from "@ant-design/icons";

export default function Archive(props) {
  const [pathName, setPathName] = useState({ path: "" });

  const columns = [
    {
      title: "Dataset",
      dataIndex: "dataset",
      width: 140,
      sorter: {
        compare: (a, b) => a.dataset.localeCompare(b.dataset),
      },
      showSorterTooltip: false,
    },
    {
      title: "",
      dataIndex: "description",
      width: 30,
      align: "center",
      render: function (text, record, index) {
        if (record.description !== "") {
          return (
            <Popover
              content={record.description}
              title="Description"
              placement="right"
            >
              <Tag color="blue">D</Tag>
            </Popover>
          );
        }
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      width: 80,
      sorter: {
        compare: (a, b) => new Date(a.date) - new Date(b.date),
      },
      showSorterTooltip: false,
    },
    {
      dataIndex: "timestamp",
      width: 30,
      align: "center",
      render: function (text, record, index) {
        return (
          <Popover
            content={record.timestamp}
            title="Upload Timestamp"
            placement="right"
          >
            <Tag color="blue">TS</Tag>
          </Popover>
        );
      },
    },
    {
      title: "Microscope",
      dataIndex: "microscope",
      width: 90,
      sorter: {
        compare: (a, b) => a.microscope.localeCompare(b.microscope),
      },
      showSorterTooltip: false,
    },
    {
      title: "Camera",
      dataIndex: "camera",
      width: 80,
      sorter: {
        compare: (a, b) => a.camera.localeCompare(b.camera),
      },
      showSorterTooltip: false,
    },
    {
      dataIndex: "uploadcompleted",
      width: 20,
      showSorterTooltip: false,
      align: "center",
      render: function (text, record, index) {
        if (record.dataid === props.metadata.dataid) {
          return <span> </span>;
        } else if (record.uploadcompleted === false) {
          return (
            <Popover
              content={"Warning: dataset upload was not completed."}
              placement="left"
            >
              <span>
                <WarningTwoTone twoToneColor="#f5222d" />
              </span>
            </Popover>
          );
        } else if (record.uploadcompleted === true) {
          return (
            <Popover
              content={"Dataset upload was completed successfully."}
              placement="left"
            >
              <span>
                <CheckCircleTwoTone />
              </span>
            </Popover>
          );
        }
      },
    },
    {
      title: "Dataset Size",
      dataIndex: "filecount",
      width: 110,
      sorter: {
        compare: (a, b) => a.filecount - b.filecount,
      },
      showSorterTooltip: false,
    },
    {
      title: "Storage Class",
      dataIndex: "storage",
      width: 110,
      sorter: {
        compare: (a, b) => a.storage.localeCompare(b.storage),
      },
      showSorterTooltip: false,
    },
    {
      title: "Data Status",
      dataIndex: "status",
      width: 90,
      align: "center",
      showSorterTooltip: false,
      render: function (text, record, index) {
        if (
          //record.status == "archived" &&
          record.dataid === props.metadata.dataid
        ) {
          return (
            <Popover content={"Data is uploading."} placement="left">
              <span>
                <LoadingOutlined /> Uploading
              </span>
            </Popover>
          );
        } else if (record.status === "archived") {
          return (
            <Popover
              content={"Select row and click button to restore data."}
              placement="left"
            >
              <Button
                disabled={props.selecteddata.dataid !== record.dataid}
                onClick={restoreDataset}
                type="primary"
                block
                loading={
                  props.buttonloading &&
                  props.selecteddata.dataid === record.dataid
                }
                size="small"
                icon={<WalletOutlined />}
              >
                {"Archived"}
              </Button>
            </Popover>
          );
        } else if (record.status === "restoring") {
          return (
            <Popover
              content={
                "Select row and click button to check status of data restoration."
              }
              placement="left"
            >
              <Button
                className={"status-btn"}
                disabled={props.selecteddata.dataid !== record.dataid}
                onClick={restoreDataset}
                type="primary"
                block
                loading={
                  props.buttonloading &&
                  props.selecteddata.dataid === record.dataid
                }
                size="small"
                icon={<FieldTimeOutlined />}
              >
                {"Restoring"}
              </Button>
            </Popover>
          );
        } else if (record.status === "restored") {
          return (
            <Popover
              content={
                "Restored data will expire 3 days after restoration. Select row and click to see if data is still available for download."
              }
              placement="left"
            >
              <Button
                className={"status-btn"}
                disabled={props.selecteddata.dataid !== record.dataid}
                onClick={restoreDataset}
                type="primary"
                block
                loading={
                  props.buttonloading &&
                  props.selecteddata.dataid === record.dataid
                }
                size="small"
                icon={<SwitcherOutlined />}
              >
                {"Restored"}
              </Button>
            </Popover>
          );
        } else if (record.status === "archiving") {
          return (
            <Popover
              content={
                "Data is in the process of returning to Archived status and is not available."
              }
              placement="left"
            >
              <Button
                className={"status-btn"}
                disabled={props.selecteddata.dataid !== record.dataid}
                onClick={restoreDataset}
                type="primary"
                block
                loading={
                  props.buttonloading &&
                  props.selecteddata.dataid === record.dataid
                }
                size="small"
                icon={<HistoryOutlined />}
              >
                {"Archiving"}
              </Button>
            </Popover>
          );
        } else if (record.status === "standard") {
          return (
            <Popover
              content={"Data is available for download."}
              placement="left"
            >
              <Button
                className={"status-btn"}
                type="text"
                block
                size="small"
                icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
              >
                {"Available"}
              </Button>
            </Popover>
          );
        } else {
          return (
            <Popover
              content={"Error: Data status is undefined."}
              placement="left"
            >
              <Button
                className={"status-btn"}
                type="text"
                block
                size="small"
                icon={<CloseCircleOutlined />}
              >
                {"Undefined"}
              </Button>
            </Popover>
          );
        }
      },
    },
  ];

  // Custom table loading indicator
  const customLoading = {
    //spinning: props.getarchive || props.buttonloading,
    spinning: props.getarchive,
    indicator: (
      <div style={{ fontSize: "20px" }}>
        <LoadingOutlined />
      </div>
    ),
  };

  const rowSelection = {
    // rowSelection object indicates the need for row selection
    onChange: (selectedRowKeys, selectedRows) => {
      // If currently checking status of a dataset then prevent user from changing rows.
      // This is implemented by just using the active row to override the attempt to change a row number.
      if (props.buttonloading === true) {
        selectedRowKeys[0] = props.currentrowkey;
      // Otherwise just change the row.
      } else {
        var rowKey = selectedRowKeys[0]; // Store row key locally
        props.setcurrentrowkey(rowKey); // Store row key in state
        var data = props.archivemeta;
        props.setselecteddata({
          dataid: data[rowKey - 1].dataid,
          status: data[rowKey - 1].status,
          storage: data[rowKey - 1].storage,
          userid: props.selecteddata.userid,
        });
      }
    },
  };

  // Fetch archive list when component loads
  useEffect(() => {
    if (props.lockui === false) {
      loadArchive();
    }
  }, []);

  // Load archive from local-store or by fetching from AWS
  async function loadArchive() {
    props.setgetarchive(true);
  }

  // Manually re-fetch archive
  async function reloadArchive() {
    await props.setgetarchive(true);
  }

  // Start restore or check restore status for Deep Glacier data
  async function restoreDataset() {
    await props.setbuttonloading(true);
    var restorestatus = await window.electron.restoredata(props.selecteddata);
    restorestatus.statusnotification !== ""
      ? props.opennotification(restorestatus.statusnotification)
      : console.log("no notification");
    await props.setbuttonloading(false);
    await reloadArchive(); // Download updated versions of metadata in archivemeta
    props.setselecteddata({
      dataid: props.selecteddata.dataid,
      status: restorestatus.status, // Refresh row selection to get fresh "status" value
      storage: props.selecteddata.storage,
    });
  }

  // Handle download path selection, mediated by preload.js
  async function choosePath() {
    var dataPath = await window.electron.selectdirectory();
    if (dataPath.length === 0) {
      console.log("Cancelled path selection.");
    } else {
      var key = "path";
      var value = dataPath[0];
      setPathName({
        [key]: value,
      });
    }
  }

  // Download dataset
  async function downloadData(params) {
    var license = await props.checklicense();
    if (license === true) {
      var keylist = await window.electron.listkeys(params); // Get list of files to be downloaded
      props.setdownloadlist(keylist);
      props.setdownloadparams(params);
      props.setdownloadstate(true);
    }
  }

  async function stopDownload() {
    await props.setdownloadstate(false);
  }

  return (
    <Card
      className="upload-card"
      size="small"
      title="Data Archive"
      bordered={true}
    >
      <Row gutter={[16, 16]}>
        <Col>
          <Button
            onClick={reloadArchive}
            disabled={props.lockui}
            block
            icon={<ReloadOutlined />}
            shape="round"
          >
            Refresh
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col>
          <Table
            loading={customLoading} // Table is loading if fetch archive is triggered
            bordered={true}
            footer={() => ""}
            rowSelection={{
              type: "radio",
              ...rowSelection,
            }}
            pagination={false}
            columns={columns}
            dataSource={props.archivemeta}
            rowClassName={(record) => !record.enabled}
            scroll={{
              y: 100,
              x: "max-content",
            }}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Input
            disabled={false}
            value={pathName.path}
            addonBefore={"Local Download Path"}
            onKeyDown={(e) => e.preventDefault()}
            addonAfter={
              <span
                onClick={
                  props.lockui === true ||
                  props.uitoggle === true ||
                  props.downloadstate === true ||
                  props.buttonloading === true
                    ? null
                    : choosePath
                }
              >
                <FolderOutlined />
              </span>
            }
          />
        </Col>
        <Col span={2}></Col>
        <Col span={6}>
          <Popover
            placement="bottomLeft"
            content={
              "Select a row and a local download path in order to start download."
            }
          >
            {props.downloadstate === false ? (
              <Button
                disabled={
                  props.lockui === true ||
                  props.selecteddata.dataid === "" ||
                  pathName.path === "" ||
                  props.downloadstate === true ||
                  props.buttonloading === true ||
                  props.selecteddata.status === "archived" ||
                  props.selecteddata.status === "restoring" ||
                  props.selecteddata.status === "archiving"
                }
                type="primary"
                size="middle"
                block
                onClick={() => {
                  downloadData({
                    dataid: props.selecteddata.dataid,
                    localpath: pathName.path,
                  });
                }}
                icon={<CloudDownloadOutlined />}
              >
                Start Download
              </Button>
            ) : (
              <Button
                disabled={true}
                type="primary"
                size="middle"
                block
                icon={<LoadingOutlined />}
              >
                Download Active
              </Button>
            )}
          </Popover>
        </Col>
        <Col span={4}>
          <Button
            disabled={
              props.lockui === true ||
              props.selecteddata.dataid === "" ||
              pathName.path === "" ||
              props.downloadstate === false
            }
            type="danger"
            size="middle"
            block
            icon={<StopOutlined />}
            onClick={() => stopDownload()}
          >
            Stop Download
          </Button>
        </Col>
      </Row>
    </Card>
  );
}
