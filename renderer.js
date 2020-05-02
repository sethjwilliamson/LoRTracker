
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const {ipcRenderer, remote} = require('electron');

ipcRenderer.on('start', (event, width1, height1) => {
    width = width1;
    height = height1;
    start();
});

ipcRenderer.on('update', (event, cardCode, isUnit) => {
    updateCard(cardCode);
});

ipcRenderer.on('handUpdate', (event, handSize) => {
    console.log(handSize);
    this.handSize = handSize;
    updateTracker();
});

ipcRenderer.on('resize', (event, width1, height1) => {
    /// Hide Browser
    width = width1;
    height = height1;
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
var img;
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
    obj = remote.getGlobal('decklist');

    var keys = Object.keys(obj);
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

        img = new Image;
        img.src = "./cropped/" + card.cardCode + "-full.jpg";

        cardArr.push({
            "cardCode": card.cardCode,
            "mana": card.cost,
            "quantity": obj[element],
            "image": img,
            "color": regionColors[card.regionRef],
            "name": card.name,
            "region": card.regionRef
        });
    }
    
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    //ctx.scale(c.width / 230, c.height / 111);
    ctx.clearRect(0, 0, c.width+300, c.height+300);

    switch (deckRegions.length) {
        case 1:
            img = new Image;
            img.src = './single.png';

            var img2 = new Image;
            img2.src = regionIcons[deckRegions[0]];

            img2.onload = function() {
                ctx.drawImage(img, 0 , 0);
                ctx.drawImage(img2, 90, 20, 50, 50);
                updateTracker();
            }
            break;
        case 2:
            img = new Image;
            img.src = './double3-cropped.png';

            var img2 = new Image;
            img2.src = regionIcons[deckRegions[0]];

            var img3 = new Image;
            img3.src = regionIcons[deckRegions[1]];

            img2.onload = function() {
                ctx.drawImage(img, 0 , 0);
                ctx.drawImage(img2, 48, 20, 50, 50);
                ctx.drawImage(img3, 132, 20, 50, 50);
                updateTracker();
            }
            break;
        case 3:
            img = new Image;
            img.src = './double3-cropped.png';

            var img2 = new Image;
            img2.src = regionIcons[deckRegions[0]];

            var img3 = new Image;
            img3.src = regionIcons[deckRegions[1]];

            var img4 = new Image;
            img4.src = './middle.png';

            var img5 = new Image;
            img5.src = regionIcons[deckRegions[2]];

            img5.onload = function() {
                ctx.drawImage(img, 0 ,0);
                ctx.drawImage(img2, 48, 20, 50, 50);
                ctx.drawImage(img3, 132, 20, 50, 50);
                ctx.drawImage(img4, 0, 0);
                ctx.drawImage(img5, 90, 20, 50, 50);
                updateTracker();
            }
            break;
        default:
            console.log("Broke ?");
    }
}

async function updateCard(cardCode) {
    await editCard(cardCode);
    updateTracker();
}

async function editCard(cardCode, isUnit) {
    card = cardArr.find(o => o.cardCode == cardCode);
    card.quantity--;
    console.log(card);
    cardRegions.find(o => o.region == card.region).quantity--;

    if (isUnit)
        unitsLeft--;
    else
        spellsLeft--;
    
    cardsLeft--;
}
    
