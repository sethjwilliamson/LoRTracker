const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');
const Store = require('electron-store');
const config = new Store();
const log = require("electron-log");
log.catchErrors();
log.log("Tracker Started.")

var cardsLeft;
var spellsLeft;
var unitsLeft;

ipcRenderer.on('start', (event, width, height, cardsLeft, spellsLeft, unitsLeft) => {
    this.cardsLeft = cardsLeft;
    this.spellsLeft = spellsLeft;
    this.unitsLeft = unitsLeft;

    this.width = width;
    this.height = height;
    start();
});

ipcRenderer.on('update', (event, cardCode, isUnit) => {
    updateCard(cardCode, isUnit, -1);
});

ipcRenderer.on('handUpdate', (event, handSize) => {
    this.handSize = handSize;
    updateTracker();
});

ipcRenderer.on('resize', (event, width, height) => {
    this.width = width;
    this.height = height;
    updateTracker();
})

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}


$(".font-loader").each(function() {
    this.remove();
})

function minimize() {
  if (document.getElementById("cardContents").style.display == "none") {
    document.getElementById("cardContents").style.display = "grid";
  }
  else {
    document.getElementById("cardContents").style.display = "none";
  }
  updateTracker();
}

document.getElementById("top-container").style.opacity = config.get("tracker-opacity");
document.getElementById("cardContents").style.opacity = config.get("card-opacity");
document.getElementById("botStats").style.opacity = config.get("tracker-opacity");

var cMain = document.getElementById("main");
var ctxMain = cMain.getContext("2d");
ctxMain.scale(cMain.width/230,cMain.height/96); 
var imgStart = new Image;
imgStart.src = './images/double3-cropped.png';

imgStart.onload = function () {
  ctxMain.drawImage(imgStart, 0 ,0);
};

cBot = document.getElementById("botStats");
ctxBot = cBot.getContext("2d");

ctxBot.scale(cBot.width/230,cBot.height/120);

var imgBot = new Image;
imgBot.src = './images/bottom4-extended.png';

imgBot.onload = function() {
  ctxBot.drawImage(imgBot, 0 ,0);
}

cBack = document.getElementById("brown");
ctxBack = cBack.getContext("2d");

ctxBack.scale(cBack.width/230,cBack.height/40);

var imgBrown = new Image;
imgBrown.src = './images/brown.png';
imgBrown.onload = function() {
  ctxBack.drawImage(imgBrown, 0, 0);
}

var regionIcons = {
    "Demacia": "icons/icon-demacia.png",
    "Noxus": "icons/icon-noxus.png",
    "Freljord": "icons/icon-freljord.png",
    "PiltoverZaun": "icons/icon-piltover.png",
    "Ionia": "icons/icon-ionia.png",
    "ShadowIsles": "icons/icon-shadowisles.png",
    "Bilgewater": "icons/icon-bilgewater.png"
};
var imgMain = new Image;
var imgBot = new Image;
var imgRegion1 = new Image;
var imgRegion2 = new Image;
var imgRegion3 = new Image;
var imgSpell = new Image;
var imgUnit = new Image;
var imgDeck = new Image;
var imgHand = new Image;
var imgCard;

imgBot.src = './images/bottom4-extended.png';
imgSpell.src = 'icons/icon-spell2.png';
imgUnit.src = 'icons/icon-unit2.png';
imgDeck.src = 'icons/icon-deck.png';
imgHand.src = 'icons/icon-hand.png';


var width;
var height;
var margin = 3;
var deckRegions;
var cardRegions;
var handSize;

