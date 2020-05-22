const {ipcRenderer, remote} = require('electron');

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
    let div = document.getElementById("cardContents");
    
    div.innerHTML = '';
    /// Individual Card Height
    /// Transparency

    cardArr.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 
    
    for (let element of cardArr) {
        cCard = document.createElement("canvas"); 
        cCard.style.width = "100%";
        cCard.height = 40;
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
        grd2.addColorStop(1, regionColors[element.region]);
        
        ctxCard.fillStyle = grd2;
        ctxCard.fillRect(50,0,600,10);
        ctxCard.fillRect(50,90,600,10);

        ctxCard.fillStyle = regionColors[element.region];
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
}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".png", "x", parseInt(element.getBoundingClientRect()['y']), false); 
    /// Send Quantity
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}