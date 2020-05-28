const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');
const Store = require('electron-store');
const data = new Store({name:"data"});

var games = data.get("games");
var decks = data.get("decks");

var regionIcons = {
    "Demacia": "icons/icon-demacia.png",
    "Noxus": "icons/icon-noxus.png",
    "Freljord": "icons/icon-freljord.png",
    "PiltoverZaun": "icons/icon-piltover.png",
    "Ionia": "icons/icon-ionia.png",
    "ShadowIsles": "icons/icon-shadowisles.png",
    "Bilgewater": "icons/icon-bilgewater.png"
};

loadDecks();

function loadMatches() {
    let string = "";

    for (let game of games) {
        let deck = decks.find(o => o.deckCode === game.deckCode);
        console.log(deck)
        let yourChamps = deck.cards.filter(o => o.isChamp);
        let yourRegions = deck.regions;

        console.log(yourRegions)

        let oppDeck = game.oppCards;
        let oppChamps = oppDeck.filter(o => o.isChamp);
        let oppRegions = game.oppRegions;

        string += `
        <li class="list-group-item">
            <div class="row">
                <div class="col">
                    <div class="deck-preview d-flex justify-content-start">
        `
        console.log(string);
        for (let region of yourRegions) {
            string += `
                        <img src="${regionIcons[region]}" class="regionPicture"/>
            `
        }
        console.log(string);

        for (let [index, champ] of yourChamps.entries()) {
            if (index % 2 == 0) {
                string += `
                        <div class="col-champ align-content-center">
                            <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                `
            }
            else {
                string += `
                            <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                        </div>
                `
            }
        }

        if (yourChamps.length % 2 == 1) {
            string += `
                        </div>
            `
        }

        string += `
                    </div>
                </div>

                <div class="col align-self-center">
                    <p class="text-center h3">`

        if (isWin = true) {
            string += `Win`
        }
        else {
            string += `Loss`
        }

        string += `
                </div>

                <div class="col">
                    <div class="deck-preview d-flex justify-content-end">
        `

        for (let [index, champ] of oppChamps.entries()) {
            if (oppChamps.length % 2 == 1) {
                if (index == 0) {
                    string += `
                            <div class="col-champ align-content-center">
                                <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                            </div>
                    `
                }
                else {
                    if (index % 2 == 1) {
                        string += `
                            <div class="col-champ align-content-center">
                                <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                        `
                    }
                    else {
                        string += `
                                <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                            </div>
                        `
                    }
                }
            }
            else {
                if (index % 2 == 0) {
                    string += `
                            <div class="col-champ align-content-center">
                                <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                    `
                }
                else {
                    string += `
                                <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                            </div>
                    `
                }
            }
            console.log(string)
        }

        for (let region of oppRegions) {
            string += `
                        <img src="${regionIcons[region]}" class="regionPicture"/>
            `
        }

        string += `
                    </div>
                </div>
            </div>
        </li>
        `  
        console.log(string)

    }

    $("#historyWindow").html(string);
}

function loadDecks() {
    let string = "";

    for (let deck of decks) {
        let yourChamps = deck.cards.filter(o => o.isChamp);
        let yourRegions = deck.regions;

        string += `
        <li class="list-group-item">
            <div class="row">
                <div class="col">
                    <div class="deck-preview d-flex justify-content-start">
        `
        console.log(string);
        for (let region of yourRegions) {
            string += `
                        <img src="${regionIcons[region]}" class="regionPicture"/>
            `
        }
        console.log(string);

        for (let [index, champ] of yourChamps.entries()) {
            if (index % 2 == 0) {
                string += `
                        <div class="col-champ align-content-center">
                            <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                `
            }
            else {
                string += `
                            <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                        </div>
                `
            }
        }

        if (yourChamps.length % 2 == 1) {
            string += `
                        </div>
            `
        }

        if (!deck.name) {
            deck.name = deck.deckCode;
        }

        string += `
                    </div>
                </div>

                <div class="col align-self-right flex-grow-1" style="max-width: 250px;">
                    <p class="text-right h4 no-margin" style="white-space: nowrap;">${deck.name.slice(0,14)}</p>
                    <p class="text-right no-margin">${deck.wins}-${deck.losses} | ${(deck.wins) / (deck.wins + deck.losses) * 100}%</p>
                </div>
            </div>
        `

    }

    $("#historyWindow").html(string);
}
