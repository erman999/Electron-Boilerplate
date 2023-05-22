# Electron-Boilerplate
Simple Electron Boilerplate project including `nodeIntegration` and `contextBridge` approach.

## Usage
Download given files, create a new folder and extract downloaded files into the folder. Copy folder address and go to the folder from your terminal. Download dependencies.

```sh
npm install
```

Start the project

```sh
npm start
```

edit files according to your need.

## How was it done?
First, I downloaded Electron Quick-Start files. Then activated `nodeIntegration` in `main.js` file as below.

```js
const win = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: true, // Here...
    preload: path.join(__dirname, 'preload.js')
  }
});
```

I called `contextBridge` library and added some example functions for `preload.js`.

```js
const {contextBridge} = require('electron');
const os = require('os');

contextBridge.exposeInMainWorld('NodeElectron', {
  myFunction: () => 'Hello world.',
  myParameter: function(txt) { return txt + ' world!'; },
  myLib: () => { return 'Home directory is ' + os.homedir(); }
});
```

Then I was able to use Node.js functions from `renderer.js`.

```js
console.log(NodeElectron.myFunction()); // Hello world.
console.log(NodeElectron.myParameter('Hello')); // Hello world!
console.log(NodeElectron.myLib()); // Home directory is C:\Users\Node
```

With this technique, I am able to create bi-directional bridge between Node.js and Window without turning off `contextIsolation`.