function updateTracker() {
    console.log("Update")

    var c = document.getElementById("region%");
    var ctx = c.getContext("2d");

    ctx.clearRect(0, 0, c.width, c.height);
    
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    
    if (cardArr.length > 0) {
        switch (deckRegions.length) {
            case 1:
                ctx.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[0]).quantity / cardsLeft * 100) + "%", 86, 15);
                break;
            case 2:
                console.log(cardRegions.find(o => o.region == deckRegions[0]).quantity);
                console.log(cardRegions.find(o => o.region == deckRegions[1]).quantity);
                console.log(cardsLeft);

                ctx.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[0]).quantity / cardsLeft * 100) + "%", 55, 15)
                ctx.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[1]).quantity / cardsLeft * 100) + "%", 118, 15);
                break;
            case 3:
                ctx.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[0]).quantity / cardsLeft * 100) + "%", 55, 15);
                ctx.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[1]).quantity / cardsLeft * 100) + "%", 118, 15);
                ctx.fillText(Math.round(cardRegions.find(o => o.region == deckRegions[2]).quantity / cardsLeft * 100) + "%", 86, 15);
                break;
        }
    }
    else {
        ctx.fillText("", 55, 15);
        ctx.fillText("", 118, 15);
    }

    var div = document.getElementById("cardContents");
    
    div.innerHTML = '';
    /// Individual Card Height
    /// Transparency

    cardArr.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 
    console.log(cardArr);
    for (let element of cardArr) {
        c = document.createElement("canvas"); //
        c.width = width;
        c.height = (height - 84 - 200) / (cardArr.length) - margin;
        c.style.marginBottom = margin + "px";
        c.addEventListener('mouseenter', function() {previewCard(element.cardCode, this)});
        c.addEventListener('mouseleave', function() {unpreviewCard()})
        ctx = c.getContext("2d"); //
        div.appendChild(c);
        ctx.scale(c.width / 720, c.height / 100);
        
        ctx.drawImage(element.image,50,0);
        // Create gradient
        var grd = ctx.createLinearGradient(0,0,500,0);
        grd.addColorStop(0,"black");
        grd.addColorStop(1,"transparent");
        // Fill with gradient
        ctx.fillStyle = grd;
        ctx.fillRect(50,0,600,100);
        
        var grd2 = ctx.createLinearGradient(0,0,450,0);
        grd2.addColorStop(0,"transparent");
        grd2.addColorStop(1,element.color);
        // Fill with gradient
        ctx.fillStyle = grd2;
        ctx.fillRect(50,0,600,10);
        ctx.fillRect(50,90,600,10);

        ctx.fillStyle = element.color;
        ctx.fillRect(610,0,10,1000);
        
        var grd3 = ctx.createRadialGradient(50, 50, 5, 50, 50, 60);
        grd3.addColorStop(1, "#289DA1");
        grd3.addColorStop(0, "#1A2F64");
        grd3.addColorStop(.5, "#1A2F64");
        
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, 2 * Math.PI);
        ctx.fillStyle = grd3;
        //ctx.fillStyle = "#1A2F64";
        ctx.fill();
        
        ctx.fillStyle = '#404040';
        roundRect(ctx, 620, 0, 100, 100, 15, true,false);
        ctx.fillRect(620, 0, 50, 100);
        
        ctx.font = "75px Beaufort for LOL Bold";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(element.mana, 50, 76);
        ctx.fillText(element.quantity, 670, 76);
        
        ctx.textAlign = "left";
        ctx.font = "38px Beaufort for LOL Bold";
        ctx.fillText(element.name, 110, 63);
    }

    img.src = './bottom4-extended.png';
    var img6 = new Image;
    img6.src = './icon-spell2.png';
    var img7 = new Image;
    img7.src = './icon-unit2.png';
    var img8 = new Image;
    img8.src = './icon-deck.png';
    var img9 = new Image;
    img9.src = './icon-hand.png';

  
    img9.onload = function() {
        c = document.getElementById("botStats");
        ctx = c.getContext("2d");

        c.style.marginTop = 0;

        ctx.clearRect(0,0, 300, 300);

        ctx.drawImage(img, 0 ,0);

        ctx.fillStyle = '#D6D6B1';
        roundRect(ctx, 82, 4, 66, 24, 3, true,false);

        ctx.fillStyle = '#404040';
        roundRect(ctx, 83, 5, 64, 22, 3, true,false);

        ctx.fillStyle = '#D6D6B1';
        roundRect(ctx, 82, 31, 66, 24, 3, true,false);

        ctx.fillStyle = '#404040';
        roundRect(ctx, 83, 32, 64, 22, 3, true,false);
        
        ctx.fillStyle = '#D6D6B1';
        roundRect(ctx, 82, 58, 66, 24, 3, true,false);

        ctx.fillStyle = '#404040';
        roundRect(ctx, 83, 59, 64, 22, 3, true,false);
        //ctx.fillRect(20, 20, 10, 20);

        ctx.fillStyle = '#D6D6B1';
        ctx.fillRect(114, 5, 1, 22);
        
        ctx.fillStyle = '#D6D6B1';
        ctx.fillRect(114, 32, 1, 22);
        
        ctx.fillStyle = '#D6D6B1';
        ctx.fillRect(114, 59, 1, 22);


        ctx.fillStyle = '#D6D6B1';
        roundRect(ctx, 10, 4, 66, 24, 3, true,false);

        ctx.fillStyle = '#404040';
        roundRect(ctx, 11, 5, 64, 22, 3, true,false);

        ctx.fillStyle = '#D6D6B1';
        roundRect(ctx, 10, 31, 66, 24, 3, true,false);

        ctx.fillStyle = '#404040';
        roundRect(ctx, 11, 32, 64, 22, 3, true,false);

        ctx.fillStyle = '#D6D6B1';
        ctx.fillRect(42, 5, 1, 22);
        
        ctx.fillStyle = '#D6D6B1';
        ctx.fillRect(42, 32, 1, 22);

        
        ctx.fillStyle = '#D6D6B1';
        roundRect(ctx, 154, 4, 66, 24, 3, true,false);

        ctx.fillStyle = '#404040';
        roundRect(ctx, 155, 5, 64, 22, 3, true,false);

        ctx.fillStyle = '#D6D6B1';
        roundRect(ctx, 154, 31, 66, 24, 3, true,false);

        ctx.fillStyle = '#404040';
        roundRect(ctx, 155, 32, 64, 22, 3, true,false);

        ctx.fillStyle = '#D6D6B1';
        ctx.fillRect(186, 5, 1, 22);
        
        ctx.fillStyle = '#D6D6B1';
        ctx.fillRect(186, 32, 1, 22);
        
        ctx.font = "24px Beaufort for LOL Bold";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.fillText("1", 98.5, 24, 15);
        
        ctx.fillText("2", 98.5, 51, 15);
        
        ctx.fillText("3", 98.5, 78, 15);

        ctx.font = "14px Beaufort for LOL Bold";

        ctx.fillText((1 / cardsLeft * 100).toFixed(1) + "%", 132, 21, 30);
        ctx.fillText((2 / cardsLeft * 100).toFixed(1) + "%", 132, 48, 30);
        ctx.fillText((3 / cardsLeft * 100).toFixed(1) + "%", 132, 74, 30);

        ctx.drawImage(img6, 18, 7, 15, 18);
        ctx.drawImage(img7, 18, 34, 15, 18);

        ctx.fillText((spellsLeft / cardsLeft * 100).toFixed(1) + "%", 60, 21, 30); //(1 / cardsLeft * 100).toFixed(1) + "%", 132, 21, 30);
        ctx.fillText((unitsLeft / cardsLeft * 100).toFixed(1) + "%", 60, 48, 30); //(2 / cardsLeft * 100).toFixed(1) + "%", 132, 48, 30);

        ctx.drawImage(img8, 157, 6, 25, 22);
        ctx.drawImage(img9, 159, 34, 23, 18);
        
        ctx.font = "16px Beaufort for LOL Bold";

        ctx.fillText(cardsLeft, 203, 21, 30);
        ctx.fillText(handSize, 203, 48, 30); 
    }

}

function previewCard (cardCode, element) {
    console.log(cardCode)
    ipcRenderer.send('preview', "./cards/" + cardCode + ".png", "x", element.getBoundingClientRect()['y']); /////
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}