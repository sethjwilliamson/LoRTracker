const {ipcRenderer, remote} = require('electron');


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

ctxOverlay.font = "60px BeaufortforLOL-Bold";

ipcRenderer.on("expedition", function (event, state) {
    console.log("ipc")
    drawExpedition(remote.getGlobal('exRectangles'), state)
    //ctxOverlay.scale(1920 / cOverlay.width, 1080 / cOverlay.height)
})

function drawExpedition(exRectangles, state) {
    ctxOverlay.clearRect(0, 0, 10000, 10000);
    //ctxOverlay.fillRect(0,0, 500, 500);


    for (let card of exRectangles) {
        console.log(card.TopLeftX)
        if (card.TopLeftX > 1920 * 0.1) {
            if (state === "Picking") {
                ctxOverlay.drawImage(imgSide, card.TopLeftX - card.Height * .625, 1080 - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
            }
            else {
                if (card.TopLeftX < 1920 * 0.6) {
                    ctxOverlay.drawImage(imgSide, card.TopLeftX - card.Height, 1080 - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
                    ctxOverlay.fillText("S", card.TopLeftX - card.Height * .6, 1080 - card.TopLeftY + card.Height * .6)
                }
                else {
                    ctxOverlay.drawImage(imgSideRight, card.TopLeftX + card.Width, 1080 - card.TopLeftY + card.Height * .125, card.Height * .75, card.Height * .75);
                    ctxOverlay.fillText("B", card.TopLeftX + card.Width + card.Height * .4, 1080 - card.TopLeftY + card.Height * .6)
                }
            }
        }
    }
}