function start() {
    console.log("Start");

    cardArr = remote.getGlobal("cardArr");
    deckRegions = remote.getGlobal("deckRegions");
    cardRegions = remote.getGlobal("cardRegions");

    
    
    let cMain = document.getElementById("main");
    let ctxMain = cMain.getContext("2d");

    switch (deckRegions.length) {
        case 1:
            imgMain.src = './images/single.png';

            imgRegion1.src = regionIcons[deckRegions[0]];

            imgRegion1.onload = function() {
                ctxMain.drawImage(imgMain, 0 , 0);
                ctxMain.drawImage(imgRegion1, 90, 20, 50, 50);
                updateTracker();
            }
            break;
        case 2:
            imgMain.src = './images/double3-cropped.png';

            imgRegion1.src = regionIcons[deckRegions[0]];

            imgRegion2.src = regionIcons[deckRegions[1]];

            setTimeout(function() {
                ctxMain.drawImage(imgMain, 0 , 0);
                ctxMain.drawImage(imgRegion1, 48, 20, 50, 50);
                ctxMain.drawImage(imgRegion2, 132, 20, 50, 50);
                updateTracker();
            }, 100);
            break;
        case 3:
            imgMain.src = './images/double3-cropped.png';

            imgRegion1.src = regionIcons[deckRegions[0]];

            imgRegion2.src = regionIcons[deckRegions[1]];

            let imgMiddle = new Image;

            imgMiddle.src = './middle.png';

            imgRegion3.src = regionIcons[deckRegions[2]];

            imgRegion3.onload = function() {
                ctxMain.drawImage(imgMain, 0 ,0);
                ctxMain.drawImage(imgRegion1, 48, 20, 50, 50);
                ctxMain.drawImage(imgRegion2, 132, 20, 50, 50);
                ctxMain.drawImage(imgMiddle, 0, 0);
                ctxMain.drawImage(imgRegion3, 90, 20, 50, 50);
                updateTracker();
            }
            break;
        default:
            console.log("Broken ?");
            setTimeout(start(), 100);
    }
}

async function updateCard(cardCode, isUnit, change) {
    await editCard(cardCode, isUnit, change);
    updateTracker();
}

async function editCard(cardCode, isUnit, change) {
    if (cardArr.find(o => o.cardCode == cardCode)) {
        card = cardArr.find(o => o.cardCode == cardCode);
        card.quantity += change;
        
        cardRegions.find(o => o.region == card.region).quantity += change;

        if (isUnit)
            unitsLeft += change;
        else
            spellsLeft += change;
        
        cardsLeft += change;
    }
}
    
