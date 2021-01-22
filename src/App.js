import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Row,
  Col,
  Popover,
  notification,
} from "antd";
import {
  DatabaseOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  FlagOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  HashRouter,
  Route,
  Switch,
  Link,
  Redirect,
  useHistory,
} from "react-router-dom";
import "./App.css";
import Archive from "./Archive.js";
import Upload from "./Upload.js";
import Login from "./Login.js";
import Register from "./Register.js";
import Settings from "./Settings.js";

// Antd notification system
async function openNotification(notificationText) {
  notification.open({
    message: notificationText,
    description: "",
    placement: "topRight",
    className: "custom-class",
    icon: <FlagOutlined />,
    duration: 6,
    style: {
      width: 800,
    },
  });
}

export default function App() {
  const [auth, setAuth] = useState(false); // Authenticate if token obtained in login page
  const [lockUI, setLockUI] = useState(true); // State to lock or unlock UI

  const [modalVisible, setModalVisible] = useState(false);
  const [configAWS, setConfigAWS] = useState({
    bucket: "",
    accessKey: "",
    secretKey: "",
  });
  const [configValid, setConfigValid] = useState(false);

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

  const history = useHistory();
  history.push("/login"); // Can be used to force a path

  // Load AWS bucket and credentials after user authenticates
  useEffect(() => {
    if (auth === true && localStorage.hasOwnProperty("configaws") === true) {
      loadConfig();
    }
  }, [auth]);

  async function loadConfig() {
    var config = JSON.parse(localStorage.getItem("configaws"));
    setConfigAWS(config);
  }

  async function saveConfig(config) {
    localStorage.setItem("configaws", JSON.stringify(config));
    setConfigAWS(config);
  }

  async function configureAWS(config) {
    var validateaws = await window.electron.configureaws(config);
    if (validateaws === "error") {
      openNotification(
        "AWS configuration is not valid. Please check settings and try again."
      );
      setConfigAWS({
        ["bucket"]: "",
        ["accessKey"]: "",
        ["secretKey"]: "",
      });
      setConfigValid(false);
    } else {
      setConfigAWS(config);
      setConfigValid(true);
      setGetArchive(true); // Load archive
      openNotification("AWS configuration is valid.");
    }
  }

  // Handle global UI lock
  useEffect(() => {
    if (auth === true && configValid === true) {
      toggleLockUI(false);
    } else {
      toggleLockUI(true);
    }
  }, [auth, configValid]);

  async function toggleLockUI(bool) {
    setLockUI(bool);
  }

  // Control user settings modal
  async function openUserSettings() {
    setModalVisible(true);
  }

  const handleClose = () => {
    setModalVisible(false);
  };

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
    var status = await window.electron.updatemeta({
      dataid: metaData.dataid,
      key: "uploadcompleted",
      val: true,
    });
    await setGetArchive(true);
    setMetaData({}); // Clear current metadata
  }
  async function cancelUpload() {
    setUiToggle(false);
    setUploadCount(0); // Reset transfer count
    // var status = await window.electron.updatemeta({
    //   dataid: metaData.dataid,
    //   key: "uploadcompleted",
    //   val: false,
    // });
    await setGetArchive(true);
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
    <HashRouter>
      {auth === false ? (
        <Layout>
          <Layout.Content>
            <Switch>
              <Route
                path="/login"
                render={(props) => (
                  <Login
                    setauth={setAuth}
                    opennotification={openNotification}
                  />
                )}
              />
              <Route
                path="/register"
                render={(props) => (
                  <Register
                    setauth={setAuth}
                    opennotification={openNotification}
                  />
                )}
              />
              <Redirect from="/" to="/login" exact />
            </Switch>
          </Layout.Content>
        </Layout>
      ) : (
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
                      shape="circle"
                      icon={<DatabaseOutlined />}
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
                <Popover content={"Settings"} placement="right">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SettingOutlined />}
                    size="large"
                    onClick={openUserSettings}
                  ></Button>
                </Popover>
              </Col>
            </Row>

            <Row justify="space-around" gutter={[8, 24]}>
              <Col>
                <Popover content={"Logout"} placement="right">
                  <Button
                    type="primary"
                    shape="circle"
                    danger
                    icon={<LogoutOutlined />}
                    size="large"
                    onClick={() => {
                      setAuth(false);
                      history.push("/login");
                      openNotification("Logged out.");
                    }}
                  ></Button>
                </Popover>
              </Col>
            </Row>
          </Layout.Sider>
          <Layout>
            <Layout.Content>
              <Settings
                auth={auth}
                opennotification={openNotification}
                handleclose={handleClose}
                modalvisible={modalVisible}
                configaws={configAWS}
                configureaws={configureAWS}
                setconfigaws={setConfigAWS}
                uploadstate={uploadState}
                downloadstate={downloadState}
              />
              <Switch>
                <Route path="/archive">
                  <Archive
                    lockui={lockUI}
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
                    metadata={metaData}
                  />
                </Route>
                <Route exact path={"/upload"}>
                  <Upload
                    lockui={lockUI}
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
                </Route>
                <Redirect from={"/login"} to="/archive" exact />
              </Switch>
            </Layout.Content>
          </Layout>
        </Layout>
      )}
    </HashRouter>
  );
}
