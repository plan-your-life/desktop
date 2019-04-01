const {ipcRenderer} = require = window.require('electron');
//function to communicate with the main process
export default async function communicate(listener, items){
    ipcRenderer.send(listener, items);
    //Look get the message
    let prom = new Promise((resolve,reject) => {
        ipcRenderer.on(listener, (event,arg) => {
            resolve(arg);
        }) ;
    });
    return await prom;
}