const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');
const Store = require('electron-store');
const config = new Store();
const data = new Store({name:"data"});
const log = require("electron-log");
log.catchErrors();

const Darkmode = require('darkmode-js');

var options = {
    bottom: '64px', // default: '32px'
    right: 'unset', // default: '32px'
    left: '32px', // default: 'unset'
    time: '0.5s', // default: '0.3s'
    mixColor: '#E5E5E5', // default: '#fff'
    backgroundColor: '#fff',  // default: '#fff'
    buttonColorDark: '#100f2c',  // default: '#100f2c'
    buttonColorLight: '#fff', // default: '#fff'
    saveInCookies: false, // default: true,
    label: '', // default: ''
    autoMatchOsTheme: true // default: true
  }
  
const darkmode = new Darkmode(options);

if (config.get("dark-mode")) {
    darkmode.toggle();
}

var updateMessage = "";
var version = "";

var start = 0;
var load = 10;

var games = data.get("games").sort((a,b) => (a.timePlayed < b.timePlayed) ? 1 : ((b.timePlayed < a.timePlayed) ? -1 : 0));
var decks = data.get("decks").sort((a,b) => (a.mostRecentPlay < b.mostRecentPlay) ? 1 : ((b.mostRecentPlay < a.mostRecentPlay) ? -1 : 0));

var regionIcons = {
    "Demacia": "icons/icon-demacia.png",
    "Noxus": "icons/icon-noxus.png",
    "Freljord": "icons/icon-freljord.png",
    "PiltoverZaun": "icons/icon-piltover.png",
    "Ionia": "icons/icon-ionia.png",
    "ShadowIsles": "icons/icon-shadowisles.png",
    "Bilgewater": "icons/icon-bilgewater.png"
};

$(".font-loader").each(function() {
    this.remove();
})

ipcRenderer.on('message', function (event, text, important, version2, firstRun) {
    updateMessage = text;
    version = version2;
    if (important && firstRun) {
        $("#myModal").modal();
        $('#configContent').load("config-update.html");
    }
});

ipcRenderer.on('modal', function (event) {
    $("#myModal").modal();
})

loadMatches();
loadMatch(games[0])

function loadMatches() {
    games = data.get("games").sort((a,b) => (a.timePlayed < b.timePlayed) ? 1 : ((b.timePlayed < a.timePlayed) ? -1 : 0));

    
    if (games.length == 0) {
        $("#historyWindow").html("<li class='h4 text-center'>Matches will be listed here.</li>")
    }

    if (start >= games.length) {
        return;
    }

    if (start + load >= games.length) {
        games = games.slice(start, games.length);
    }
    else {
        games = games.slice(start, start + load);
    }
    
    if (start == 0) {
        $("#historyWindow").html("");
    }
    console.log(games)


    for (let game of games) {
        string = "";
        let deck = decks.find(o => o.deckCode === game.deckCode);
        let yourChamps;
        let yourRegions;
        if (deck) {
            yourChamps = deck.cards.filter(o => o.isChamp);
            yourRegions = deck.regions;
        }
        else {
            decks = data.get("decks").sort((a,b) => (a.mostRecentPlay < b.mostRecentPlay) ? 1 : ((b.mostRecentPlay < a.mostRecentPlay) ? -1 : 0));
            setTimeout(loadMatches(), 1000);
            return;
        }

        let oppDeck = game.oppCards;
        let oppChamps = oppDeck.filter(o => o.isChamp);
        let oppRegions = game.oppRegions;



        string += `
            <div class="row">
                <div class="align-middle" style="position:absolute; top:25%">
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

                <div class="col align-self-center align-content-center">
                    <p class="text-center h4">${(game.isWin) ? "Win" : "Loss"}</p>
                    <p class="text-center no-margin">${new Date(game.timePlayed).toLocaleDateString()}</p>
                    <p class="text-center no-margin">${new Date(game.timePlayed).toLocaleTimeString()}</p>                
                </div>
                <div class="align-middle" style="position:absolute; top:25%; right:0">
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
        `
        if(game.isComputer) {
            string += `
            <p class="font-weight-bold no-margin" style="position:absolute; left:10; top:0">vs AI</p>
            `
        }
        else if (deck.isExpedition) {
            string += `
            <p class="font-weight-bold no-margin" style="position:absolute; left:10; top:0">Expedition</p>
            `
        }
        else {
            string += `
            <p class="font-weight-bold no-margin" style="position:absolute; left:10; top:0">Normal</p>
            `
        }
        string += `
            <p class="font-weight-bold no-margin" style="position:absolute; right:10; top:0">${game.opponentName}</p>
        `

        let li = document.createElement("LI");

        li.classList.add("list-group-item");
        li.classList.add("clickable");

        if (game.isWin) {
            li.classList.add("win")
        }
        else {
            li.classList.add("loss")
        }


        li.innerHTML = string;
        li.onclick = function() {
            loadMatch(game);
        }
        //$(li).addClass("list-group-item");
        //$(li).on("click", loadMatch(game))
//
        //$(li).html(string);

        $("#historyWindow").append(li);
    }
}

