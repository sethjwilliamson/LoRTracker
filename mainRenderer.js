const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');
const Store = require('electron-store');
const config = new Store();
const data = new Store({name:"data"});
const log = require("electron-log");


log.catchErrors();

var regionOptions = [];

var fullDecks = data.get("decks");
var fullGames = data.get("games");

const patchTimes = [
    {
        "patch": "1.0",
        "timeStart": 0,
        "timeEnd": 1589297400000
    },
    {
        "patch": "1.1",
        "timeStart": 1589297400000,
        "timeEnd": 1590595200000
    },
    {
        "patch": "1.2",
        "timeStart": 1590595200000,
        "timeEnd": 1591804800000
    },
    {
        "patch": "1.3",
        "timeStart": 1591804800000,
        "timeEnd": 1593014400000
    },
    {
        "patch": "1.4",
        "timeStart": 1593014400000,
        "timeEnd": 1594224000000
    },
    {
        "patch": "1.5",
        "timeStart": 1594224000000,
        "timeEnd": 1595433600000
    },
    {
        "patch": "1.6",
        "timeStart": 1595433600000,
        "timeEnd": 1596643200000
    },
    {
        "patch": "1.7",
        "timeStart": 1596643200000,
        "timeEnd": 1598457600000
    },
    {
        "patch": "1.8",
        "timeStart": 1598457600000,
        "timeEnd": 1600272000000
    },
    {
        "patch": "1.10",
        "timeStart": 1600272000000,
        "timeEnd": 1601481600000
    },
    {
        "patch": "1.11",
        "timeStart": 1601481600000,
        "timeEnd": 1602691200000
    },
    {
        "patch": "1.12",
        "timeStart": 1602691200000,
        "timeEnd": 1603900800000
    },
    {
        "patch": "1.13",
        "timeStart": 1603900800000,
        "timeEnd": 1605110400000
    },
    {
        "patch": "1.14",
        "timeStart": 1605110400000,
        "timeEnd": 1606233600000
    },
    {
        "patch": "1.15",
        "timeStart": 1606233600000,
        "timeEnd": 1608134400000
    },
    {
        "patch": "1.16",
        "timeStart": 1608134400000,
        "timeEnd": Number.MAX_SAFE_INTEGER
    }
]

const customTitlebar = require('custom-electron-titlebar');
 
const titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#F2F2F2'),//'#3C3C3C'),
    icon: "icon.png"
});
titlebar.updateTitle("Legends of Runeterra Deck Tracker");

const Darkmode = require('darkmode-js');

var options = {
    mixColor: '#E5E5E5', // default: '#fff'
    backgroundColor: '#fff',  // default: '#fff'
    buttonColorDark: '#100f2c',  // default: '#100f2c'
    buttonColorLight: '#fff', // default: '#fff'
    saveInCookies: false, // default: true,
    autoMatchOsTheme: true // default: true
  }
  
const darkmode = new Darkmode(options);

if (config.get("dark-mode")) {
    darkmode.toggle();
    titlebar.updateBackground(customTitlebar.Color.fromHex("#3C3C3C"));
}


var updateMessage = "";
var version = "";

var start = 0;
var load = 20;

