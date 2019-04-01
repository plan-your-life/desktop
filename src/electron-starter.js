const electron = require('electron');
const machineId = require('node-machine-id').machineId;
const fs = require('fs');
// Module to control application life.
const app = electron.app;
const {Menu} = require('electron');
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const { ipcMain } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    //Delete the Menubar, because we dont need it
    Menu.setApplicationMenu(null);
    //get primary display and define a variable which contains height and width
    const mainScreen = electron.screen.getPrimaryDisplay();
    const dimensions = mainScreen.size;
    // Create the browser window.
    mainWindow = new BrowserWindow({width: Math.ceil(dimensions.width * 0.8), height: Math.ceil(dimensions.height * 0.8)});

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        });
    mainWindow.loadURL(startUrl);
    //Block dev tools
    //mainWindow.webContents.closeDevTools();
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
//Method for getting the token and creating a machineide
async function getToken(){
    //get the token
    let token = new Promise((resolve,reject) => {
        fs.readFile('./src/settings/keys.json','utf8', (err,tokens) => {
            let json;
            if(err) reject(err);
            else {
                //Try to parse that file
                try {
                    json = JSON.parse(tokens);
                    resolve(json);
                }
                //If not, just resolve the promise
                catch (e) {
                    resolve();
                }
            }

        });
    });

    return await token;
}

//Get the token plus the hardwarekey
ipcMain.on('getToken', (event,arg) => {
    getToken().then(data => {
        event.sender.send('getToken', data);
    }).catch(e => {
        event.sender.send('getToken', null);
    })
});


ipcMain.on('saveToken', (event,arg) => {
    let json = JSON.stringify(arg);
    fs.writeFile('./src/settings/keys.json', json, 'utf8', err => {
        event.sender.send('saveToken', true);
    });
});