const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const path = require('path');
const session = require('electron').remote.session;


// var oldXHR = window.XMLHttpRequest;
// function newXHR() {
//   var realXHR = new oldXHR();
//   realXHR.addEventListener("readystatechange", function() {
//     if(realXHR.readyState==1){
//       console.log('server connection established');
//     }
//     if(realXHR.readyState==2){
//       console.log('request received');
//     }
//     if(realXHR.readyState==3){
//       console.log('processing request');
//     }
//     if(realXHR.readyState==4){
//       console.log('request finished and response is ready');
//       console.log('Count nodes: ' + document.querySelectorAll('.convList .conv .avatarWrapper .count').length.toString());
//       console.log('Unread: ' + getUnreadMsgCount());
//     }
//   }, false);
//   return realXHR;
// }
// window.XMLHttpRequest = newXHR;

/* ================================================
FUNCTION TO GET THE NUMBER OF UNREAD MESSAGES
 */
function getUnreadMsgCount(){
  let sum = 0;
  let allCounts = document.querySelectorAll('.convList .conv .avatarWrapper .count');
  for (let i = 0; i < allCounts.length; i++) {
    if(allCounts[i].classList.contains('hide')) {
      console.log('element hidden...not counting');
    } else {
      console.log('adding ' + allCounts[i].innerHTML);
      sum += parseFloat(allCounts[i].innerHTML);
    }
  }
  return sum;
}

/* =================================================
CAPTURE DEFAULT ELECTRON NOTIFICATION AND USE OUR OWN
 */
function setNotificationCallback(callback) {
  const OldNotify = window.Notification;
  const newNotify = function (title, opt) {
    callback(title, opt);
    // return new OldNotify(title, opt);
  };
  newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify);
  Object.defineProperty(newNotify, 'permission', {
    get: function () {
      return OldNotify.permission;
    }
  });
  window.Notification = newNotify;
}

/* =================================================
SEND NOTIFICATION TO MAIN
 */
function notifyNotificationCreate(title, opt) {
  ipcRenderer.send('notification', title, opt);
}

/* =================================================
FUNCTION THAT GENERATES MUTATION OBSERVER
 */
function initMutationObserver(){
  console.log('init mutation observer');
  // get target node to observe
  let targetNode = document.getElementById('vma-convListContainer');
  // Options for the observer (which mutations to observe)
  let config = {attributes: true, childList: true, subtree: true};
  // Callback function to execute when mutations are observed
  let callback = function (mutationsList, observer) {
    // check each mutation
    for (let mutation of mutationsList) {
      // if the mutation is a count, update unread count. only need one mutation to trigger
      if (mutation.target.className === "count") {
        console.log('mutation event');
        ipcRenderer.send('unread-count', getUnreadMsgCount());
        break;
      }
    }
  };
  // Create an observer instance linked to the callback function
  let observer = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}

setNotificationCallback(notifyNotificationCreate);

document.addEventListener('readystatechange', event => {
  console.log(event.target.readyState);
  if(event.target.readyState==='interactive'){
    let imported = document.createElement('script');
    imported.type = 'text/javascript';
    imported.async = false;
    imported.innerHTML = fs.readFileSync(path.join(__dirname, 'passive.js'),'utf8');
    document.head.appendChild(imported);

    // let debug = document.createElement('script');
    // debug.type='text/javascript';
    // debug.async=false;
    // debug.innerHTML = "VMADebug.enabled=true;";
    // document.head.appendChild(debug);
  }
});

// Select the node that will be observed for mutations
window.onload = function () {

  window.$ = window.jQuery = require('./lib/jquery.min.js');
  initMutationObserver();
  const filter = {
    urls: ['https://web.vma.vzw.com/im/Poll*']
  };
  session.defaultSession.webRequest.onCompleted(filter, (details) => {
    ipcRenderer.send('unread-count', getUnreadMsgCount());
  });
};