var regionIcons = {
    "Demacia": "icons/icon-demacia.png",
    "Noxus": "icons/icon-noxus.png",
    "Freljord": "icons/icon-freljord.png",
    "PiltoverZaun": "icons/icon-piltover.png",
    "Ionia": "icons/icon-ionia.png",
    "ShadowIsles": "icons/icon-shadowisles.png",
    "Bilgewater": "icons/icon-bilgewater.png",
    "Targon": "icons/icon-targon.png"
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
    fullGames = data.get("games");
    fullDecks = data.get("decks");
    games = fullGames.filter(filterGames).sort(sortGames);

    
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
        let deck = fullDecks.find(o => o.deckCode === game.deckCode);
        let yourChamps;
        let yourRegions;

        if (deck) {
            yourChamps = deck.cards.filter(o => o.isChamp);
            yourRegions = deck.regions;
        }
        else {
            ///
            //decks = data.get("decks").sort((a,b) => (a.mostRecentPlay < b.mostRecentPlay) ? 1 : ((b.mostRecentPlay < a.mostRecentPlay) ? -1 : 0));
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
    fullGames = data.get("games");
    fullDecks = data.get("decks");
    decks = fullDecks.filter(filterDecks).sort(sortDecks);
    
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
                    <p class="text-right h4 no-margin scale" style="white-space: nowrap;">${deck.name}</p>
        `

        if (deck.isExpedition) {
            string += `
                    <div style="position:absolute; right:0; z-index: 501">
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
    fullGames = data.get("games");
    fullDecks = data.get("decks");
    let string = '';

    $('#detailsWindow').data("deck", deck)

    if (!deck.name) {
        deck.name = deck.deckCode;
    }

    string += `
    <div class="col flex-column full-height flex-column">
        <div class="row justify-content-center d-flex" style="height:46px">
            <p class="h2" id="name" style="width:80%; text-overflow:ellipsis; text-align:center; position: absolute; overflow: hidden">${deck.name}</p>
            <a href="#" style="position:absolute; left:10px; top:10px"><img src="node_modules/open-iconic/svg/trash.svg" id="deleteDeck" onclick="deleteDeck()" style="width: 20px;"></a>
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

        <div class="row justify-content-center" style="margin:0; height: calc(100% - 56px - 56px - 12px)">
            <div class="card" style=" overflow: auto; margin:0px; width: 90%; min-width: 400px; height: 100%; border-bottom:none; border-bottom-left-radius:unset; border-bottom-right-radius:unset; border-top-right-radius:6px; border-top-left-radius:6px">
                <ul class="list-group list-group-flush" id="gamesList">
    `

    $("#detailsWindow").html(string);
    let games = fullGames.filter(o => o.deckCode === deck.deckCode).sort((a,b) => (a.timePlayed < b.timePlayed) ? 1 : ((b.timePlayed < a.timePlayed) ? -1 : 0));

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
        $("#deleteDeck").css("display", "none")
        $("#name").replaceWith(`<input type="text" class="form-control textbox" id="nameBox" style="width:90%; margin-bottom:10px"></input>`)
        enableOnKeyPress();
    })

    $("#name").dblclick(function() {
        $("#editName").css("display", "none")
        $("#deleteDeck").css("display", "none")
        $("#name").replaceWith(`<input type="text" class="form-control textbox" id="nameBox" style="width:90%; margin-bottom:10px"></input>`)
        enableOnKeyPress();
    })
}


function loadMatch(game) {
    fullGames = data.get("games");
    fullDecks = data.get("decks");
    let deck = fullDecks.find(o => o.deckCode === game.deckCode);
    let yourChamps = deck.cards.filter(o => o.isChamp);
    let yourRegions = deck.regions;


    let oppDeck = game.oppCards;
    let oppChamps = oppDeck.filter(o => o.isChamp);
    let oppRegions = game.oppRegions;

    $('#detailsWindow').data("match", game);

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
                <a href="#" style="position:absolute; left:10px; top:60px"><img src="node_modules/open-iconic/svg/trash.svg" id="deleteMatch" onclick="deleteMatch()" style="width: 20px;"></a>
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
            $("#nameBox").replaceWith(`<p class="h2" id="name" style="width:80%; text-overflow:ellipsis; text-align:center; position: absolute; overflow: hidden">${deck.name}</p>`)

            if ($("#decks-tab").attr("aria-selected") === "true") {
                loadDecks();
            }

            $("#name").dblclick(function() {
                $("#name").replaceWith(`<input type="text" class="form-control textbox" id="nameBox" style="width:90%; margin-bottom:10px"></input>`)
                enableOnKeyPress();
            })
            
            
            $("#editName").css("display", "block")
            $("#deleteDeck").css("display", "block")
        }
    });
}

