## CryoBase details

CryoBase was made with Create React App, Electron, and Electron Builder. AntD framework used for UI.

## Quick overview of running and building

Download the git repo and install the dependencies running `yarn` or `npm install`. The following assumes NPM is used but Yarn commands can be used instead. Use `npm start` or `yarn start` to start the React web server, then in a separate shell run `npm run electron-start` or `yarn electron-start` to open the Electron app with debut console enabled. To build the package run `yarn dist` to generate the dist folder which contains the app.

NOTE: The electron-builder tool which is run with `yarn dist` will minify all code in the /src folder. However, main.js and preload.js cannot reside in /src and thus are not minified. As a workaround, main.js and preload.js should be manually minified using the Babel minify tool. The script minify-script.sh contains the command to do this. The minified versions should replace the original main.js and preload.js before building.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts from Create React App

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

### Electron Builder scripts

### `npm run pack`

You can run yarn pack (only generates the package directory without really packaging it. This is useful for testing purposes).

### `npm run dist`

You can run yarn dist (to package in a distributable format (e.g. dmg, windows installer, deb package))
