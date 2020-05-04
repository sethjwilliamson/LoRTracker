const {ipcRenderer, remote} = require('electron');

ipcRenderer.on('start', (event, width, height) => {
    this.width = width;
    this.height = height;
    start();
});

ipcRenderer.on('update', (event, cardCode, isUnit) => {
    updateCard(cardCode);
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

var arr = require('./set1-en_us.json');
var cardArr = [];
var regionColors = {
    "Demacia": "#B9AC98",
    "Noxus": "#962D27",
    "Freljord": "#4A7DC3",
    "PiltoverZaun": "#B05925",
    "Ionia": "#C45987",
    "ShadowIsles": "#2A725D",
    "Bilgewater": "#FD9061"

};
var regionIcons = {
    "Demacia": "./icon-demacia.png",
    "Noxus": "./icon-noxus.png",
    "Freljord": "./icon-freljord.png",
    "PiltoverZaun": "./icon-piltover.png",
    "Ionia": "./icon-ionia.png",
    "ShadowIsles": "./icon-shadowisles.png",
    "Bilgewater": "./icon-bilgewater.png"
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

imgBot.src = './bottom4-extended.png';
imgSpell.src = './icon-spell2.png';
imgUnit.src = './icon-unit2.png';
imgDeck.src = './icon-deck.png';
imgHand.src = './icon-hand.png';

var cardsLeft;
var spellsLeft;
var unitsLeft;
var width;
var height;
var margin = 3;
var deckRegions;
var cardRegions;
var handSize;

function start() {
    console.log("Start");
    let obj = remote.getGlobal('decklist');
    console.log(obj);

    let keys = Object.keys(obj);
    cardsLeft = 0;
    spellsLeft = 0;
    unitsLeft = 0;
    console.log(keys);
    cardArr = [];
    deckRegions = [];
    cardRegions = [];

    for (let element of keys) {

        let card = arr.find(o => o.cardCode === element);

        for (i = 0; i < obj[element]; i++) {
            cardsLeft++;
            if (card.type === "Unit")
                unitsLeft++;
            else 
                spellsLeft++;

            if (!deckRegions.includes(card.regionRef)) {
                deckRegions.push(card.regionRef);
                cardRegions.push( {"region" : card.regionRef, "quantity" : 1})
            }
            else {
                cardRegions.find(o => o.region === card.regionRef).quantity++;
            }
        }

        imgCard = new Image;
        imgCard.src = "./cropped/" + card.cardCode + "-full.jpg";

        cardArr.push({
            "cardCode": card.cardCode,
            "mana": card.cost,
            "quantity": obj[element],
            "image": imgCard,
            "color": regionColors[card.regionRef],
            "name": card.name,
            "region": card.regionRef
        });
    }
    
    let cMain = document.getElementById("main");
    let ctxMain = cMain.getContext("2d");
    //ctxMainMain.scale(c.width / 230, c.height / 111);
    //ctxMain.clearRect(0, 0, cMain.width, cMain.height);

    switch (deckRegions.length) {
        case 1:
            imgMain.src = './single.png';

            imgRegion1.src = regionIcons[deckRegions[0]];

            imgRegion1.onload = function() {
                ctxMain.drawImage(imgMain, 0 , 0);
                ctxMain.drawImage(imgRegion1, 90, 20, 50, 50);
                updateTracker();
            }
            break;
        case 2:
            imgMain.src = './double3-cropped.png';

            imgRegion1.src = regionIcons[deckRegions[0]];

            imgRegion2.src = regionIcons[deckRegions[1]];
           // setTimeout(function() {httpGet(url).then(res => waitingForGame(res));}, 5000);

            setTimeout(function() {
                ctxMain.drawImage(imgMain, 0 , 0);
                ctxMain.drawImage(imgRegion1, 48, 20, 50, 50);
                ctxMain.drawImage(imgRegion2, 132, 20, 50, 50);
                updateTracker();
            }, 100);
            break;
        case 3:
            imgMain.src = './double3-cropped.png';

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

async function updateCard(cardCode) {
    await editCard(cardCode);
    updateTracker();
}

async function editCard(cardCode, isUnit) {
    card = cardArr.find(o => o.cardCode == cardCode);
    card.quantity--;
    
    cardRegions.find(o => o.region == card.region).quantity--;

    if (isUnit)
        unitsLeft--;
    else
        spellsLeft--;
    
    cardsLeft--;
}
    
function updateTracker() {
    let cRegion = document.getElementById("region%");
    let ctxRegion = cRegion.getContext("2d");

    ctxRegion.clearRect(0, 0, cRegion.width, cRegion.height);
    
    ctxRegion.textAlign = "center";
    ctxRegion.fillStyle = "white";
    
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

    let div = document.getElementById("cardContents");
    
    div.innerHTML = '';
    /// Individual Card Height
    /// Transparency

    cardArr.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 
    
    for (let element of cardArr) {
        cCard = document.createElement("canvas"); 
        cCard.width = width;
        cCard.height = (height - 84 - 200) / (cardArr.length) - margin;
        cCard.style.marginBottom = margin + "px";
        cCard.addEventListener('mouseenter', function() {previewCard(element.cardCode, this)});
        cCard.addEventListener('mouseleave', function() {unpreviewCard()})
        ctxCard = cCard.getContext("2d"); 
        div.appendChild(cCard);
        ctxCard.scale(cCard.width / 720, cCard.height / 100);

        
        let grd = ctxCard.createLinearGradient(0,0,500,0);
        let grd2 = ctxCard.createLinearGradient(0,0,450,0);
        let grd3 = ctxCard.createRadialGradient(50, 50, 5, 50, 50, 60);
        
        ctxCard.drawImage(element.image,50,0);
        
        grd.addColorStop(0,"black");
        grd.addColorStop(1,"transparent");
        
        ctxCard.fillStyle = grd;
        ctxCard.fillRect(50,0,600,100);
        
        grd2.addColorStop(0,"transparent");
        grd2.addColorStop(1,element.color);
        
        ctxCard.fillStyle = grd2;
        ctxCard.fillRect(50,0,600,10);
        ctxCard.fillRect(50,90,600,10);

        ctxCard.fillStyle = element.color;
        ctxCard.fillRect(610,0,10,1000);
        
        
        grd3.addColorStop(1, "#289DA1");
        grd3.addColorStop(0, "#1A2F64");
        grd3.addColorStop(.5, "#1A2F64");
        
        ctxCard.beginPath();
        ctxCard.arc(50, 50, 50, 0, 2 * Math.PI);
        ctxCard.fillStyle = grd3;
        ctxCard.fill();
        
        ctxCard.fillStyle = '#404040';
        roundRect(ctxCard, 620, 0, 100, 100, 15, true,false);
        ctxCard.fillRect(620, 0, 50, 100);
        
        ctxCard.font = "75px Beaufort for LOL Bold";
        ctxCard.fillStyle = "white";
        ctxCard.textAlign = "center";
        ctxCard.fillText(element.mana, 50, 76);
        ctxCard.fillText(element.quantity, 670, 76);
        
        ctxCard.textAlign = "left";
        ctxCard.font = "38px Beaufort for LOL Bold";
        ctxCard.fillText(element.name, 110, 63);
    }
  
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
    
    ctxBot.font = "24px Beaufort for LOL Bold";
    ctxBot.fillStyle = "white";
    ctxBot.textAlign = "center";

    ctxBot.fillText("1", 98.5, 24, 15);
    
    ctxBot.fillText("2", 98.5, 51, 15);
    
    ctxBot.fillText("3", 98.5, 78, 15);

    ctxBot.font = "14px Beaufort for LOL Bold";

    ctxBot.fillText((1 / cardsLeft * 100).toFixed(1) + "%", 132, 21, 30);
    ctxBot.fillText((2 / cardsLeft * 100).toFixed(1) + "%", 132, 48, 30);
    ctxBot.fillText((3 / cardsLeft * 100).toFixed(1) + "%", 132, 74, 30);

    ctxBot.drawImage(imgSpell, 18, 7, 15, 18);
    ctxBot.drawImage(imgUnit, 18, 34, 15, 18);

    ctxBot.fillText((spellsLeft / cardsLeft * 100).toFixed(1) + "%", 60, 21, 30); 
    ctxBot.fillText((unitsLeft / cardsLeft * 100).toFixed(1) + "%", 60, 48, 30); 

    ctxBot.drawImage(imgDeck, 157, 6, 25, 22);
    ctxBot.drawImage(imgHand, 159, 34, 23, 18);
    
    ctxBot.font = "16px Beaufort for LOL Bold";

    ctxBot.fillText(cardsLeft, 203, 21, 30);
    ctxBot.fillText(handSize, 203, 48, 30); 

}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".png", "x", element.getBoundingClientRect()['y']); // Send Quantity
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}