function updateCards (cards, div) {
    cards.sort((a,b) => (a.mana > b.mana) ? 1 : ((b.mana > a.mana) ? -1 : 0)); 
    
    createCanvas.render(div, cards);
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
    console.log("update");
    reloadHistory();
});

function reloadHistory() {
    start = 0;
    if ($("#matches-tab").attr("aria-selected") === "true") {
        setTimeout(loadMatches(), 1000);
    }
    else {
        setTimeout(loadDecks(), 1000);
    }
}

function decksPressed() {
    start = 0;
    loadDecks();
}

function matchesPressed() {
    start = 0;
    loadMatches();
}

function deleteDeck() {
    if (confirm("Are you sure you want to delete this deck and all matches associated with it?")) {

        let deckCode = $("#detailsWindow").data("deck").deckCode;
        
        let decks = data.get("decks");

        decks.splice(decks.findIndex(o => o.deckCode === $("#detailsWindow").data("deck").deckCode), 1);

        let games = data.get("games");

        for (let i = games.length - 1; i >= 0; --i) {
            if (games[i].deckCode === deckCode) {
                games.splice(i, 1);
            }
        }

        data.set("decks", decks);
        data.set("games", games);

        reloadHistory();
        if (decks.length > 0) {
            loadDeck(decks[0]);
        }
    }
}

function deleteMatch() {
    if (confirm("Are you sure you want to delete this match?")) {
        let match = $("#detailsWindow").data("match");

        let games = data.get("games");//.find(o => o.timePlayed == match.timePlayed);

        games.splice(games.findIndex(o => o.timePlayed == match.timePlayed));

        let decks = data.get("decks");

        if (match.isWin) {
            decks.find(o => o.deckCode === match.deckCode).wins--;
        }
        else {
            decks.find(o => o.deckCode === match.deckCode).losses--;
        }

        data.set("decks", decks);
        data.set("games", games);
        
        reloadHistory();
        if (games.length > 0) {
            loadMatch(games[0]);
        }
    }
}

$('#historyWindow').on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        start += load;

        if ($("#matches-tab").attr("aria-selected") === "true") {
            setTimeout(loadMatches(), 1000);
        }
        else {
            setTimeout(loadDecks(), 1000);
        }
    }
});

function isIntersection(arr1, arr2) {
    for (let element1 of arr1) {
        for (let element2 of arr2) {
            if (element1 === element2) {
                return true;
            }
        }
    }
    return false;
}

//$(function() {
//        
//    $('.list-group-item').on('click', function() {
//      $('.glyphicon', this)
//        .toggleClass('glyphicon-chevron-right')
//        .toggleClass('glyphicon-chevron-down');
//    });
//  
//  });


$(function ($) {
    // init the state from the input
    $(".image-checkbox").each(function () {
        if ($(this).find('input[type="checkbox"]').first().attr("checked")) {
            $(this).addClass('image-checkbox-checked');
        }
        else {
            $(this).removeClass('image-checkbox-checked');
        }
    });

    // sync the state to the input
    $(".image-checkbox").on("click", function (e) {
        if ($(this).hasClass('image-checkbox-checked')) {
            $(this).removeClass('image-checkbox-checked');
            $(this).find('input[type="checkbox"]').first().removeAttr("checked");

            regionOptions.splice(regionOptions.indexOf($(this).attr("title")), 1);
        }
        else {
            $(this).addClass('image-checkbox-checked');
            $(this).find('input[type="checkbox"]').first().attr("checked", "checked");

            regionOptions.push($(this).attr("title"));
        }

        e.preventDefault();
    });
});