function loadDecks() {
    decks = data.get("decks").sort((a,b) => (a.mostRecentPlay < b.mostRecentPlay) ? 1 : ((b.mostRecentPlay < a.mostRecentPlay) ? -1 : 0));

    
    if (decks.length == 0) {
        $("#historyWindow").html("<li class='h4 text-center'>Decks will be listed here.</li>")
    }

    if (start >= decks.length) {
        return;
    }

    if (start + load >= decks.length) {
        decks = decks.slice(start, decks.length);
    }
    else {
        decks = decks.slice(start, start + load);
    }

    if (start == 0) {
        $("#historyWindow").html("");
    }


    for (let deck of decks) {
        string = "";
        let yourChamps = deck.cards.filter(o => o.isChamp);
        let yourRegions = deck.regions;
        

        string += `
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
        `

        if (deck.isExpedition) {
            string += `
                    <div style="position:absolute; right:0">
            `
            for (let gRecord of deck.expeditionRecord) {
                if (gRecord == "win") {
                    string += `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 8 8" fill="green">
                        <path d="M6.41 0l-.69.72-2.78 2.78-.81-.78-.72-.72-1.41 1.41.72.72 1.5 1.5.69.72.72-.72 3.5-3.5.72-.72-1.44-1.41z" transform="translate(0 1)"/>
                    </svg>
                    `
                }
                else {
                    //<img src="node_modules/open-iconic/svg/x.svg" class="svg-inject" style="width: 16px;">
                    string += `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 8 8" fill="red">
                            <path d="M1.41 0l-1.41 1.41.72.72 1.78 1.81-1.78 1.78-.72.69 1.41 1.44.72-.72 1.81-1.81 1.78 1.81.69.72 1.44-1.44-.72-.69-1.81-1.78 1.81-1.81.72-.72-1.44-1.41-.69.72-1.78 1.78-1.81-1.78-.72-.72z"/>
                        </svg>
                    `
                }
            }
            string += `
                    </div>
            `
        }
        else {
            string += `
                    <p class="text-right no-margin">${deck.wins}-${deck.losses} | ${parseInt((deck.wins) / (deck.wins + deck.losses) * 100)}%</p>
            `
        }

        string += `
                </div>
            </div>
            `

        let li = document.createElement("LI");

        li.classList.add("list-group-item");
        li.classList.add("clickable");

        li.innerHTML = string;
        li.onclick = function() {
            loadDeck(deck);
        }

        $("#historyWindow").append(li);
    }
}

