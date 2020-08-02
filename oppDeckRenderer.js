const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');
const Store = require('electron-store');
const config = new Store();
const log = require("electron-log");
log.catchErrors();

ipcRenderer.on('update', (event, test) => {
    updateOppDeck();
});


ipcRenderer.on('resize', (event, width, height) => {
    this.width = width;
    this.height = height;
    updateTracker();
});

$(".font-loader").each(function() {
    this.remove();
})

function minimize() {
  if (document.getElementById("cardContents").style.display == "none") {
    document.getElementById("cardContents").style.display = "block";

    
    ipcRenderer.send('size', config.get("opponent-deck-height"), "oppDeck"); 
  }
  else {
    document.getElementById("cardContents").style.display = "none";
    
    ipcRenderer.send('size', $("#top").height(), "oppDeck"); 
  }
  updateTracker();
}

document.getElementById("top-container").style.opacity = config.get("opponent-deck-opacity");
document.getElementById("cardContents").style.opacity = config.get("card-opacity");

var cTop = document.getElementById("top");
var ctxTop = cTop.getContext("2d");
ctxTop.scale(cTop.width/226,cTop.height/40); 

var imgStart = new Image;
imgStart.src = './images/top-window.png';

imgStart.onload = function () {
  ctxTop.drawImage(imgStart, 0 ,0);

  ctxTop.textAlign = "center";
  ctxTop.fillStyle = "white";
  
  ctxTop.font = "16px BeaufortforLOL-Bold";
  
  ctxTop.fillText("OPPONENT", imgStart.width / 2, imgStart.height / 2 + 5);
};

var cardArr = [];

var imgCard;

var width;
var height;
var margin = 3;

function updateOppDeck() {
    cardArr = remote.getGlobal('oppDeckArr');

    updateTracker();
}
    
function updateTracker() {
    cardArr.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 
    
    createCanvas.render($("#cardContents"), cardArr);
}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".webp", "x", parseInt(element.getBoundingClientRect()['y']), "oppDeck"); 
    /// Send Quantity
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}