$(".checkbox-menu").on("change", "input[type='checkbox']", function() {
    $(this).closest("li").toggleClass("active", this.checked);

    let checkboxArr = [];

    $(this).parent().parent().parent().find("li").each(function() {
        if ($(this).hasClass("active")) {
            checkboxArr.push($(this).find("data").html())
        }
    });
    if (checkboxArr.length == 0) {
        $("#typeData").html("All")
        $("#typeData").data("data", ["Expedition", "Normal", "vs AI"])
    }
    else if (checkboxArr.length == 1) {
        $("#typeData").html(checkboxArr[0]);
        $("#typeData").data("data", checkboxArr)
    }
    else if (checkboxArr.length == 2) {
        $("#typeData").html(checkboxArr[0] + " & " + checkboxArr[1]);
        $("#typeData").data("data", checkboxArr)
    }
    else {
        $("#typeData").html("All")
        $("#typeData").data("data", checkboxArr)
    }
});

$(document).on('click', '.allow-focus', function (e) {
    e.stopPropagation();
});

$(function(){
    $('#date_timepicker_start').datetimepicker({
        //format:'Y/m/d',
        onShow:function( ct ){
            this.setOptions({
                maxDate:$('#date_timepicker_end').val()?$('#date_timepicker_end').val():false,
                maxDate:0
            })
        },
        timepicker:true,
        theme: config.get("dark-mode") ? "dark" : "default"
    });
    $('#date_timepicker_end').datetimepicker({
        //format:'Y/m/d',
        onShow:function( ct ){
            this.setOptions({
                minDate:$('#date_timepicker_start').val()?$('#date_timepicker_start').val():false,
                maxDate:0,
            })
        },
        timepicker:true,
        theme: config.get("dark-mode") ? "dark" : "default"
    });
    $("#typeData").data("data", ["Expedition", "Normal", "vs AI"]);
});

$(".numeric").keyup(function () { 
    this.value = this.value.replace(/[^0-9\.]/g,'');
});

$(".dropdown-item").on("click", function(e) {
    //alert($(this).parent().parent().find(".dropdown-toggle").html())
    $(this).parent().parent().find(".dropdown-toggle").html($(this).html())

})

$("#timeSelector > .dropdown-item").on ("click", function(e) {
    if ($(this).html() === "Patch") {
        $("#date_timepicker_start").addClass("d-none")
        $("#date_timepicker_end").addClass("d-none")
        $("#patch-div").removeClass("d-none")
    }
    else if ($(this).html() === "Custom") {
        $("#date_timepicker_start").removeClass("d-none")
        $("#date_timepicker_end").removeClass("d-none")
        $("#patch-div").addClass("d-none")

    }
    else {
        $("#date_timepicker_start").addClass("d-none")
        $("#date_timepicker_end").addClass("d-none")
        $("#patch-div").addClass("d-none")

    }
})