function loadDeck(deck) {
    let string = '';

    $('#detailsWindow').data("deck", deck)

    if (!deck.name) {
        deck.name = deck.deckCode;
    }

    string += `
    <div class="col flex-column full-height">
        <div class="row justify-content-center d-flex">
            <p class="h1" id="name">${deck.name.slice(0,14)}</p>
            <a href="#" style="position:absolute; right:10px; top:10px"><img src="node_modules/open-iconic/svg/pencil.svg" id="editName" style="width: 20px;"></a>
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
                    <h4>${parseInt((deck.wins) / (deck.wins + deck.losses) * 100)}%</h4>
                </div>
                <div class="d-flex p-2">
                    ${deck.losses} Losses
                </div>
            </div>
        </div>

        <div class="row justify-content-center" style="height: calc(100% - 56px - 56px); margin:0">
            <div class="card" style=" overflow: auto; height: calc(100% - 20px); margin:10px; width: 90%; min-width: 400px;">
                <ul class="list-group list-group-flush" id="gamesList">
    `

    $("#detailsWindow").html(string);
    let games = data.get("games").filter(o => o.deckCode === deck.deckCode).sort((a,b) => (a.timePlayed < b.timePlayed) ? 1 : ((b.timePlayed < a.timePlayed) ? -1 : 0)).slice(start, start + load);

    for (let game of games) {
        let oppDeck = game.oppCards;
        let oppChamps = oppDeck.filter(o => o.isChamp);
        let oppRegions = game.oppRegions;

        let liString = "";

        liString += `
                        <div class="row align-content-center">
                            <div class="col align-self-left align-content-center">
                                <p class="h3 no-margin">${(game.isWin) ? "Win" : "Loss"}</p>
                                <p class="no-margin">${(new Date(game.timePlayed).toLocaleDateString() + ' ' + new Date(game.timePlayed).toLocaleTimeString())}</p>
                            </div>
                            
                            <div style="position:absolute; right:0">
                                <div class="deck-preview d-flex justify-content-end">
        `

        for (let [index, champ] of oppChamps.entries()) {
            if (oppChamps.length % 2 == 1) {
                if (index == 0) {
                    liString += `
                                    <div class="col-champ align-content-center">
                                        <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                                    </div>
                    `
                }
                else {
                    if (index % 2 == 1) {
                        liString += `
                                    <div class="col-champ align-content-center">
                                        <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                        `
                    }
                    else {
                        liString += `
                                        <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                                    </div>
                        `
                    }
                }
            }
            else {
                if (index % 2 == 0) {
                    liString += `
                                    <div class="col-champ align-content-center">
                                        <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                    `
                }
                else {
                    liString += `
                                        <img src="${'icons/champions/' + champ.cardCode + '.png'}" class="rounded-circle champPicture"/>
                                    </div>
                    `
                }
            }
        }

        for (let region of oppRegions) {
            liString += `
                                    <img src="${regionIcons[region]}" class="regionPicture"/>
            `
        }

        liString += `
                                </div>
                            </div>
                        </div>
        `

        if(game.isComputer) {
            liString += `
            <p class="no-margin" style="position:absolute; right:10; bottom:0">vs AI</p>
            `
        }

        let li = document.createElement("LI");

        li.classList.add("list-group-item");
        li.classList.add("clickable");

        if (game.isWin) {
            li.classList.add("win")
        }
        else {
            li.classList.add("loss")
        }

        li.innerHTML = liString;
        li.onclick = function() {
            loadMatch(game);
        }

        $("#gamesList").append(li);

    }

    string = `
                </ul>
            </div>
        </div>
        </div>
        <div class="border-left flex-2" style=" height: 100%; width:200px; margin-right:20px" >
            <div class="card flex-2-child flex-2" style="padding:5px; min-height: 20px; margin:10px; width:100%">
                <div class="card-heading d-flex justify-content-between">
                    <p class="no-margin font-weight-bold">Your Cards</p>
                    <a href="#"><img src="node_modules/open-iconic/svg/share-boxed.svg" id="copyDeck" style="width: 24px;"></a>
                </div>
                <div id="cardContents" class="cardContent" style="overflow: auto;">

                </div>
            </div>
        </div>
    </div>
    `
    
    $('#detailsWindow').append(string)

    for (let [index, element] of deck.cards.entries()) {
        let imgCard;

        imgCard = new Image;
        imgCard.src = "./cropped/" + element.cardCode + "-full.webp";
        element.image = imgCard;
        
        element.image.onload = function() {
            updateCards(deck.cards, $("#cardContents"));
        }
    }
    
    $("#copyDeck").click(function() {
        require("electron").clipboard.writeText(deck.deckCode)
    })

    $("#editName").click(function() {
        $("#editName").css("display", "none")
        $("#name").replaceWith(`<input type="text" class="form-control textbox" id="nameBox" style="width:90%; margin-bottom:10px"></input>`)
        enableOnKeyPress();
    })

    $("#name").dblclick(function() {
        $("#editName").css("display", "none")
        $("#name").replaceWith(`<input type="text" class="form-control textbox" id="nameBox" style="width:90%; margin-bottom:10px"></input>`)
        enableOnKeyPress();
    })
}


