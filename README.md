# Electron-Boilerplate
Simple Electron Boilerplate project including `nodeIntegration` and `contextBridge` approach.

## Usage
Download given files, create a new folder and extract downloaded files into the folder. Copy folder address and go to the folder from your terminal. Download dependencies.

```sh
npm install
```

Start the project.

```sh
npm start
```

Edit files according to your need.

## How was it done?
First, I downloaded Electron Quick-Start files. Then activated `nodeIntegration` in `main.js` file as below.

```js
const mainWindow = new BrowserWindow({
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

## IPC Channel: Renderer to main (two-way)

Electron has some restrictions for returning value from Node.js because of security reasons. This can be achieved by using `ipcRenderer.invoke` with `ipcMain.handle`. A simple `fs.readFile` example shown below. This way is the most common and Electron suggested way to do it.

Create your function in `main.js` file.

```js
const fs = require('fs/promises');

async function nodeTest() {
  const data = await fs.readFile('./package.json', { encoding: 'utf8' });
  console.log(data);
  return data;
}
```

Then add `nodeTest` function into `preload.js`. For `invoke` give a random name for channel. Here I called it `my:nodeTest`.

```js
contextBridge.exposeInMainWorld('NodeElectron', {
  myFunction: () => 'Hello world.',
  myParameter: function(txt) { return txt + ' world!'; },
  myLib: () => { return 'Home directory is ' + os.homedir(); },
  nodeTest: () => ipcRenderer.invoke('my:nodeTest') // Here
});
```

Add a simple button to `index.html`

```html
<button type="button" id="btn">nodeTest</button>
```

Call our `nodeTest` function by click add below code to `renderer.js`.

```js
// Get button element
const btn = document.getElementById('btn');

// Listen for click event
btn.addEventListener('click', async () => {
  // Call our 'nodeTest' method which we defined in 'preload.js'
  const result = await window.NodeElectron.nodeTest();
  // Show Node.js result in console
  console.log(result);
});
```

Then our last step is to add `handle` function in to the `main.js` file.

```js
app.whenReady().then(() => {
  createWindow();
  
  // Custom IPC functions
  ipcMain.handle('my:nodeTest', nodeTest);

});
```