function filterGames(o) {
    let associatedDeck = fullDecks.find(deckO => deckO.deckCode === o.deckCode);
    let minGames = 0, minWinrate = 0, timeStart = 0;
    let maxGames = Number.MAX_SAFE_INTEGER, maxWinrate = Number.MAX_SAFE_INTEGER, timeEnd = Number.MAX_SAFE_INTEGER;

    if ($("#minimum-games").val()) {
        minGames = $("#minimum-games").val();
    }

    if ($("#maximum-games").val()) {
        maxGames = $("#maximum-games").val();
    }

    if ($("#minimum-winrate").val()) {
        minWinrate = $("#minimum-winrate").val();
    }

    if ($("#maximum-winrate").val()) {
        maxWinrate = $("#maximum-winrate").val();
    }

    let matchTypeArr = ["Expedition", "Normal", "vs AI"]

    if($("#typeData").data("data")) {
        matchTypeArr = $("#typeData").data("data");
    }

    let matchType = "Normal";

    if (o.isComputer) {
        matchType = "vs AI";
    }
    else if (associatedDeck.isExpedition) {
        matchType = "Expedition";
    }

    switch ($("#time-div").find("button").html()) {
        case "All Time":
            break;
        case "Past Day":
            timeStart = Date.now() - 86400000
            break;
        case "Past Week":
            timeStart = Date.now() - 604800000
            break;
        case "Past Month":
            timeStart = Date.now() - 2592000000
            break;
        case "Patch":
            let patch = patchTimes.find(patchTime => patchTime.patch === $("#patch-div").find("button").html())
            timeStart = patch.timeStart
            timeEnd = patch.timeEnd
            break;
        case "Custom":
            if ($("#date_timepicker_start").val()) {
                timeStart = Math.round(new Date($("#date_timepicker_start").val()).getTime())// / 1000)
            }
            
            if ($("#date_timepicker_end").val()) {
                timeEnd = Math.round(new Date($("#date_timepicker_end").val()).getTime())// / 1000)
            }
            break;
    }

    if (!associatedDeck.name) {
        associatedDeck.name = associatedDeck.deckCode
    }

    return (o.opponentName.toLowerCase().includes($("#searchName").val().toLowerCase()) || associatedDeck.name.toLowerCase().includes($("#searchName").val().toLowerCase())) &&
        (regionOptions.length == 0 || isIntersection(regionOptions, associatedDeck.regions)) && 
        (associatedDeck.wins + associatedDeck.losses >= minGames) && (associatedDeck.wins + associatedDeck.losses <= maxGames) &&
        (associatedDeck.wins / (associatedDeck.wins + associatedDeck.losses) * 100 >= minWinrate) && (associatedDeck.wins / (associatedDeck.wins + associatedDeck.losses) * 100 <= maxWinrate) &&
        (matchTypeArr.includes(matchType)) &&
        (o.timePlayed >= timeStart) && (o.timePlayed <= timeEnd);
}

function filterDecks(o) {
    let minGames = 0, minWinrate = 0, timeStart = 0;
    let maxGames = Number.MAX_SAFE_INTEGER, maxWinrate = Number.MAX_SAFE_INTEGER, timeEnd = Number.MAX_SAFE_INTEGER;

    if ($("#minimum-games").val()) {
        minGames = $("#minimum-games").val();
    }

    if ($("#maximum-games").val()) {
        maxGames = $("#maximum-games").val();
    }

    if ($("#minimum-winrate").val()) {
        minWinrate = $("#minimum-winrate").val();
    }

    if ($("#maximum-winrate").val()) {
        maxWinrate = $("#maximum-winrate").val();
    }

    let matchTypeArr = ["Expedition", "Normal", "vs AI"]

    if($("#typeData").data("data")) {
        matchTypeArr = $("#typeData").data("data");
    }

    switch ($("#time-div").find("button").html()) {
        case "All Time":
            break;
        case "Past Day":
            timeStart = Date.now() - 86400000
            break;
        case "Past Week":
            timeStart = Date.now() - 604800000
            break;
        case "Past Month":
            timeStart = Date.now() - 2592000000
            break;
        case "Patch":
            let patch = patchTimes.find(patchTime => patchTime.patch === $("#patch-div").find("button").html())
            timeStart = patch.timeStart
            timeEnd = patch.timeEnd
            break;
        case "Custom":
            if ($("#date_timepicker_start").val()) {
                timeStart = Math.round(new Date($("#date_timepicker_start").val()).getTime())
            }
            
            if ($("#date_timepicker_end").val()) {
                timeEnd = Math.round(new Date($("#date_timepicker_end").val()).getTime())
            }
            break;
    }    

    let name = "";

    if (o.name) {
        name = o.name;
    }
    else {
        name = o.deckCode;
    }

    return (name.includes($("#searchName").val())) &&
        (regionOptions.length == 0 || isIntersection(regionOptions, o.regions)) && 
        (o.wins + o.losses >= minGames) && (o.wins + o.losses <= maxGames) &&
        (o.wins / (o.wins + o.losses) * 100 >= minWinrate) && (o.wins / (o.wins + o.losses) * 100 <= maxWinrate) &&
        (matchTypeArr.length == 3 || ((o.isExpedition && matchTypeArr.includes("Expedition") || (!o.isExpedition && !matchTypeArr.includes("Expedition"))))) &&
        (o.mostRecentPlay >= timeStart) && (o.mostRecentPlay <= timeEnd);
}

