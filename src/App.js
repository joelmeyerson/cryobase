import React, { useState, useEffect } from "react";
import { Layout, Button, Row, Col, Popover, notification } from "antd";
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
import {
  validateUser,
  fetchLicense,
  validateLicense,
} from "./Authentication.js";

// Antd notification system
async function openNotification(notificationText) {
  notification.open({
    message: notificationText,
    description: "",
    placement: "bottomRight",
    className: "custom-class",
    icon: <FlagOutlined />,
    duration: 4,
    style: {
      width: 800,
    },
  });
}

export default function App() {
  const [auth, setAuth] = useState(true); // Authentication disabled
  const [authUser, setAuthUser] = useState(""); // User name
  const [authUserData, setAuthUserData] = useState({}); // Contains token retrieved after user authentication, used to check license status
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

  const [selectedData, setSelectedData] = useState({
    dataid: "",
    status: "",
    storage: "",
  });
  const [currentRowKey, setCurrentRowKey] = useState(null); // Used to story the key for currently selected table row
  const [downloadState, setDownloadState] = useState(false); // Set whether AWS file download active
  const [downloadConnect, setDownloadConnect] = useState(false); // Set whether AWS file download active
  const [downloadParams, setDownloadParams] = useState({}); // Store metadata to display in Archive table
  const [downloadCount, setDownloadCount] = useState(0); // Counter for file upload
  const [downloadList, setDownloadList] = useState([]); // Hold list of files for upload job

  const [uploadPathName, setUploadPathName] = useState({ path: "" });
  const [uploadTableLoading, setUploadTableLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // Hold list of files for upload job
  const [metaData, setMetaData] = useState({});
  const [uploadState, setUploadState] = useState(false); // Set whether user has started upload job
  const [uploadCancel, setUploadCancel] = useState(false); // Used to trigger upload cancel
  const [uploadAWS, setUploadAWS] = useState(false); // Set whether AWS file upload active
  const [uploadCount, setUploadCount] = useState(0); // Counter for file upload
  const [uiToggle, setUiToggle] = useState(false); // Used to toggle UI after start and stop of upload

  const history = useHistory();
  //history.push("/login"); // Can be used to force a path

  // Load AWS bucket and credentials after user authenticates
  useEffect(() => {
    if (auth === true && localStorage.hasOwnProperty("configaws") === true) {
      loadConfig();
    }
  }, [auth]);

  async function loadConfig() {
    var config = JSON.parse(localStorage.getItem("configaws"));
    //setConfigAWS(config);
    //setConfigValid(true);
    configureAWS(config);
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
        bucket: "",
        accessKey: "",
        secretKey: "",
      });
      setConfigValid(false);
    } else {
      //setConfigAWS(config);
      saveConfig(config);
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
    if (getArchive === true) {
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
    } else {
      // If downloaded archive is empty this likely means the AWS config was changed to a new account.
      // Update the archiveMeta state to contain an empty array
      setArchiveMeta(archiveObjArray);
      // Also, if the user did change accounts its essential to clear the local copy of the archive
      if (localStorage.hasOwnProperty("archive") === true) {
        localStorage.removeItem("archive");
      }
    }
    setGetArchive(false);
  }

  // Validate user license
  async function checkLicense() {
    //console.log(authUserData)
    if (Object.keys(authUserData).length === 0) {
      openNotification(
        "This action cannot be completed. The license token was not found."
      );
      return false;
    } else {
      const [dataLicense, errorsLicense] = await fetchLicense(
        authUserData.attributes.token
      );
      if (errorsLicense) {
        openNotification(
          "This action cannot be completed. There was an error retrieving the license."
        );
        return false;
      } else if (dataLicense.length === 1) {
        // If true then a license was found
        const [
          metaValidate,
          dataValidate,
          errorsValidate,
        ] = await validateLicense(
          authUserData.attributes.token,
          dataLicense[0].id
        );

        if (metaValidate.constant === "VALID") {
          //openNotification("License is good.");
          return true;
        } else {
          openNotification(
            "This action cannot be completed. There was an error validating the license."
          );
          return false;
        }
      } else {
        openNotification(
          "This action cannot be completed. No license was found."
        );
        return false;
      }
    }
  }

  // Handle data upload
  useEffect(() => {
    if (
      uploadState === true &&
      uploadAWS === false &&
      uploadCount < fileList.length &&
      uploadCancel === false
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
    } else if (
      //uploadState === true &&
      //Object.keys(metaData).length !== 0 &&
      uploadCancel === true
    ) {
      cancelUpload();
    }
  }, [uploadState, uploadAWS, uploadCancel]);

  async function dataUpload(params) {
    setUploadAWS(true); // Set state before start AWS transfer
    await window.electron.senddata(params);
    setUploadCount(uploadCount + 1); // Increment counter to track file index
    setUploadAWS(false); // Set state after AWS transfer concludes
  }
  async function endUpload() {
    await setUploadState(false);
    await setUiToggle(false);
    await setUploadCount(0); // Reset transfer count
    await window.electron.updatemeta({
      dataid: metaData.dataid,
      key: "uploadcompleted",
      val: true,
    });
    await setGetArchive(true);
    await setMetaData({}); // Clear current metadata
    await setUiToggle(false);
    await setUploadCount(0); // Reset transfer count
    await setUploadState(false);
    openNotification("Upload complete.");
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
    await setMetaData({}); // Clear current metadata
    await setUploadCancel(false);
    await setUploadState(false);
    openNotification("Upload canceled.");
  }

  // Handle metadata upload
  useEffect(() => {
    if (Object.keys(metaData).length !== 0) {
      sendMetaData(metaData);
    }
  }, [metaData]);

  async function sendMetaData(meta) {
    await window.electron.sendmetadata(meta);
  }

  // Handle data download
  useEffect(() => {
    if (
      downloadState === true &&
      downloadConnect === false &&
      downloadCount < downloadList.length
    ) {
      var params = {
        key: downloadList[downloadCount],
        dataid: downloadParams.dataid,
        downloadpath: downloadParams.localpath,
      };
      getData(params); // Start transfer for the file
    } else if (
      downloadState === true &&
      downloadCount === downloadList.length
    ) {
      endDownload();
    } else if (
      downloadState === false &&
      Object.keys(downloadList).length !== 0
    ) {
      cancelDownload();
    }
  }, [downloadState, downloadConnect]);

  async function getData(params) {
    setDownloadConnect(true); // Set state before start AWS transfer
    await window.electron.getdata(params);
    setDownloadCount(downloadCount + 1); // Increment counter to track file index
    setDownloadConnect(false); // Set state after AWS transfer concludes
  }

  async function endDownload() {
    setDownloadState(false);
    setDownloadList([]); // Clear current list
    setDownloadParams({});
    setDownloadCount(0);
    openNotification("Download complete.");
  }

  async function cancelDownload() {
    setDownloadList([]); // Clear current list
    setDownloadParams({});
    setDownloadCount(0);
    openNotification("Download canceled.");
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
                    setauthuser={setAuthUser}
                    setauthuserdata={setAuthUserData}
                    setconfigaws={setConfigAWS}
                    configaws={configAWS}
                    setconfigvalid={setConfigValid}
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
            <Row justify="space-around" gutter={[8, 18]}>
              <Col span={24}></Col>
              <Col span={24}></Col>

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
              {/* <Col>
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
                      setArchiveMeta([]); // Clear metadata archive in state
                      localStorage.removeItem("archivemeta"); // Clear metadata archive in local storage
                      openNotification("Logged out.");
                    }}
                  ></Button>
                </Popover>
              </Col> */}
            </Row>
          </Layout.Sider>
          <Layout>
            <Layout.Content>
              <Settings
                auth={auth}
                authuser={authUser}
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
                    currentrowkey={currentRowKey}
                    setcurrentrowkey={setCurrentRowKey}
                    selecteddata={selectedData}
                    setselecteddata={setSelectedData}
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
                    checklicense={checkLicense}
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
                    setuploadcancel={setUploadCancel}
                    uploadaws={uploadAWS}
                    setuploadaws={setUploadAWS}
                    uploadcount={uploadCount}
                    setuploadcount={setUploadCount}
                    uitoggle={uiToggle}
                    setuitoggle={setUiToggle}
                    checklicense={checkLicense}
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