function loadMatch(game) {
    let deck = decks.find(o => o.deckCode === game.deckCode);
    let yourChamps = deck.cards.filter(o => o.isChamp);
    let yourRegions = deck.regions;


    let oppDeck = game.oppCards;
    let oppChamps = oppDeck.filter(o => o.isChamp);
    let oppRegions = game.oppRegions;

    string = `
        <div class="col flex-column align-content-center" style="height: 100%;">
            <div class="row border-bottom" style="height:50px">
                <div class="col" style="position: absolute; left:0;top:0">
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
                    <p class="text-center h3">${(game.isWin) ? "Win" : "Loss"}</div>

                <div class="col" style="position: absolute; right:0;top:0">
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

            <div class="row justify-content-center">
                <p class="h2">${new Date(game.timePlayed).toLocaleDateString()}</p>
            </div>
            <div class="row justify-content-center">
                <p class="h3">${new Date(game.timePlayed).toLocaleTimeString()}</p>
            </div>
            <div class="row justify-content-center">
                <p></p>
            </div>
            <div class="row justify-content-center">
                <p class="h2">${game.opponentName}</p>
            </div>
            <div class="row justify-content-center">
                <p class="h3">${msToTime(game.gameLength)}</p>
            </div>
            <div class="row justify-content-center">
                <p></p>
            </div>
            <div class="row justify-content-center">
                <p>More Stats Here Eventually</p>
            </div>
        </div>
        <div class="border-left flex-2" style=" height: 100%; width:200px; margin-right:20px" >
            <div class="card flex-2-child flex-2" style="padding:5px; min-height: 20px; margin:10px; width:100%">
                <div class="card-heading d-flex justify-content-between">
                    <p class="no-margin font-weight-bold">Your Cards</p>
                    <a href="#"><img src="node_modules/open-iconic/svg/share-boxed.svg" id="copyDeck" style="width: 24px;"></a>
                </div>
                <div id="yourCardContents" class="cardContent" style="overflow: auto;">

                </div>
            </div>
            <div class="card flex-2-child flex-2" style="padding:5px; min-height: 20px; margin:10px; width:100%">
                <div class="card-heading">
                <p class="no-margin font-weight-bold">Opponent Cards</p>
                </div>
                <div id="oppCardContents" class="cardContent" style="overflow: auto; height:100%">

                </div>
            </div>
        </div>
    `

    $('#detailsWindow').html(string)

    $("#copyDeck").click(function() {
        require("electron").clipboard.writeText(deck.deckCode)
    })

    for (let [index, element] of deck.cards.entries()) {
        let imgCard;
        
        imgCard = new Image;
        imgCard.src = "./cropped/" + element.cardCode + "-full.webp";
        element.image = imgCard;
        
        element.image.onload = function() {
            updateCards(deck.cards, $("#yourCardContents"));
        }
    }

    for (let [index, element] of oppDeck.entries()) {
        let imgCard;
        
        imgCard = new Image;
        imgCard.src = "./cropped/" + element.cardCode + "-full.webp";
        element.image = imgCard;
        
        element.image.onload = function() {
            updateCards(oppDeck, $("#oppCardContents"));
        }
    }
    
}

function enableOnKeyPress() {
    $(".textbox").on('keyup', function(e) {
        //alert(e.keyCode);
        if(e.keyCode == 13) {
            let deck = $('#detailsWindow').data("deck");
            deck.name = $("#nameBox").val();
            data.set("decks", data.get("decks").filter( o => o.deckCode !== deck.deckCode ).concat(deck));
            //$("#name").html(deck.name)
            $("#nameBox").replaceWith(`<p class="h1" id="name">${deck.name.slice(0,14)}</p>`)

            if ($("#decks-tab").attr("aria-selected") === "true") {
                loadDecks();
            }

            $("#name").dblclick(function() {
                $("#name").replaceWith(`<input type="text" class="form-control textbox" id="nameBox" style="width:90%; margin-bottom:10px"></input>`)
                enableOnKeyPress();
            })
            
            
            $("#editName").css("display", "block")
        }
    });
}

function updateCards (cards, div) {
    cards.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 
    
    createCanvas.render(cards, div);
    setTimeout(createCanvas.render(cards, div), 1000)
}

function previewCard (cardCode, element) {
    ipcRenderer.send('preview', "./cards/" + cardCode + ".webp", parseInt(element.getBoundingClientRect()['x']), parseInt(element.getBoundingClientRect()['y']), "main");
}

function unpreviewCard () {
    ipcRenderer.send('unpreview');
}

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60);
  
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return minutes + ":" + seconds;
}

ipcRenderer.on('update', (event) => {
    console.log("update")
    start = 0;
    if ($("#matches-tab").attr("aria-selected") === "true") {
        setTimeout(loadMatches(), 1000);
    }
    else {
        setTimeout(loadDecks(), 1000);
    }
});

function decksPressed() {
    start = 0;
    loadDecks();
}

function matchesPressed() {
    start = 0;
    loadMatches();
}

$('#historyWindow').on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        start += 10;

        if ($("#matches-tab").attr("aria-selected") === "true") {
            setTimeout(loadMatches(), 1000);
        }
        else {
            setTimeout(loadDecks(), 1000);
        }
    }
})

//$(function() {
//        
//    $('.list-group-item').on('click', function() {
//      $('.glyphicon', this)
//        .toggleClass('glyphicon-chevron-right')
//        .toggleClass('glyphicon-chevron-down');
//    });
//  
//  });