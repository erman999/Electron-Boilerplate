const {contextBridge, ipcRenderer } = require('electron');
const os = require('os');


contextBridge.exposeInMainWorld('NodeElectron', {
  myFunction: () => 'Hello world.',
  myParameter: function(txt) { return txt + ' world!'; },
  myLib: () => { return 'Home directory is ' + os.homedir(); },
  nodeTest: () => ipcRenderer.invoke('my:nodeTest')
});
