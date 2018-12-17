const ipcRenderer = require('electron').ipcRenderer;

function setNotificationCallback(callback) {

    const OldNotify = window.Notification;
    const newNotify = function(title, opt) {
        callback(title, opt);
        // return new OldNotify(title, opt);
    };
    newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify);
    Object.defineProperty(newNotify, 'permission', {
        get: function() {
            return OldNotify.permission;
        }
    });

    window.Notification = newNotify;
}

function notifyNotificationCreate(title, opt) {
  console.log('notification create');
  ipcRenderer.send('notification', title, opt);
}

// function notifyNotificationClick() {
//   console.log('notification clicked');
//   ipcRenderer.send('notification-click');
// }

setNotificationCallback(notifyNotificationCreate);

// Select the node that will be observed for mutations
window.onload = function() {
  var targetNode = document.getElementById('pageContents2');

  // Options for the observer (which mutations to observe)
  var config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  var callback = function(mutationsList, observer) {
      for(var mutation of mutationsList) {
        var sum = 0;
        var allCounts = document.getElementsByClassName('count');
        for(var i=0; i<allCounts.length; i++){
          sum += parseFloat(allCounts[i].innerHTML);
        }
        if(sum>0){
          ipcRenderer.send('unread-count',sum);
        }
      }
  };

  // Create an observer instance linked to the callback function
  var observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}

