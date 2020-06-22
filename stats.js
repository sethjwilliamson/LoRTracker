var regions = ["Demacia", "Freljord", "Ionia", "Noxus", "PiltoverZaun", "ShadowIsles", "Bilgewater"]
var regionWinrate = [];

const Store = require('electron-store');
const data = new Store({name:"data"});
var regionIcons = {
    "Demacia": "icons/icon-demacia.png",
    "Noxus": "icons/icon-noxus.png",
    "Freljord": "icons/icon-freljord.png",
    "PiltoverZaun": "icons/icon-piltover.png",
    "Ionia": "icons/icon-ionia.png",
    "ShadowIsles": "icons/icon-shadowisles.png",
    "Bilgewater": "icons/icon-bilgewater.png"
};

var table = $('<table></table>').addClass("pure-table");

for (var i = 0; i < regions.length + 2; i++) {
    row = $('<tr></tr>');
    if (i % 2 == 0) {
        row.addClass("pure-table-odd")
    }
    let regionWins = 0;
    let regionLosses = 0;
    for (var j = 0; j < regions.length + 2; j++) {
        let rowData;
        if (i == 0 && j == 0) {
            rowData = $('<td></td>').text("");
        }
        else if (i == 0 && j !== regions.length + 1) {
            rowData = $('<td></td>').html(`<img src="${regionIcons[regions[j - 1]]}" class="regionPicture">`);
        }
        else if (j == 0 && i !== regions.length + 1) {
            rowData = $('<td></td>').html(`<img src="${regionIcons[regions[i - 1]]}" class="regionPicture">`);
        }
        else if (i == regions.length + 1) {
            if (j == 0) {
                rowData = $('<td></td>');
            }
            else if (j == regions.length + 1) {
                rowData = $('<td></td>');
                // Add up all 
            }
            else {
                rowData = $('<td></td>').addClass("text-center").text(regionWinrate[j - 1].toFixed(0) + "%")
            }
        }
        else if (j == regions.length + 1) {
            if (i == 0 || i == regions.length + 1) {
                rowData = $('<td></td>');
            }
            else {
                rowData = $('<td></td>').addClass("text-center").text((regionWins / (regionWins + regionLosses) * 100).toFixed(0) +"%");
                regionWinrate.push(regionWins / (regionWins + regionLosses) * 100);
            }
        }
        else {
            let tempRegions;

            if (regions[i - 1] == regions[j - 1]) {
                tempRegions = [regions[i - 1]]
            }
            else {
                tempRegions = [regions[i - 1], regions[j - 1]]
            }
            let wins = 0;
            let losses = 0;
            for ( let deck of data.get("decks").filter(o => arraysEqual(o.regions, tempRegions))) {
                wins += deck.wins;
                losses += deck.losses;
            }            
            regionWins += wins;
            regionLosses += losses;
            if (wins + losses == 0) {
                rowData = $('<td></td>').addClass("text-center").text("-");
            }
            else {
                rowData = $('<td></td>').addClass("text-center").text((wins / (wins + losses) * 100).toFixed(0) +"%");
            }
        }
        row.append(rowData);
    }
    table.append(row);
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    a.sort();
    b.sort();
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

$("body").append(table)