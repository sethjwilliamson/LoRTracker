const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');
const Store = require('electron-store');
const config = new Store();

ipcRenderer.on('update', (event, test) => {
    console.log("ipc");
    updateGraveyard();
});


ipcRenderer.on('resize', (event, width, height) => {
    this.width = width;
    this.height = height;
    updateTracker();
});


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
        imgCard = new Image;
        imgCard.src = "./cropped/" + element.cardCode + "-full.jpg";
        element.image = imgCard;
    }

    console.log(cardArr);

    updateTracker();
}
    
function updateTracker() {
    /// Individual Card Height
    /// Transparency

    cardArr.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 
    
    createCanvas.render(cardArr);
}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".png", "x", parseInt(element.getBoundingClientRect()['y']), "graveyard"); 
    /// Send Quantity
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}