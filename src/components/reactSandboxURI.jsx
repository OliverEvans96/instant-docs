import LZString from 'lz-string'

function compress(string) {
  return LZString.compressToBase64(string)
    .replace(/\+/g, `-`) // Convert '+' to '-'
    .replace(/\//g, `_`) // Convert '/' to '_'
    .replace(/=+$/, ``) // Remove ending '='
}

const PACKAGE_JSON = {
  scripts: {
    start: 'react-scripts start',
    build: 'react-scripts build',
    test: 'react-scripts test --env=jsdom',
    eject: 'react-scripts eject',
  },
  dependencies: {
    react: '18.0.0',
    'react-dom': '18.0.0',
    'react-scripts': '4.0.0',
    '@instantdb/react': '^0.3.33',
  },
  devDependencies: {
    '@babel/runtime': '7.13.8',
    typescript: '4.1.3',
  },
}

const INDEX_CSS = `
body {
  font-family: sans-serif;
}
`.trim()

const INDEX_JS = `
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`.trim()

const INDEX_HTML = `
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="theme-color" content="#000000">
	<!--
      manifest.json provides metadata used when your web app is added to the
      homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
    -->
	<link rel="manifest" href="%PUBLIC_URL%/manifest.json">
	<link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
	<!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the \`public\` folder during the build.
      Only files inside the \`public\` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running \`npm run build\`.
    -->
	<title>React App</title>
</head>

<body>
	<noscript>
		You need to enable JavaScript to run this app.
	</noscript>
	<div id="root"></div>
	<!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run \`npm start\` or \`yarn start\`.
      To create a production bundle, use \`npm run build\` or \`yarn build\`.
    -->
</body>
</html>
`.trim()

export default function reactSandboxURI(appJSCode) {
  let parameters = {
    files: {
      'package.json': {
        content: PACKAGE_JSON,
      },
      'src/App.js': {
        content: appJSCode,
      },
      'src/index.css': {
        content: INDEX_CSS,
      },
      'src/index.js': {
        content: INDEX_JS,
      },
      'public/index.html': {
        content: INDEX_HTML,
      },
    },
  }

  return `https://codesandbox.io/api/v1/sandboxes/define?parameters=${compress(
    JSON.stringify(parameters)
  )}`
}
