// Remember, this runs on a DIFFERENT console and not the page its self. ITS A DIFFERENT WEBPAGE
document.addEventListener('DOMContentLoaded', ready);

let enabled = false;

function ready(){
  var mainSwitch = document.getElementById('mainSwitch');
  mainSwitch.addEventListener("change",onMainSwitch);

  chrome.storage.sync.get("enabled",onStorageGet);
}

function onMainSwitch(){
  var isOn = this.checked;

  chrome.storage.sync.set({"enabled":isOn},function(){
    console.log("Setting storage: " + isOn);
  });
}

function setSwitchState(){
  console.log("Setting switch state: "+ enabled);
  
  mainSwitch.checked = enabled;
}

function onStorageGet(value){
  enabled = value.enabled;

  setSwitchState();
  
  chrome.tabs.query({currentWindow:true,active:true},function(tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id,{"enabled":enabled});
  });
}