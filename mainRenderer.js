const {ipcRenderer, remote} = require('electron');
const createCanvas = require('./createCanvas.js');
const Store = require('electron-store');
const data = new Store();

games = ["game1", "game2", "game3"]

yourRegions = ["pnz", "noxus"]
oppRegions = ["demacia", "si"]
yourChamps = ["", "", "", "", "", ""];
oppChamps = ["", "", "", "", "", ""]


let string = "";

for (let element of data.get("games")) {

    string += `
    <li class="list-group-item">
        <div class="row">
            <div class="col">
                <div class="deck-preview d-flex justify-content-start">
    `

    for (let region of yourRegions) {
        string += `
                    <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/4/45/Noxus_LoR_Region.png/revision/latest?cb=20191022161806" class="regionPicture"/>
        `
    }

    for (let [index, champ] of yourChamps.entries()) {
        if (index % 2 == 0) {
            string += `
                    <div class="col-champ align-content-center">
                        <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/f/f2/Draven_OriginalSquare.png/revision/latest/scale-to-width-down/50?cb=20160526212252" class="rounded-circle champPicture"/>
            `
        }
        else {
            string += `
                        <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/f/f2/Draven_OriginalSquare.png/revision/latest/scale-to-width-down/50?cb=20160526212252" class="rounded-circle champPicture"/>
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
                            <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/f/f2/Draven_OriginalSquare.png/revision/latest/scale-to-width-down/50?cb=20160526212252" class="rounded-circle champPicture"/>
                        </div>
                `
            }
            else {
                if (index % 2 == 1) {
                    string += `
                        <div class="col-champ align-content-center">
                            <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/f/f2/Draven_OriginalSquare.png/revision/latest/scale-to-width-down/50?cb=20160526212252" class="rounded-circle champPicture"/>
                    `
                }
                else {
                    string += `
                            <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/f/f2/Draven_OriginalSquare.png/revision/latest/scale-to-width-down/50?cb=20160526212252" class="rounded-circle champPicture"/>
                        </div>
                    `
                }
            }
        }
        else {
            if (index % 2 == 0) {
                string += `
                        <div class="col-champ align-content-center">
                            <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/f/f2/Draven_OriginalSquare.png/revision/latest/scale-to-width-down/50?cb=20160526212252" class="rounded-circle champPicture"/>
                `
            }
            else {
                string += `
                            <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/f/f2/Draven_OriginalSquare.png/revision/latest/scale-to-width-down/50?cb=20160526212252" class="rounded-circle champPicture"/>
                        </div>
                `
            }
        }
        console.log(string)
    }

    for (let region of oppRegions) {
        string += `
                    <img src="https://vignette.wikia.nocookie.net/leagueoflegends/images/4/45/Noxus_LoR_Region.png/revision/latest?cb=20191022161806" class="regionPicture"/>
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

$("#historyWindow").append(string);