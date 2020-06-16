const {ipcRenderer, remote} = require('electron');

//const {ratings} = import(
//    /* webpackIgnore: true */ 'https://runetiera.com/ratings.js'
//);



var cOverlay = document.getElementById("overlay");
var ctxOverlay = cOverlay.getContext("2d");
var imgSide = new Image;
imgSide.src = "./images/side-grade.png";
var imgSideRight = new Image;
imgSideRight.src = "./images/side-grade-flipped.png";
console.log(cOverlay.height)
console.log(cOverlay.width)
//ctxOverlay.scaleWidth(1)
ctxOverlay.canvas.width = 1920;
ctxOverlay.canvas.height = 1080;
ctxOverlay.textAlign = "center";
ctxOverlay.fillStyle = "#715726";


ipcRenderer.on("expedition", function (event, state) {
    drawExpedition(remote.getGlobal('exRectangles'), state)
})

async function drawExpedition(exRectangles, state) {
    const { ratings } = await import(
        /* webpackIgnore: true */ 'https://runetiera.com/ratings.js'
    );
    ctxOverlay.clearRect(0, 0, 10000, 10000);


    for (let card of exRectangles) {
        console.log(ratings)
        if (card.TopLeftX > 1920 * 0.1) {
            if (state === "Picking") {
                ctxOverlay.font = "40px BeaufortforLOL-Bold";
                ctxOverlay.drawImage(imgSide, card.TopLeftX - card.Height * .625, 1080 - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
                ctxOverlay.fillText(ratings[card.CardCode][1], card.TopLeftX - card.Height * .25, 1080 - card.TopLeftY + card.Height * .65)

            }
            else {
                ctxOverlay.font = "60px BeaufortforLOL-Bold";
                if (card.TopLeftX < 1920 * 0.6) {
                    ctxOverlay.drawImage(imgSide, card.TopLeftX - card.Height, 1080 - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
                    ctxOverlay.fillText(ratings[card.CardCode][1], card.TopLeftX - card.Height * .6, 1080 - card.TopLeftY + card.Height * .6)
                }
                else {
                    ctxOverlay.drawImage(imgSideRight, card.TopLeftX + card.Width, 1080 - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
                    ctxOverlay.fillText(ratings[card.CardCode][1], card.TopLeftX + card.Width + card.Height * .4, 1080 - card.TopLeftY + card.Height * .6)
                }
            }
        }
    }
}