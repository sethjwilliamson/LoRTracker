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
        let yourChamps = deck.cards.filter(o => o.isChamp);
        let yourRegions = deck.regions;


        let oppDeck = game.oppCards;
        let oppChamps = oppDeck.filter(o => o.isChamp);
        let oppRegions = game.oppRegions;

        string += `
        <li class="list-group-item">
            <div class="row">
                <div class="col">
                    <div class="deck-preview d-flex justify-content-start">
        `
        for (let region of yourRegions) {
            string += `
                        <img src="${regionIcons[region]}" class="regionPicture"/>
            `
        }

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

    }

    $("#historyWindow").html(string);
}

function loadDecks() {
    let string = "";

    for (let deck of decks) {
        loadDeck(deck);
        let yourChamps = deck.cards.filter(o => o.isChamp);
        let yourRegions = deck.regions;
        

        string += `
        <li class="list-group-item">
            <div class="row">
                <div class="col">
                    <div class="deck-preview d-flex justify-content-start">
        `
        for (let region of yourRegions) {
            string += `
                        <img src="${regionIcons[region]}" class="regionPicture"/>
            `
        }

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

function loadDeck(deck) {
    let string = '';

    if (!deck.name) {
        deck.name = deck.deckCode;
    }

    string += `
    <div class="col flex-column full-height">
        <div class="row justify-content-center">
            <p class="h1">${deck.name.slice(0,14)}</p>
        </div>
        <div class="row justify-content-center">
            <div class="progress" style="width: 90%;">
                <div class="progress-bar" role="progressbar" style="width: ${deck.wins / (deck.wins + deck.losses) * 100}%;" aria-valuenow="${deck.wins / (deck.wins + deck.losses) * 100}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="d-flex justify-content-between" style="width:90%">
                <div class="d-flex p-2">
                    ${deck.wins} Wins
                </div>
                <div class="d-flex p-2">
                    ${deck.wins / (deck.wins + deck.losses) * 100}%
                </div>
                <div class="d-flex p-2">
                    ${deck.losses} Losses
                </div>
            </div>
        </div>

        <div class="row justify-content-center" style="height: calc(100% - 56px - 56px); margin:0">
            <div class="card" style=" overflow: auto; height: calc(100% - 20px); margin:10px; width: 90%; min-width: 400px;">
                <ul class="list-group list-group-flush">
    `

    let games = data.get("games").filter(o => o.deckCode === deck.deckCode);

    for (let game of games) {
        let oppDeck = game.oppCards;
        let oppChamps = oppDeck.filter(o => o.isChamp);
        let oppRegions = game.oppRegions;

        string += `
                    <li class="list-group-item">
                        <div class="row align-content-center">
                            <div class="col align-self-left align-content-center">
                                <p class="h3 no-margin">${(game.isWin) ? "Win" : "Loss"}</p>
                                <p class="no-margin">${(new Date(game.timePlayed).toLocaleDateString("en-US") + ' ' + new Date(game.timePlayed).toLocaleTimeString("en-US"))}</p>
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
        }

        for (let region of oppRegions) {
            string += `
                                    <img src="${regionIcons[region]}" class="regionPicture"/>
            `
        }

        string += `
                                </div>
                            </div>
                        </div
                    </li>
                </ul>
            </div>
        </div>
    </div>
        `

    }

    string += `
        <div class="border-left" style="width: 200px;">
            <div class="card" style="padding:5px; height: calc(100% - 20px); min-height: 20px; margin:10px">
                <div class="card-heading">
                    Your Cards
                </div>
                <div id="cardContents" style="overflow: auto; height:100%">

                </div>
            </div>
        </div>
    </div>
    `
    
    $('#detailsWindow').html(string)
    
    console.log(string)

    for (let [index, element] of deck.cards.entries()) {
        console.log(element.cardCode);
        let imgCard;
        if (!element.image) {
            imgCard = new Image;
            imgCard.src = "./cropped/" + element.cardCode + "-full.jpg";
            element.image = imgCard;
        }
        if (index == deck.cards.length - 1) {
            console.log(deck.cards);
            imgCard.onload = createCanvas.render(deck.cards);
        }
    }
    

}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".png", parseInt(element.getBoundingClientRect()['x']), parseInt(element.getBoundingClientRect()['y']), "main");
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}