function sortGames(a, b) {
    console.log($("#sort-div").find("button").html())
    let associatedDeckA = fullDecks.find(deckO => deckO.deckCode === a.deckCode);
    let associatedDeckB = fullDecks.find(deckO => deckO.deckCode === b.deckCode);

    switch($("#sort-div").find("button").html()) {
        case "Most Recent":
            return (a.timePlayed < b.timePlayed) ? 1 : ((b.timePlayed < a.timePlayed) ? -1 : 0);
        case "Least Recent":
            return (a.timePlayed > b.timePlayed) ? 1 : ((b.timePlayed > a.timePlayed) ? -1 : 0);
        case "Highest Winrate":
            return (associatedDeckA.wins / (associatedDeckA.wins + associatedDeckA.losses) < associatedDeckB.wins / (associatedDeckB.wins + associatedDeckB.losses)) ? 1 : 
            ((associatedDeckB.wins / (associatedDeckB.wins + associatedDeckB.losses) < associatedDeckA.wins / (associatedDeckA.wins + associatedDeckA.losses)) ? -1 : 0);
        case "Lowest Winrate":
            return (associatedDeckA.wins / (associatedDeckA.wins + associatedDeckA.losses) > associatedDeckB.wins / (associatedDeckB.wins + associatedDeckB.losses)) ? 1 : 
            ((associatedDeckB.wins / (associatedDeckB.wins + associatedDeckB.losses) > associatedDeckA.wins / (associatedDeckA.wins + associatedDeckA.losses)) ? -1 : 0);
        case "Most Games":
            return (associatedDeckA.wins + associatedDeckA.losses < associatedDeckB.wins + associatedDeckB.losses) ? 1 :
             ((associatedDeckB.wins + associatedDeckB.losses < associatedDeckA.wins + associatedDeckA.losses) ? -1 : 0);
        case "Least Games":
            return (associatedDeckA.wins + associatedDeckA.losses > associatedDeckB.wins + associatedDeckB.losses) ? 1 :
             ((associatedDeckB.wins + associatedDeckB.losses > associatedDeckA.wins + associatedDeckA.losses) ? -1 : 0);
    }
}

function sortDecks(a, b) {
    console.log($("#sort-div").find("button").html())

    switch($("#sort-div").find("button").html()) {
        case "Most Recent":
            return (a.mostRecentPlay < b.mostRecentPlay) ? 1 : ((b.mostRecentPlay < a.mostRecentPlay) ? -1 : 0);
        case "Least Recent":
            return (a.mostRecentPlay > b.mostRecentPlay) ? 1 : ((b.mostRecentPlay > a.mostRecentPlay) ? -1 : 0);
        case "Highest Winrate":
            return (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) ? 1 : 
            ((b.wins / (b.wins + b.losses) < a.wins / (a.wins + a.losses)) ? -1 : 0);
        case "Lowest Winrate":
            return (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) ? 1 : 
            ((b.wins / (b.wins + b.losses) > a.wins / (a.wins + a.losses)) ? -1 : 0);
        case "Most Games":
            return (a.wins + a.losses < b.wins + b.losses) ? 1 :
             ((b.wins + b.losses < a.wins + a.losses) ? -1 : 0);
        case "Least Games":
            return (a.wins + a.losses > b.wins + b.losses) ? 1 :
             ((b.wins + b.losses > a.wins + a.losses) ? -1 : 0);
    }
}

function search() {
    reloadHistory();
    $("#collapseExample").collapse('hide');
}

$("#searchName").on('keyup', function(e) {
    if(e.keyCode == 13) {
        search();
    }
});

$('#collapseExample').on('show.bs.collapse', function () {
    $("#button-caret").addClass("over");
    $("#button-caret").removeClass("out");
})

$('#collapseExample').on('hide.bs.collapse', function () {
    $("#button-caret").addClass("out");
    $("#button-caret").removeClass("over");
})