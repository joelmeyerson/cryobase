import React, { useState, useEffect } from "react";
import { Layout, Button, Row, Col, notification } from "antd";
import {
  HddOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import Cookies from "js-cookie";
import "./App.css";
import Archive from "./Archive.js";
import Upload from "./Upload.js";
import Configuration from "./Configuration.js";

import AWS from "aws-sdk";

// Antd notification system
async function openNotification(notificationText) {
  notification.open({
    message: notificationText,
    description: "",
    placement: "topRight",
    className: "custom-class",
    icon: <FlagOutlined />,
    duration: 8,
    style: {
      width: 800,
    },
  });
}

function App() {
  const [getArchive, setGetArchive] = useState(false); // Trigger when to fetch metadata for Archive componenet
  const [archiveMeta, setArchiveMeta] = useState([]); // Store metadata to display in Archive table
  const [buttonLoading, setButtonLoading] = useState(false); // Toggle button loading

  const [downloadState, setDownloadState] = useState(false); // Set whether AWS file upload active
  const [downloadConnect, setDownloadConnect] = useState(false); // Set whether AWS file download active
  const [downloadParams, setDownloadParams] = useState({}); // Store metadata to display in Archive table
  const [downloadCount, setDownloadCount] = useState(0); // Counter for file upload
  const [downloadList, setDownloadList] = useState([]); // Hold list of files for upload job

  const [uploadPathName, setUploadPathName] = useState({ path: "" });
  const [uploadTableLoading, setUploadTableLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // Hold list of files for upload job
  const [metaData, setMetaData] = useState({}); // Store metadata for upload job
  const [currentDataID, setCurrentDataID] = useState({ dataid: "" }); // Currently selected data ID
  const [uploadState, setUploadState] = useState(false); // Set whether user has started upload job
  const [uploadAWS, setUploadAWS] = useState(false); // Set whether AWS file upload active
  const [uploadCount, setUploadCount] = useState(0); // Counter for file upload
  const [uiToggle, setUiToggle] = useState(false); // Used to toggle UI after start and stop of upload

  const [pageState, setPageState] = useState(0); // Track which page is loaded

  // Trigger fetch of archive metadata
  // useEffect(() => {
  //   if (getArchive == true) {
  //     fetchArchive(); // Start transfer for the file
  //   }
  // }, [getArchive]);

  // Handle meta data download to populate Archive table
  // async function fetchArchive() {
  //   var archive = await window.electron.getmetadata();
  //   var archiveObjArray = [];
  //   if (archive.length > 0) {
  //     for (var i = 0; i <= archive.length - 1; i++) {
  //       archiveObjArray.push({
  //         key: i + 1,
  //         ...archive[i],
  //       });
  //     }
  //     localStorage.setItem("archive", JSON.stringify(archiveObjArray)); // Store a copy in local storage for caching
  //     setArchiveMeta(archiveObjArray);
  //   }
  //   setGetArchive(false);
  // }

  // Trigger metadata upload
  // useEffect(() => {
  //   if (typeof metaData.dataid !== "undefined") {
  //     sendMetaData(metaData); // Start transfer for the file
  //   }
  // }, [metaData]);

  // Handle data upload
  useEffect(() => {
    if (
      uploadState == true &&
      uploadAWS == false &&
      uploadCount < fileList.length
    ) {
      var transferparams = {
        file: fileList[uploadCount].name,
        dataid: metaData.dataid,
        path: metaData.path,
        storage: metaData.storage,
      };
      dataUpload(transferparams); // Start transfer for the file
    } else if (uploadState == true && uploadCount == fileList.length) {
      endUpload()
    }
  }, [uploadState, uploadAWS]);

  async function dataUpload(params) {
    setUploadAWS(true); // Set state before start AWS transfer
    var status = await window.electron.senddata(params);
    setUploadCount(uploadCount + 1); // Increment counter to track file index
    setUploadAWS(false); // Set state after AWS transfer concludes
  }
  async function endUpload() {
    setUploadState(false);
    setUiToggle(false);
    setMetaData({}); // Clear current metadata
  }

  // Handle metadata upload
  useEffect(() => {
    if (Object.keys(metaData).length !== 0) {
      sendMetaData(metaData)
    }
  }, [metaData]);

  async function sendMetaData(meta) {
    var status = await window.electron.sendmetadata(meta);
  }

  // Trigger data download
  // useEffect(() => {
  //   if (
  //     downloadState == true &&
  //     downloadConnect == false &&
  //     downloadCount < downloadList.length
  //   ) {
  //     var params = {
  //       key: downloadList[downloadCount],
  //       dataid: downloadParams.dataid,
  //       downloadpath: downloadParams.localpath,
  //       userid: downloadParams.userid,
  //     };
  //
  //     getData(params); // Start transfer for the file
  //   } else if (downloadState == true && downloadCount == downloadList.length) {
  //     setDownloadState(false);
  //     setDownloadList([]); // Clear current list
  //     setDownloadParams({});
  //     setDownloadCount(0);
  //   }
  // }, [downloadState, downloadConnect]);




  // Handle data download
  // async function getData(params) {
  //   setDownloadConnect(true); // Set state before start AWS transfer
  //   var status = await window.electron.getdata(params);
  //   setDownloadCount(downloadCount + 1); // Increment counter to track file index
  //   setDownloadConnect(false); // Set state after AWS transfer concludes
  // }

  return (
    <Switch>
      <Route path="/app" exact component={PublicLayout} />
      <Route
        path="/"
        render={(props) => (
          <ProtectedLayout
            opennotification={openNotification}
            getarchive={getArchive}
            setgetarchive={setGetArchive}
            archivemeta={archiveMeta}
            setarchivemeta={setArchiveMeta}
            buttonloading={buttonLoading}
            setbuttonloading={setButtonLoading}
            downloadstate={downloadState}
            setdownloadstate={setDownloadState}
            downloadconnect={downloadConnect}
            setdownloadconnect={setDownloadConnect}
            downloadparams={downloadParams}
            setdownloadparams={setDownloadParams}
            downloadcount={downloadCount}
            setdownloadcount={setDownloadCount}
            downloadlist={downloadList}
            setdownloadlist={setDownloadList}
            uploadpathname={uploadPathName}
            setuploadpathname={setUploadPathName}
            uploadtableloading={uploadTableLoading}
            setuploadtableloading={setUploadTableLoading}
            filelist={fileList}
            setfilelist={setFileList}
            metadata={metaData}
            setmetadata={setMetaData}
            uploadstate={uploadState}
            setuploadstate={setUploadState}
            uploadaws={uploadAWS}
            setuploadaws={setUploadAWS}
            uploadcount={uploadCount}
            setuploadcount={setUploadCount}
            uitoggle={uiToggle}
            setuitoggle={setUiToggle}
            pagestate={pageState}
            setpagestate={setPageState}
          />
        )}
      />
    </Switch>
  );
}

// Public layout
export const PublicLayout = (props) => (
  <BrowserRouter>
    <Layout>
      <Layout.Header></Layout.Header>
      <Layout.Content>
        <Switch>
          <Route path="/" component={Configuration} />
        </Switch>
      </Layout.Content>
      <Layout.Footer></Layout.Footer>
    </Layout>
  </BrowserRouter>
);

// Private layout
export const ProtectedLayout = (props) => (
  <BrowserRouter>
    <Layout>
      <Layout.Header>
        <Row justify="center" align="top" gutter={18}>
          <Col span={4}></Col>
          <Col span={4}>
            <Link to="/archive">
              <Button
                type={props.pagestate === 1 ? "primary" : "default"}
                block
                shape="round"
                icon={<HddOutlined />}
                onClick={()=> {props.setpagestate(1)}}
              >
                Data Archive
              </Button>
            </Link>
          </Col>
          <Col span={4}>
            <Link to="/upload">
              <Button
                type={props.pagestate === 2 ? "primary" : "default"}
                block
                shape="round"
                icon={<CloudUploadOutlined />}
                onClick={()=> {props.setpagestate(2)}}
              >
                Upload Data
              </Button>
            </Link>
          </Col>
          <Col span={8}></Col>
          <Col span={4}></Col>
        </Row>
      </Layout.Header>
      <Layout.Content>
        <Switch>
          <Route path="/archive">
            <Archive
              opennotification={props.opennotification}
              getarchive={props.getarchive}
              setgetarchive={props.setgetarchive}
              archivemeta={props.archivemeta}
              setarchivemeta={props.setarchivemeta}
              buttonloading={props.buttonloading}
              setbuttonloading={props.setbuttonloading}
              downloadstate={props.downloadState}
              setdownloadstate={props.setdownloadstate}
              downloadconnect={props.downloadconnect}
              setdownloadconnect={props.setdownloadconnect}
              downloadparams={props.downloadparams}
              setdownloadparams={props.setdownloadparams}
              downloadcount={props.downloadcount}
              setdownloadcount={props.setdownloadcount}
              downloadlist={props.downloadlist}
              setdownloadlist={props.setdownloadlist}
              metadata={props.metadata}
            />
          </Route>
          <Route path={["/app", "/upload"]}>
            <Upload
              uploadpathname={props.uploadpathname}
              setuploadpathname={props.setuploadpathname}
              uploadtableloading={props.uploadtableloading}
              setuploadtableloading={props.setuploadtableloading}
              filelist={props.filelist}
              setfilelist={props.setfilelist}
              metadata={props.metadata}
              setmetadata={props.setmetadata}
              uploadstate={props.uploadstate}
              setuploadstate={props.setuploadstate}
              uploadaws={props.uploadaws}
              setuploadaws={props.setuploadaws}
              uploadcount={props.uploadcount}
              setuploadcount={props.setuploadcount}
              uitoggle={props.uitoggle}
              setuitoggle={props.setuitoggle}
            />
          </Route>
        </Switch>
      </Layout.Content>
      <Layout.Footer></Layout.Footer>
    </Layout>
  </BrowserRouter>
);

export default App;
