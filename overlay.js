const {ipcRenderer, remote} = require('electron');

//const {ratings} = import(
//    /* webpackIgnore: true */ 'https://runetiera.com/ratings.js'
//);
var width = 1920;
var height = 1080;


var cOverlay = document.getElementById("overlay");
var ctxOverlay = cOverlay.getContext("2d");
var imgSide = new Image;
imgSide.src = "./images/side-grade.png";
var imgSideRight = new Image;
imgSideRight.src = "./images/side-grade-flipped.png";
//ctxOverlay.scaleWidth(1)
ctxOverlay.canvas.width = width;
ctxOverlay.canvas.height = height;
ctxOverlay.textAlign = "center";
ctxOverlay.fillStyle = "#715726";

ipcRenderer.on("startOverlay", function(event, width2, height2) {
    width = width2;
    height = height2;

    cOverlay.width = width2;
    cOverlay.height = height2;

    ctxOverlay.canvas.width = width2;
    ctxOverlay.canvas.height = height2;
})

ipcRenderer.on("expedition", function (event, state, width, height) {
    drawExpedition(remote.getGlobal('exRectangles'), state);
});

async function drawExpedition(exRectangles, state) {
    const { ratings } = await import(
        /* webpackIgnore: true */ 'https://runetiera.com/ratings.js'
    );
    ctxOverlay.clearRect(0, 0, 10000, 10000);

    
    ctxOverlay.font = "40px BeaufortforLOL-Bold";
    ctxOverlay.fillText("Ratings Provided by Runetiera", width * .615, height * 3 / 4)


    for (let card of exRectangles) {
        console.log(ratings)
        if (card.TopLeftX > width * 0.1) {
            if (state === "Picking") {
                ctxOverlay.font = "40px BeaufortforLOL-Bold";
                ctxOverlay.drawImage(imgSide, card.TopLeftX - card.Height * .625, height - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
                ctxOverlay.fillText(ratings[card.CardCode][1], card.TopLeftX - card.Height * .25, height - card.TopLeftY + card.Height * .65)

            }
            else {
                ctxOverlay.font = "60px BeaufortforLOL-Bold";
                if (card.TopLeftX < width * 0.6) {
                    ctxOverlay.drawImage(imgSide, card.TopLeftX - card.Height, height - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
                    ctxOverlay.fillText(ratings[card.CardCode][1], card.TopLeftX - card.Height * .6, height - card.TopLeftY + card.Height * .6)
                }
                else {
                    ctxOverlay.drawImage(imgSideRight, card.TopLeftX + card.Width, height - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
                    ctxOverlay.fillText(ratings[card.CardCode][1], card.TopLeftX + card.Width + card.Height * .4, height - card.TopLeftY + card.Height * .6)
                }
            }
        }
    }
}