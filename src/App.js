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

// Import AWS
import AWS from "aws-sdk";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Auth } from "aws-amplify";
import { Amplify } from "aws-amplify";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  CognitoIdentityCredentials,
  CognitoCachingCredentialsProvider,
} from "amazon-cognito-identity-js";

// AWS authentication
var data = {
  UserPoolId: "us-east-1_jfISkLHGg",
  ClientId: "59l85geov36gnrk0pj9rfg45dv",
};

var userPool = new CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();
if (cognitoUser != null) {
  cognitoUser.getSession(function (err, result) {
    if (result) {
      console.log("You are now logged in.");

      // Initialize the Amazon Cognito credentials provider
      AWS.config.region = "us-east-1"; // Region
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: "us-east-1:c6729a0c-1214-4b75-8059-2b62345c0427",
        Logins: {
          "cognito-idp.us-east-1.amazonaws.com/us-east-1_jfISkLHGg": result
            .getIdToken()
            .getJwtToken(),
        },
      });
    }
  });
}

{
  /*console.log("getting credentials...")
AWS.config.credentials.refresh(function() {
   console.log("Credentials obtained after login")
});*/
}

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
  const [currentDataID, setCurrentDataID] = useState({ dataid: "" }); // Set whether user has started upload job
  const [transferState, setTransferState] = useState(false); // Set whether user has started upload job
  const [uploadState, setUploadState] = useState(false); // Set whether AWS file upload active
  const [uploadCount, setUploadCount] = useState(0); // Counter for file upload
  const [uiToggle, setUiToggle] = useState(false); // Used to toggle UI after start and stop of upload

  const [pageState, setPageState] = useState(0); // Track which page is loaded

  // Check that IdentityID has loaded
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (typeof(AWS.config.credentials.identityId) == 'undefined') {
  //       console.log("refreshing")
  //       AWS.config.credentials.refresh()
  //     }
  //     else {
  //       console.log("IdentityID loaded:", AWS.config.credentials.identityId)
  //     }
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // });

  // Trigger fetch of archive metadata
  useEffect(() => {
    if (getArchive == true) {
      fetchArchive(AWS.config.credentials.identityId); // Start transfer for the file
    }
  }, [getArchive]);

  // Handle meta data download to populate Archive table
  async function fetchArchive(identityid) {
    var archive = await window.electron.getmetadata(identityid);
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

  // Trigger metadata upload
  useEffect(() => {
    if (typeof metaData.dataid !== "undefined") {
      sendMetaData(metaData); // Start transfer for the file
    }
  }, [metaData]);

  // Trigger data upload
  useEffect(() => {
    if (
      transferState == true &&
      uploadState == false &&
      uploadCount < fileList.length
    ) {
      var transferparams = {
        file: fileList[uploadCount].name,
        dataid: metaData.dataid,
        path: metaData.path,
        userid: metaData.userid,
        storage: metaData.storage,
      };
      sendData(transferparams); // Start transfer for the file
    } else if (transferState == true && uploadCount == fileList.length) {
      setTransferState(false);
      setUiToggle(false);
      setMetaData({}); // Clear current metadata
    }
  }, [transferState, uploadState]);

  // Trigger data download
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
        userid: downloadParams.userid,
      };

      getData(params); // Start transfer for the file
    } else if (downloadState == true && downloadCount == downloadList.length) {
      setDownloadState(false);
      setDownloadList([]); // Clear current list
      setDownloadParams({});
      setDownloadCount(0);
    }
  }, [downloadState, downloadConnect]);

  // Handle metadata upload
  async function sendMetaData(params) {
    var status = await window.electron.sendmetadata(params);
    setTransferState(true); // This will trigger side effect to start file uploads
  }

  // Handle data upload
  async function sendData(params) {
    setUploadState(true); // Set state before start AWS transfer
    var status = await window.electron.senddata(params);
    setUploadCount(uploadCount + 1); // Increment counter to track file index
    setUploadState(false); // Set state after AWS transfer concludes
  }

  // Handle data download
  async function getData(params) {
    setDownloadConnect(true); // Set state before start AWS transfer
    var status = await window.electron.getdata(params);
    setDownloadCount(downloadCount + 1); // Increment counter to track file index
    setDownloadConnect(false); // Set state after AWS transfer concludes
  }

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
            transferstate={transferState}
            settransferstate={setTransferState}
            uploadstate={uploadState}
            setuploadstate={setUploadState}
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
          <Col span={4}>
            <AmplifySignOut />
          </Col>
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
              user={cognitoUser}
              uploadpathname={props.uploadpathname}
              setuploadpathname={props.setuploadpathname}
              uploadtableloading={props.uploadtableloading}
              setuploadtableloading={props.setuploadtableloading}
              filelist={props.filelist}
              setfilelist={props.setfilelist}
              metadata={props.metadata}
              setmetadata={props.setmetadata}
              transferstate={props.transferstate}
              settransferstate={props.settransferstate}
              uploadstate={props.uploadstate}
              setuploadstate={props.setuploadstate}
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

export default withAuthenticator(App);
//export default App;
