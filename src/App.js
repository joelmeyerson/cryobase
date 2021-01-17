import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Row,
  Col,
  Card,
  Menu,
  Sider,
  Popover,
  notification,
} from "antd";
import {
  HddOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  FlagOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import Cookies from "js-cookie";
import "./App.css";
import Archive from "./Archive.js";
import Upload from "./Upload.js";
import Authentication from "./Authentication.js";

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
  const [token, setToken] = useState(true); // Store authentication token
  const [auth, setAuth] = useState(false); // Store authentication state

  const [getArchive, setGetArchive] = useState(false); // Trigger when to fetch metadata for Archive componenet
  const [archiveMeta, setArchiveMeta] = useState([]); // Store metadata to display in Archive table
  const [buttonLoading, setButtonLoading] = useState(false); // Toggle button loading
  const [currentDataID, setCurrentDataID] = useState({ dataid: "" }); // Currently selected data ID

  const [downloadState, setDownloadState] = useState(false); // Set whether AWS file download active
  const [downloadConnect, setDownloadConnect] = useState(false); // Set whether AWS file download active
  const [downloadParams, setDownloadParams] = useState({}); // Store metadata to display in Archive table
  const [downloadCount, setDownloadCount] = useState(0); // Counter for file upload
  const [downloadList, setDownloadList] = useState([]); // Hold list of files for upload job

  const [uploadPathName, setUploadPathName] = useState({ path: "" });
  const [uploadTableLoading, setUploadTableLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // Hold list of files for upload job
  const [metaData, setMetaData] = useState({}); // Store metadata for upload job
  const [uploadState, setUploadState] = useState(false); // Set whether user has started upload job
  const [uploadAWS, setUploadAWS] = useState(false); // Set whether AWS file upload active
  const [uploadCount, setUploadCount] = useState(0); // Counter for file upload
  const [uiToggle, setUiToggle] = useState(false); // Used to toggle UI after start and stop of upload

  // Fetch metadata archive to populate table
  useEffect(() => {
    if (getArchive == true) {
      fetchArchive(); // Start transfer for the file
    }
  }, [getArchive]);

  async function fetchArchive() {
    var archive = await window.electron.getmetadata();
    var archiveObjArray = [];
    if (archive.length > 0) {
      for (var i = 0; i <= archive.length - 1; i++) {
        archiveObjArray.push({
          key: i + 1,
          ...archive[i],
        });
      }
      localStorage.setItem("archive", JSON.stringify(archiveObjArray)); // Store a copy in local storage for caching
      setArchiveMeta(archiveObjArray);
    }
    setGetArchive(false);
  }

  // Handle data upload
  useEffect(() => {
    if (
      uploadState === true &&
      uploadAWS === false &&
      uploadCount < fileList.length
    ) {
      var transferparams = {
        file: fileList[uploadCount].name,
        dataid: metaData.dataid,
        path: metaData.path,
        storage: metaData.storage,
      };
      dataUpload(transferparams); // Start transfer for the file
    } else if (uploadState === true && uploadCount === fileList.length) {
      endUpload();
    } else if (uploadState === false && Object.keys(metaData).length !== 0) {
      cancelUpload();
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
    setUploadCount(0); // Reset transfer count
    var status = window.electron.updatemeta({
      dataid: metaData.dataid,
      key: "uploadcompleted",
      val: true,
    });
    setMetaData({}); // Clear current metadata
  }
  async function cancelUpload() {
    setUiToggle(false);
    setUploadCount(0); // Reset transfer count
    var status = window.electron.updatemeta({
      dataid: metaData.dataid,
      key: "uploadcompleted",
      val: false,
    });
    setMetaData({}); // Clear current metadata
  }

  // Handle metadata upload
  useEffect(() => {
    if (Object.keys(metaData).length !== 0) {
      sendMetaData(metaData);
    }
  }, [metaData]);

  async function sendMetaData(meta) {
    var status = await window.electron.sendmetadata(meta);
  }

  // Handle data download
  useEffect(() => {
    if (
      downloadState == true &&
      downloadConnect == false &&
      downloadCount < downloadList.length
    ) {
      var params = {
        key: downloadList[downloadCount],
        dataid: downloadParams.dataid,
        downloadpath: downloadParams.localpath,
      };

      getData(params); // Start transfer for the file
    } else if (downloadState == true && downloadCount == downloadList.length) {
      setDownloadState(false);
      setDownloadList([]); // Clear current list
      setDownloadParams({});
      setDownloadCount(0);
    }
  }, [downloadState, downloadConnect]);

  async function getData(params) {
    setDownloadConnect(true); // Set state before start AWS transfer
    var status = await window.electron.getdata(params);
    setDownloadCount(downloadCount + 1); // Increment counter to track file index
    setDownloadConnect(false); // Set state after AWS transfer concludes
  }

  return (
    <Switch>
      <Route
        path="/"
        render={(props) =>
          token === null ? (
            <PublicLayout
              settoken={setToken}
              opennotification={openNotification}
            />
          ) : (
            <ProtectedLayout
              settoken={setToken}
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
            />
          )
        }
      />
    </Switch>
  );
}

// Public layout
export const PublicLayout = (props) => (
  <BrowserRouter>
    <Layout>
      <Layout.Content>
        <Switch>
          <Route path="/">
            <Authentication
            settoken={props.settoken}
            opennotification={props.opennotification}
            />
          </Route>
        </Switch>
      </Layout.Content>
    </Layout>
  </BrowserRouter>
);

// Private layout
export const ProtectedLayout = (props) => (
  <BrowserRouter>
    <Layout>
      <Layout.Sider theme="dark" width={60}>
        <Row justify="space-around" gutter={[8, 64]}>
          <Col></Col>
        </Row>

        <Row justify="space-around" gutter={[8, 24]}>
          <Col>
            <Link to="/archive">
              <Popover content={"Data Archive"} placement="right">
                <Button
                  type="primary"
                  icon={<HddOutlined />}
                  shape="circle"
                  size="large"
                ></Button>
              </Popover>
            </Link>
          </Col>
        </Row>

        <Row justify="space-around" gutter={[8, 24]}>
          <Col>
            <Link to="/upload">
              <Popover content={"Upload Data"} placement="right">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CloudUploadOutlined />}
                  shape="circle"
                  size="large"
                ></Button>
              </Popover>
            </Link>
          </Col>
        </Row>

        <Row justify="space-around" gutter={[8, 24]}>
          <Col>
            <Popover content={"User Settings"} placement="right">
              <Button
                type="primary"
                icon={<UserOutlined />}
                shape="circle"
                size="large"
              ></Button>
            </Popover>
          </Col>
        </Row>

        <Row justify="space-around" gutter={[8, 24]}>
          <Col>
            <Popover content={"Logout"} placement="right">
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                shape="circle"
                size="large"
                onClick={() => {
                  props.settoken(null)
                  openNotification("Logged out.");
                }}
              ></Button>
            </Popover>
          </Col>
        </Row>
      </Layout.Sider>
      <Layout>
        <Layout.Content>
          <Switch>
            <Route path={["/", "/archive"]}>
              <Archive
                opennotification={props.opennotification}
                getarchive={props.getarchive}
                setgetarchive={props.setgetarchive}
                archivemeta={props.archivemeta}
                setarchivemeta={props.setarchivemeta}
                buttonloading={props.buttonloading}
                setbuttonloading={props.setbuttonloading}
                downloadstate={props.downloadstate}
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
            <Route path={"/upload"}>
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
      </Layout>
    </Layout>
  </BrowserRouter>
);

export default App;