function updateTracker() {
    cardArr = remote.getGlobal("cardArr");
    deckRegions = remote.getGlobal("deckRegions");
    cardRegions = remote.getGlobal("cardRegions");
    
    console.log(cardArr)


    let cRegion = document.getElementById("regionP");
    let ctxRegion = cRegion.getContext("2d");

    ctxRegion.clearRect(0, 0, cRegion.width, cRegion.height);
    
    ctxRegion.textAlign = "center";
    ctxRegion.fillStyle = "white";
    
    ctxRegion.font = "12px BeaufortforLOL-Bold";
    
    if (cardArr.length > 0) {
        switch (deckRegions.length) {
            case 1:
                ctxRegion.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[0]).quantity / cardsLeft * 100) + "%", 86, 15);
                break;
            case 2:
                ctxRegion.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[0]).quantity / cardsLeft * 100) + "%", 55, 15)
                ctxRegion.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[1]).quantity / cardsLeft * 100) + "%", 118, 15);
                break;
            case 3:
                ctxRegion.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[0]).quantity / cardsLeft * 100) + "%", 55, 15);
                ctxRegion.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[1]).quantity / cardsLeft * 100) + "%", 118, 15);
                ctxRegion.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[2]).quantity / cardsLeft * 100) + "%", 86, 15);
                break;
        }
    }
    else {
        ctxRegion.fillText("", 55, 15);
        ctxRegion.fillText("", 118, 15);
    }

    cardArr.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 

    for (let element of cardArr) {
        imgCard = new Image;
        imgCard.src = "./cropped/" + element.cardCode + "-full.webp";
        element.image = imgCard;
    }

    imgCard.onload = function() {
        createCanvas.render(cardArr, $("#cardContents"));
    }
    
    createCanvas.render(cardArr, $("#cardContents"));
  
    cBot = document.getElementById("botStats");
    ctxBot = cBot.getContext("2d");

    cBot.style.marginTop = 0;

    ctxBot.clearRect(0,0, 300, 300);

    ctxBot.drawImage(imgBot, 0 ,0);

    ctxBot.fillStyle = '#D6D6B1';
    roundRect(ctxBot, 82, 4, 66, 24, 3, true,false);

    ctxBot.fillStyle = '#404040';
    roundRect(ctxBot, 83, 5, 64, 22, 3, true,false);

    ctxBot.fillStyle = '#D6D6B1';
    roundRect(ctxBot, 82, 31, 66, 24, 3, true,false);

    ctxBot.fillStyle = '#404040';
    roundRect(ctxBot, 83, 32, 64, 22, 3, true,false);
    
    ctxBot.fillStyle = '#D6D6B1';
    roundRect(ctxBot, 82, 58, 66, 24, 3, true,false);

    ctxBot.fillStyle = '#404040';
    roundRect(ctxBot, 83, 59, 64, 22, 3, true,false);

    ctxBot.fillStyle = '#D6D6B1';
    ctxBot.fillRect(114, 5, 1, 22);
    
    ctxBot.fillStyle = '#D6D6B1';
    ctxBot.fillRect(114, 32, 1, 22);
    
    ctxBot.fillStyle = '#D6D6B1';
    ctxBot.fillRect(114, 59, 1, 22);


    ctxBot.fillStyle = '#D6D6B1';
    roundRect(ctxBot, 10, 4, 66, 24, 3, true,false);

    ctxBot.fillStyle = '#404040';
    roundRect(ctxBot, 11, 5, 64, 22, 3, true,false);

    ctxBot.fillStyle = '#D6D6B1';
    roundRect(ctxBot, 10, 31, 66, 24, 3, true,false);

    ctxBot.fillStyle = '#404040';
    roundRect(ctxBot, 11, 32, 64, 22, 3, true,false);

    ctxBot.fillStyle = '#D6D6B1';
    ctxBot.fillRect(42, 5, 1, 22);
    
    ctxBot.fillStyle = '#D6D6B1';
    ctxBot.fillRect(42, 32, 1, 22);

    
    ctxBot.fillStyle = '#D6D6B1';
    roundRect(ctxBot, 154, 4, 66, 24, 3, true,false);

    ctxBot.fillStyle = '#404040';
    roundRect(ctxBot, 155, 5, 64, 22, 3, true,false);

    ctxBot.fillStyle = '#D6D6B1';
    roundRect(ctxBot, 154, 31, 66, 24, 3, true,false);

    ctxBot.fillStyle = '#404040';
    roundRect(ctxBot, 155, 32, 64, 22, 3, true,false);

    ctxBot.fillStyle = '#D6D6B1';
    ctxBot.fillRect(186, 5, 1, 22);
    
    ctxBot.fillStyle = '#D6D6B1';
    ctxBot.fillRect(186, 32, 1, 22);
    
    ctxBot.font = "24px BeaufortforLOL-Bold";
    ctxBot.fillStyle = "white";
    ctxBot.textAlign = "center";

    ctxBot.fillText("1", 98.5, 24, 15);
    
    ctxBot.fillText("2", 98.5, 51, 15);
    
    ctxBot.fillText("3", 98.5, 78, 15);

    ctxBot.font = "14px BeaufortforLOL-Bold";

    ctxBot.fillText((1 / cardsLeft * 100).toFixed(1) + "%", 132, 21, 30);
    ctxBot.fillText((2 / cardsLeft * 100).toFixed(1) + "%", 132, 48, 30);
    ctxBot.fillText((3 / cardsLeft * 100).toFixed(1) + "%", 132, 74, 30);

    ctxBot.drawImage(imgSpell, 18, 7, 15, 18);
    ctxBot.drawImage(imgUnit, 18, 34, 15, 18);

    ctxBot.fillText((spellsLeft / cardsLeft * 100).toFixed(1) + "%", 60, 21, 30); 
    ctxBot.fillText((unitsLeft / cardsLeft * 100).toFixed(1) + "%", 60, 48, 30); 

    ctxBot.drawImage(imgDeck, 157, 6, 25, 22);
    ctxBot.drawImage(imgHand, 159, 34, 23, 18);
    
    ctxBot.font = "16px BeaufortforLOL-Bold";

    ctxBot.fillText(cardsLeft, 203, 21, 30);
    ctxBot.fillText(handSize, 203, 48, 30); 

    
    setTimeout(ipcRenderer.send('size', $("body").height(), "tracker"), 100); 
}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".webp", "x", parseInt(element.getBoundingClientRect()['y']), "tracker"); 
    /// Send Quantity
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}