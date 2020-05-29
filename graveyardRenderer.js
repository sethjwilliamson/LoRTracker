const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');
const Store = require('electron-store');
const config = new Store();

ipcRenderer.on('update', (event, test) => {
    updateGraveyard();
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
    document.getElementById("options").style.display = "block";

    ipcRenderer.send('size', config.get("graveyard-height"), "graveyard"); 
  }
  else {
    document.getElementById("cardContents").style.display = "none";
    document.getElementById("options").style.display = "none";

    ipcRenderer.send('size', $("#top").height(), "graveyard"); 
  }
  
  updateTracker();
}

document.getElementById("top-container").style.opacity = config.get("graveyard-opacity");
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
  
  ctxTop.fillText("GRAVEYARD", imgStart.width / 2, imgStart.height / 2 + 5);
};


function buttonPressed(element) {
    $(element).parent().parent().children().each(function() {
        $(this).removeClass("btn-lor-middle-active").removeClass("btn-lor-left-active").removeClass("btn-lor-right-active");
    });
    if ($(element).parent().attr("class").includes("middle")) {
        $(element).parent().addClass("btn-lor-middle-active");
    } else if ($(element).parent().attr("class").includes("left")) {
        $(element).parent().addClass("btn-lor-left-active");
    } else if ($(element).parent().attr("class").includes("right")) {
        $(element).parent().addClass("btn-lor-right-active");
    }
    updateGraveyard();
}

var cardArr = [];

var imgCard;

var width;
var height;
var margin = 3;

function updateGraveyard() {
    let graveyardArr = remote.getGlobal('graveyardArr');
    
    if ($("#option-type-s").prop("checked")) {
        if ($("#option-player-m").prop("checked")) {
            cardArr = graveyardArr.filter(o => o.type === "Spell" && o.localPlayer);
        }
        else if ($("#option-player-b").prop("checked")) {
            /// Combine the cards from each player
            cardArr = graveyardArr.filter(o => o.type === "Spell");
        }
        else if ($("#option-player-e").prop("checked")) {
            cardArr = graveyardArr.filter(o => o.type === "Spell" && !o.localPlayer);
        }
    }
    else if ($("#option-type-b").prop("checked")) {
        if ($("#option-player-m").prop("checked")) {
            cardArr = graveyardArr.filter(o => o.localPlayer);
        }
        else if ($("#option-player-b").prop("checked")) {
            /// Combine the cards from each player
            cardArr = graveyardArr;
        }
        else if ($("#option-player-e").prop("checked")) {
            cardArr = graveyardArr.filter(o => !o.localPlayer);
        }
    }
    else if ($("#option-type-u").prop("checked")) {
        if ($("#option-player-m").prop("checked")) {
            cardArr = graveyardArr.filter(o => o.type === "Unit" && o.localPlayer);
        }
        else if ($("#option-player-b").prop("checked")) {
            /// Combine the cards from each player
            cardArr = graveyardArr.filter(o => o.type === "Unit");
        }
        else if ($("#option-player-e").prop("checked")) {
            cardArr = graveyardArr.filter(o => o.type === "Unit" && !o.localPlayer);
        }
    }

    for (let element of cardArr) {
        if (!element.image) {
            imgCard = new Image;
            imgCard.src = "./cropped/" + element.cardCode + "-full.jpg";
            element.image = imgCard;
            imgCard.onload = updateTracker;
        }
    }

    updateTracker();
}
    
function updateTracker() {
    cardArr.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 
    
    createCanvas.render(cardArr, $("#cardContents"));
}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".png", "x", parseInt(element.getBoundingClientRect()['y']), "graveyard"); 
    /// Send Quantity
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}