# CryoBase

CryoBase is a graphical application to store and manage cryo-EM data using Amazon Web Services (AWS) Simple Storage Solution (S3). The goal is to provide a convenient way to store cryo-EM data using low-cost cloud storage. The application has an interface for entering metadata for a cryo-EM dataset and uploading the dataset to S3. It supports the S3 `STANDARD` storage class, and the `DEEP_ARCHIVE` storage class which is priced at about $1/TB/month. There is also an interface for browsing and downloading datasets stored on S3. CryoBase is designed to interact with the user's own AWS account so the user has complete control over the data even without CryoBase. 

The project is configured to create builds for macOS and Linux. Build instructions are below.

CryoBase is made with the React and Electron frameworks. The UI was made with AntD.

:no_entry: I'm no longer maintaining this project but if you have questions feel free to post them and I will do my best to respond.

## How to use CryoBase
NOTE: Before using AWS S3 or CryoBase please familiarize yourself with the data storage and retrieval costs of AWS S3 ([link](https://aws.amazon.com/s3/pricing/)).

### Step 1. Creating an AWS account
1. Go to the AWS Management Console website and click `Create an AWS Account`.
2. After creating the account, click on your username in the top menu bar of the AWS Management Console website and select `My Security Credentials`.
3. Under the `Access keys (access key ID and secret access key)` section, click `Create New Access Key`. This generates an `AWS Access Key` and `AWS Secret Key`. You will use these keys later to configure CryoBase.

### Step 2. Creating an AWS storage bucket
1. Within the AWS Management Console page navigate to the S3 section (found under the Storage service category).
2. Here you will create a bucket, which is conceptually like a directory to store your data. Click `Create bucket`. Enter a bucket name (for example, *cryo-em-data*). Select the nearest AWS Region from the dropdown menu. Customize the bucket settings as desired and click `Create bucket` at the bottom of the page.

### Step 3. Configuring CryoBase
1. Open CryoBase and click `Settings` (the gear icon). Enter the bucket name, AWS Access Key, and AWS Secret Key.
2. CryoBase will notify you if your AWS configuration details are valid. If you have already uploaded data to the target bucket using CryoBase then the `Data Archive` section will automatically populate to show the available datasets.

![alt text](readme_img/settings.png?raw=true)

### Step 4. Uploading data
1. Click `Upload Data` (the cloud icon). Enter the details for the cryo-EM dataset to be uploaded.
2. Select the desired storage class (`STANDARD` or `DEEP_ARCHIVE`). The details and costs of these classes is provided on the AWS S3 website. Essentially `STANDARD` is higher cost but can be downloaded on-demand, while `DEEP_ARCHIVE` is low-cost but requires a 12-48 hour retrieval step before data can be downloaded.
3. Click `Start Upload`. While the upload is in progress you can freely switch to the `Data Archive` section to see the new dataset entry in the table.

![alt text](readme_img/upload.png?raw=true)

### Step 5. Downloading data
Data stored in the `STANDARD` storage class:
1. Click `Data Archive` and select a dataset from the table.
2. Choose a local download path.
3. Click `Start Download`.

Data stored in the `DEEP_ARCHIVE` storage class:
1. Click `Data Archive` and select a dataset from the table.
2. There are different `Data Status` categories relevant to interacting with data stored in the `DEEP_ARCHIVE` storage class.
* `Archived` means a data retrieval process must be initiated to make it available for download. Click the `Archived` button and wait until a notification confirms the data is being restored. Depending on the number of files in the dataset it may take a few minutes for this process to complete and the notification to display.
* `Restoring` means that AWS has marked the data to be restored. Clicking the `Restoring` button will check the status of the restoration process. Once the data is restored, clicking this button will confirm the restored status of the data and the button will change to `Restored`.
* `Restored` means the data has been retrieved and is available for download. After selecting the table row, choose a local download path and click `Start Download`. Clicking the `Restored` button will display a notification with the estimate for when the data will return to `Archived` status (3 days from the time data retrieval completed).
* `Archiving` means the recovered data has partially expired and is being returned to `Archived` status. Once the data has completely returned to `Archived` status it will again be available for retrieval.

![alt text](readme_img/download.png?raw=true)

## Other topics

### How to delete data
As a precaution CryoBase was designed without an interface for deleting data. However, data can easily be deleted from the AWS S3 web console.
1. Navigate to the S3 section of the AWS console.
2. Locate the bucket used by CryoBase (e.g. *cryo-em-data*). Within this bucket select the dataset you want to delete, and click `Delete`. AWS will go through a quick confirmation step to verify you actually want to delete the data.
3. In addition, you should delete the associated metadata for the target dataset. This will ensure that CryoBase no longer displays the dataset as an entry in the Archive table. The metadata can be found in your bucket within the metadata path (e.g. *cryo-em-data/metadata*). Select the metadata for the target dataset and click `Delete`.

## Quick overview of running in development mode and building

Download the git repo and install the dependencies.
`yarn` or `npm install`

Start the React web server.
`yarn start` or `npm start`

In a separate shell start Electron.
`yarn electron-start` or `npm run electron-start`

Build the package.
`yarn electron-pack` or `npm run electron-pack`

#### Technical notes
Electron Builder prefers to have the main JS file named as `electron.js` so should not use `main.js`.

Electron Builder only does minification for files in `/src` and thus will not minify `electron.js` or `preload.js` which reside in `/public`. As a workaround the `prebuild.sh` script is run before the app is packaged, and the `postbuild.sh` script is run after packaging. This script requires the `yarn dist` and `yarn dist` directories which are in the main project folder. Both scripts are automatically run when running `yarn electron-pack` or `npm run electron-pack`.

This repository was helpful for getting Electron Builder to properly package the app: https://github.com/rgfindl/electron-cra-boilerplate

##### Available Scripts from Create React App
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

#### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

#### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

#### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

#### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

#### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

#### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

#### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

#### Electron Builder scripts

#### `npm run pack`

You can run yarn pack (only generates the package directory without really packaging it. This is useful for testing purposes).

#### `npm run dist`

You can run yarn dist (to package in a distributable format (e.g. dmg, windows installer, deb package))
