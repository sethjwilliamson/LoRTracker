const Store = require('electron-store');
const config = new Store();

var regionColors = {
    "Demacia": "#B9AC98",
    "Noxus": "#962D27",
    "Freljord": "#4A7DC3",
    "PiltoverZaun": "#B05925",
    "Ionia": "#C45987",
    "ShadowIsles": "#2A725D",
    "Bilgewater": "#FD9061"

};
var margin = 3;

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



module.exports = {
    render: function (cardArr) {
        
      let div = document.getElementById("cardContents");
    
      div.innerHTML = '';

      for (let [index, element] of cardArr.entries()) {
        cCard = document.createElement("canvas"); 
        cCard.style.width = "100%";
        cCard.height = 40;

        if (index == 0) {
            cCard.style.marginTop = margin + "px";
        }

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
        
        ctxCard.fillStyle = '#0E4F72';
        roundRect(ctxCard, 0, 0, 100, 100, 15, true,false);
        ctxCard.fillRect(50, 0, 50, 100);
        
        ctxCard.fillStyle = '#404040';
        roundRect(ctxCard, 620, 0, 100, 100, 15, true,false);
        ctxCard.fillRect(620, 0, 50, 100);
        
        ctxCard.font = "75px BeaufortforLOL-Bold";
        ctxCard.fillStyle = "white";
        ctxCard.textAlign = "center";
        ctxCard.fillText(element.mana, 50, 76);
        ctxCard.fillText(element.quantity, 670, 76);
        
        ctxCard.textAlign = "left";
        ctxCard.font = "38px BeaufortforLOL-Bold";
        ctxCard.fillText(element.name, 110, 63);

        if (element.quantity == 0) {
            ctxCard.fillStyle ="rgba(50, 50, 50, 0.7)";
            roundRect(ctxCard, 0, 0, 720, 100, 15, true,false);
        }
      }
    }
  };