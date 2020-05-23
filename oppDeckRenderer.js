const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');

ipcRenderer.on('update', (event, test) => {
    console.log("ipc");
    updateOppDeck();
});


ipcRenderer.on('resize', (event, width, height) => {
    this.width = width;
    this.height = height;
    updateTracker();
});

var cardArr = [];

var imgCard;

var width;
var height;
var margin = 3;

function updateOppDeck() {
    cardArr = remote.getGlobal('oppDeckArr');

    console.log(cardArr);

    for (let element of cardArr) {
        imgCard = new Image;
        imgCard.src = "./cropped/" + element.cardCode + "-full.jpg";
        element.image = imgCard;
    }

    console.log(cardArr);

    updateTracker();
}
    
function updateTracker() {
    console.log("TEST");
    /// Individual Card Height
    /// Transparency

    cardArr.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 

    createCanvas.render(cardArr);
}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".png", "x", parseInt(element.getBoundingClientRect()['y']), "oppDeck"); 
    /// Send Quantity
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}