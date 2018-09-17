console.log('active');

chrome.browserAction.onClicked.addListener(tabOpened);

function tabOpened(){
  console.log('Tab Clicked');
}