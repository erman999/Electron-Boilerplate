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

I use `console.log` quite often so let's activate it.

```js
// main.js
function createWindow () {
  // Some other codes
  
  // Open the DevTools.
  mainWindow.webContents.openDevTools(); // Add this line
}
```

```js
// main.js
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
// preload.js
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
// renderer.js
console.log(NodeElectron.myFunction()); // Hello world.
console.log(NodeElectron.myParameter('Hello')); // Hello world!
console.log(NodeElectron.myLib()); // Home directory is C:\Users\Node
```

With this technique, I am able to create bi-directional bridge between Node.js and Window without turning off `contextIsolation`.

## IPC Channel: Renderer to main (two-way)

Electron has some restrictions for returning value from Node.js because of security reasons. This can be achieved by using `ipcRenderer.invoke` with `ipcMain.handle`. A simple `fs.readFile` example shown below. This way is the most common and Electron suggested way to do it.

Create your function in `main.js` file.

```js
// main.js
const fs = require('fs/promises');

async function nodeTest() {
  const data = await fs.readFile('./package.json', { encoding: 'utf8' });
  console.log(data);
  return data;
}
```

Then add `nodeTest` function into `preload.js`. For `invoke` give a random name for channel. Here I called it `my:nodeTest`.

```js
// preload.js
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
// renderer.js

const btn = document.getElementById('btn');

// Listen for click event
btn.addEventListener('click', async () => {
  // Call our 'nodeTest' method which we defined in 'preload.js'
  const result = await window.NodeElectron.nodeTest();
  // Show Node.js result in console
  console.log(result);
});
```

Then our last step is to add `handle` function in to `whenReady()` function where in `main.js` file.

```js
app.whenReady().then(() => {
  createWindow();
  
  // Custom IPC functions
  ipcMain.handle('my:nodeTest', nodeTest);

});
```

Start your application and click the `nodeTest` button. You will see result of `package.json` file in the application console.

## MySQL Connection (Extra)

So far so good. Let's implement MySQL connection to our application. `mysql2` is very good for SQL connection.

```sh
npm install --save mysql2
```

There are plenty of examples that shows connecting database via `createConnection` method but I do not like to create connection to database all the time. The best way is to create a connection pool then use same connection for further requests.

Now, we need to call `mysql2` library and create connection pool.

```js
// main.js
const mysql = require('mysql2');
const pool  = mysql.createPool({host:'localhost', user: 'root', password: 'test', database: 'test'});
const promisePool = pool.promise();
```

Define a simple SQL query function.

```js
// main.js
async function sqlTest() {
  const [rows, fields] = await promisePool.query("SELECT 1");
  console.log(rows);
  return rows;
}
```

Then add our `ipcMain.handle` again to test connection by button click.

```js
app.whenReady().then(() => {
  createWindow()
  
  // Custom IPC functions
  ipcMain.handle('my:nodeTest', nodeTest);
  ipcMain.handle('my:sqlTest', sqlTest); // Add this line
})
```

Now, register our function for `contextBridge`

```js
// preload.js
contextBridge.exposeInMainWorld('NodeElectron', {
  myFunction: () => 'Hello world.',
  myParameter: function(txt) { return txt + ' world!'; },
  myLib: () => { return 'Home directory is ' + os.homedir(); },
  nodeTest: () => ipcRenderer.invoke('my:nodeTest'),
  sqlTest: () => ipcRenderer.invoke('my:sqlTest') // Add this line
});
```

Create `sqlTest` button in `index.html`

```html
<button type="button" id="btn2">sqlTest</button>
```

And finally, add listener for button click.

```js
// renderer.js
btn2.addEventListener('click', async () => {
  const result = await window.NodeElectron.sqlTest();
  console.log(result);
});
```

If SQL connection configs are correct, you will see SQL result in the console when clicking `sqlTest` button.

