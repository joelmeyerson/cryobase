import React, { useState, useEffect } from "react";
import { Layout, Button } from "antd";
import {
  HddOutlined,
  CloudUploadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import Cookies from "js-cookie";
import "./App.css";
import Archive from "./Archive.js";
import Session from "./Session.js";
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

function App() {
  const [getArchive, setGetArchive] = useState(false); // Trigger when to fetch metadata for Archive componenet
  const [archiveMeta, setArchiveMeta] = useState([]); // Store metadata to display in Archive table

  //const [downloadState, setDownloadState] = useState(false); // Set whether AWS file upload active
  //const [archiveMeta, setArchiveMeta] = useState([]) // Store metadata to display in Archive table

  const [fileList, setFileList] = useState([]); // Hold list of files for upload job
  const [metaData, setMetaData] = useState({}); // Store metadata for upload job
  const [transferState, setTransferState] = useState(false); // Set whether user has started upload job
  const [uploadState, setUploadState] = useState(false); // Set whether AWS file upload active
  const [uploadCount, setUploadCount] = useState(0); // Counter for file upload
  const [uiToggle, setUiToggle] = useState(false); // Used to toggle UI after start and stop of upload

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
    }
  }, [transferState, uploadState]);

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

  // // Trigger data download

  // Very important to check if data is restored. If so, data may be partially put back in Glacier archive. So, need to run check to make sure it fully available for download

  // useEffect(() => {
  //   if (transferState == true && uploadState == false && uploadCount < fileList.length) {
  //     var transferparams = {
  //       file: fileList[uploadCount].name,
  //       dataid: metaData.dataid,
  //       path: metaData.path,
  //       userid: metaData.userid,
  //       storage: metaData.storage
  //     }
  //     sendData(transferparams) // Start transfer for the file
  //   }
  //   else if (transferState == true && uploadCount == fileList.length) {
  //     setTransferState(false)
  //     setUiToggle(false)
  //   }
  // }, [transferState, uploadState])
  //
  // // Handle data download
  // async function sendData(params) {
  //   setUploadState(true) // Set state before start AWS transfer
  //   var status = await window.electron.senddata(params)
  //   setUploadCount(uploadCount + 1) // Increment counter to track file index
  //   setUploadState(false) // Set state after AWS transfer concludes
  // }

  // For testing
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <Switch>
      <Route path="/app" exact component={PublicLayout} />
      <Route
        path="/"
        render={(props) => (
          <ProtectedLayout
            getarchive={getArchive}
            setgetarchive={setGetArchive}
            archivemeta={archiveMeta}
            setarchivemeta={setArchiveMeta}
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
        <AmplifySignOut />
        <Link to="/archive" className="btn-data-archive">
          <Button icon={<HddOutlined />}>Data Archive</Button>
        </Link>
        <Link to="/session" className="btn-manager">
          <Button icon={<CloudUploadOutlined />}>Session Manager</Button>
        </Link>
      </Layout.Header>
      <Layout.Content>
        <Switch>
          <Route path="/archive">
            <Archive
              getarchive={props.getarchive}
              setgetarchive={props.setgetarchive}
              archivemeta={props.archivemeta}
              setarchivemeta={props.setarchivemeta}
            />
          </Route>
          <Route path={["/app", "/session"]}>
            <Session
              user={cognitoUser}
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
//export default App
