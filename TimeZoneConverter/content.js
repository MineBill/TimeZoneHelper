class TimeZone{
  constructor(name,utcOffset){
    this.name = name;
    this.utcOffset = utcOffset;
  }
}

class TimeZoneHelper{
  constructor(){
    this.zones = this.setup();
  }

  setup(){
    var zonesA = []; // Don't want to write this.zone for everything here.
    
    var { GMT, BST, WET, WEST, CET, CEST, EET, EEST, AST, ADT, EST, EDT, ET, CST, CDT, CT, MST, MDT, MT, PST, PDT, PT } = this.makeTimeZones();
    zonesA.push(GMT);zonesA.push(BST);zonesA.push(WET);zonesA.push(WEST);zonesA.push(CET);zonesA.push(CEST);zonesA.push(EET);
    zonesA.push(EEST);zonesA.push(AST);zonesA.push(ADT);zonesA.push(EST);zonesA.push(EDT);zonesA.push(ET);zonesA.push(CST);
    zonesA.push(CDT);zonesA.push(CT);zonesA.push(MST);zonesA.push(MDT);zonesA.push(MT);zonesA.push(PST);zonesA.push(PDT);
    zonesA.push(PT);
    return zonesA;
  }

  makeTimeZones() {
    var GMT = new TimeZone("GMT", 0);
    var BST = new TimeZone("BST", 1);
    var WET = new TimeZone("WET", 0);
    var WEST = new TimeZone("WEST", 1);
    var CET = new TimeZone("CET", 1);
    var CEST = new TimeZone("CEST", 2);
    var EET = new TimeZone("EET", 2);
    var EEST = new TimeZone("EEST", 3);
    var AST = new TimeZone("AST", -4);
    var ADT = new TimeZone("ADT", -3);
    var EST = new TimeZone("EST", -5);
    var EDT = new TimeZone("EDT", -4);
    var ET = new TimeZone("ET", EST.utcOffset);
    var CST = new TimeZone("CST", -6);
    var CDT = new TimeZone("CDT", -5);
    var CT = new TimeZone("CT", CST.utcOffset);
    var MST = new TimeZone("MST", -7);
    var MDT = new TimeZone("MDT", -6);
    var MT = new TimeZone("MT", MST.utcOffset);
    var PST = new TimeZone("PST", -8);
    var PDT = new TimeZone("PDT", -7);
    var PT = new TimeZone("PT", PST.utcOffset);
    return { GMT, BST, WET, WEST, CET, CEST, EET, EEST, AST, ADT, EST, EDT, ET, CST, CDT, CT, MST, MDT, MT, PST, PDT, PT };
  }

  getZoneByName(name){
    for(zone of this.zones){
      if(zone.name === name){
        return zone;
      }
    }
    return new TimeZone();
  }

  findZones(str){
    var foundZones = [];
    var pos = [];
    for (var i = 0; i < this.zones.length; i++) {
      var zone = this.zones[i]
      var n = searchZone(str,zone.name);
      if(n > 0){
        foundZones.push(zone);
        pos.push(n+1);
      }
    }

    return [foundZones,pos];
  }

  calculateZoneOffset(zone){
    var d = new Date();
    var orgHour = d.getHours();
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    d.setMinutes(d.getMinutes() + (zone.utcOffset * 60));
    return orgHour - d.getHours();
  }
}

let enabled = false;

chrome.storage.sync.get("enabled",onStorageGet);

// START
function onStorageGet(value){
  enabled = value.enabled;
  
  if(enabled)
    ready();
}

function ready() {

  var timeZone = new TimeZoneHelper();

  // Get all text nodes
  var nodeIterator = document.createNodeIterator(document.body,NodeFilter.SHOW_TEXT);

  // Push them to a new array if they are not empty
  var txtNodes = [];
  var currentNode;
  while (currentNode = nodeIterator.nextNode()) {
    if(!isBlank(currentNode.nodeValue) && !isEmpty(currentNode.nodeValue)){
      txtNodes.push(currentNode);
    }
  }

  // Loop and edit them
  for(node of txtNodes){
    if(node.parentNode.nodeName !== 'SCRIPT'){

      var zones = [];
      var pos = [];
      //var zone,n;
      [zones,pos] = timeZone.findZones(node.nodeValue);

      var newNodeValue = node.nodeValue;
      for (var i = 0; i < zones.length; i++) {
        var zone = zones[i];
        var n = pos[i];

        var offset = timeZone.calculateZoneOffset(zone);

        var offsetStr;
        if(offset > 0)
          offsetStr = `${zone.name} (+${offset} hours) `;
        else
          offsetStr = `${zone.name} (${offset} hours) `;

        newNodeValue = insert(newNodeValue,offsetStr,n,zone.name.length);
      }
      node.nodeValue = newNodeValue;
    }
  }
}

// Helper methods
function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function insert(mainStr,str,pos,n){
  return mainStr.slice(0,pos) + str + mainStr.slice(pos + n);
}

function searchZone(str,name){
  var n;
  n = str.indexOf(" "+name+" ");
  if(n < 0)
    n = str.indexOf(" "+name);

  if(n < 0)
    n = str.indexOf("("+name+")");

  if(n < 0)
    n = str.indexOf("["+name+"]");

  return n;
}
