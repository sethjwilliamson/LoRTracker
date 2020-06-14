const {app, BrowserWindow, remote, Menu, Tray, globalShortcut, shell} = require('electron');
const path = require('path');
const {ipcMain, screen} = require('electron');
const Store = require('electron-store');
const config = new Store({
  "defaults" : {
    "tracker-width": 173,
    "tracker-height": 550,
    "tracker-x": 1735,
    "tracker-y": 70,
    "tracker-opacity": 0.75,
    "tracker-ignore-mouse-events": false,
    "tracker-disabled": false,
    "opponent-deck-width": 173,
    "opponent-deck-height": 150,
    "opponent-deck-x": 10,
    "opponent-deck-y": 140,
    "opponent-deck-opacity": 0.75,
    "opponent-deck-ignore-mouse-events": false,
    "opponent-deck-disabled": false,
    "graveyard-width": 173,
    "graveyard-height": 225,
    "graveyard-x": 10,
    "graveyard-y": 735,
    "graveyard-opacity": 0.75,
    "graveyard-ignore-mouse-events": false,
    "graveyard-disabled": false,
    "card-opacity": 0.75,
    "record-ai-games": false,
    "hotkey": "Control+Shift+D",
    "dark-mode": true,
    "exit-on-close": true,
    "margin": 3,
    "swap-increment": false,
    "preview-width": 340
  }
});
const data = new Store({
  name:"data",
  "defaults": {
    "games": [],
    "decks": []
  }
});

const { autoUpdater } = require("electron-updater");

var firstRun = true;
var ingame = false;

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...', false);
});
autoUpdater.on('update-available', info => {
  sendStatusToWindow('Update available.', true);
});
autoUpdater.on('update-not-available', info => {
  sendStatusToWindow('Update not available.', false);
});
autoUpdater.on('error', err => {
  sendStatusToWindow(`Error in auto-updater: ${err.toString()}`, true);
});
autoUpdater.on('download-progress', progressObj => {
  sendStatusToWindow(
    `Download speed: ${parseInt(progressObj.bytesPerSecond / 1000)} kB/s|${progressObj.percent}|${parseInt(progressObj.transferred / 1000)} kB|${parseInt(progressObj.total / 1000)} kB`, true
  );
});
autoUpdater.on('update-downloaded', info => {
  sendStatusToWindow('Update downloaded; will install now', false);
  app.isQuiting = true;
  autoUpdater.quitAndInstall();
});

const log = require("electron-log");
log.catchErrors();

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = "info"

const imgPath = path.join(process.resourcesPath, 'icon.png');
const nativeImage = require('electron').nativeImage
let icon = nativeImage.createFromPath(imgPath)

var trackerWindow, fullCardWindow, graveyardWindow, oppDeckWindow;

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  })
}

function createWindow () {
  const tray = new Tray(icon)

  let contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click:  function(){
        mainWindow.show();
    } },
    { label: 'Quit', click:  function(){
        app.isQuiting = true;
        app.quit();
    } }
  ]);

  //let menu = Menu.buildFromTemplate([
  //  {
  //    label: 'Menu',
  //    submenu: [
  //        {label:'Config', click() {
  //          mainWindow.webContents.send('modal');
  //        }},
  //        {label:'Exit', click() {
  //          app.isQuiting = true;
  //          app.quit();
  //        }
  //      }  
  //    ]
  //  }
  //])

  let menu = Menu.buildFromTemplate([
    {
      label:'LoR Tracker', 
      click() {
        // Open lor-tracker.com
        shell.openExternal('https://lor-tracker.com');
      }
    },
    {
      label:'Options', 
      icon: nativeImage.createFromPath("node_modules/open-iconic/svg/share-boxed.svg"),
      click() {
        mainWindow.webContents.send('modal');
      }
    },
    {
      label:'Discord', 
      click() {
        // Discord invite link
        shell.openExternal('https://discord.gg/zDPBXUG');
      }
    },
  ])
  Menu.setApplicationMenu(menu);

  
  tray.setToolTip('Legends of Runeterra Deck Tracker');
  tray.setContextMenu(contextMenu);
  tray.on('right-click', () => {
    tray.popUpContextMenu();
  })
  tray.on('click', () => {
    mainWindow.show();
  });

  mainWindow = new BrowserWindow({
    width:1200,
    minWidth: 975,
    minHeight: 600,
    frame: false,
    icon: "icon.png",
    title: "Legends of Runeterra Deck Tracker",
    webPreferences: {
      nodeIntegration:true
    }
  })
  //mainWindow.webContents.openDevTools()
  mainWindow.loadFile("main.html");
  
  mainWindow.on('close', function (event) {
    if (config.get("exit-on-close")) {
      app.isQuiting = true;
      app.quit();
    }
    else {
      if(!app.isQuiting){
          event.preventDefault();
          mainWindow.hide();
      }
    }

    return false;
  });

  trackerWindow = new BrowserWindow({
    width: config.get("tracker-width"),
    height: config.get("tracker-height"),
    x: config.get("tracker-x"),
    y: config.get("tracker-y"),
    minWidth:173,
    icon: "icon.png",
    maximizable:false,
    transparent:true,
    frame:false,
    show:false,
    webPreferences: {
      nodeIntegration:true
    }
  })
  trackerWindow.accessibleTitle = "tracker";
  trackerWindow.loadFile('tracker.html');
  //trackerWindow.webContents.openDevTools();
  
  trackerWindow.webContents.on('did-finish-load', () => {
    trackerWindow.setVisibleOnAllWorkspaces(true);
    trackerWindow.setAlwaysOnTop(true, 'screen-saver');
    trackerWindow.setSkipTaskbar(true);
    
    if (config.get("tracker-ignore-mouse-events")) {
      trackerWindow.setIgnoreMouseEvents(true);
    }

    if(config.get("tracker-disabled")) {
      trackerWindow.hide();
    }

    trackerWindow.on('resize', () => {
      let size = trackerWindow.getSize();
      config.set("tracker-width", size[0]);
      config.set("tracker-height", size[1]);
      trackerWindow.webContents.send('resize', size[0], size[1]);
    });

    trackerWindow.on('move', () => {
      let position = trackerWindow.getPosition();
      config.set("tracker-x", position[0]);
      config.set("tracker-y", position[1]);
    });

    httpGet(url).then(res => waitingForGame(res));
  });
  
  fullCardWindow = new BrowserWindow({
    width:config.get("preview-width"),
    height:parseInt(config.get("preview-width") * 512 / 340),
    maximizable:false,
    transparent:true,
    skipTaskbar:true,
    frame:false,
    focusable:false,
    show:false,
    webPreferences: {
      nodeIntegration:true
    }
  })

  fullCardWindow.loadFile("previewCard.html");
  
  fullCardWindow.webContents.on('did-finish-load', () => {
    fullCardWindow.setVisibleOnAllWorkspaces(true);
    fullCardWindow.setSkipTaskbar(true);
    fullCardWindow.setAlwaysOnTop(true, 'screen-saver');
    fullCardWindow.setIgnoreMouseEvents(true);
  })

  graveyardWindow = new BrowserWindow({
    width: config.get("graveyard-width"),
    height: config.get("graveyard-height"),
    x: config.get("graveyard-x"),
    y: config.get("graveyard-y"),
    minWidth:173,
    icon: "icon.png",
    maximizable:false,
    transparent:true,
    frame:false,
    show:false,
    webPreferences: {
      nodeIntegration:true
    }
  })

  graveyardWindow.accessibleTitle = "graveyard";

  graveyardWindow.loadFile('graveyard.html');
  //graveyardWindow.webContents.openDevTools();

  graveyardWindow.webContents.on('did-finish-load', () => {
    graveyardWindow.setVisibleOnAllWorkspaces(true);
    graveyardWindow.setAlwaysOnTop(true, 'screen-saver');
    graveyardWindow.setSkipTaskbar(true);

    if (config.get("graveyard-ignore-mouse-events")) {
      graveyardWindow.setIgnoreMouseEvents(true);
    }
    
    if(config.get("graveyard-disabled")) {
      graveyardWindow.hide();
    }

    graveyardWindow.on('will-resize', () => {
      let size = graveyardWindow.getSize();
      config.set("graveyard-width", size[0]);
      config.set("graveyard-height", size[1]);
      graveyardWindow.webContents.send('resize', size[0], size[1]);
    });

    graveyardWindow.on('move', () => {
      let position = graveyardWindow.getPosition();
      config.set("graveyard-x", position[0]);
      config.set("graveyard-y", position[1]);
    });
  });


  oppDeckWindow = new BrowserWindow({
    width: config.get("opponent-deck-width"),
    height: config.get("opponent-deck-height"),
    x: config.get("opponent-deck-x"),
    y: config.get("opponent-deck-y"),
    minWidth:173,
    icon: "icon.png",
    maximizable:false,
    transparent:true,
    frame:false,
    show:false,
    webPreferences: {
      nodeIntegration:true
    }
  })

  oppDeckWindow.accessibleTitle = "oppDeck";

  oppDeckWindow.loadFile('oppDeck.html');

  oppDeckWindow.webContents.on('did-finish-load', () => {
    oppDeckWindow.setVisibleOnAllWorkspaces(true);
    oppDeckWindow.setAlwaysOnTop(true, 'screen-saver');
    oppDeckWindow.setSkipTaskbar(true);
    
    if (config.get("opponent-deck-ignore-mouse-events")) {
      oppDeckWindow.setIgnoreMouseEvents(true);
    }
    
    if(config.get("opponent-deck-disabled")) {
      oppDeckWindow.hide();
    }

    oppDeckWindow.on('will-resize', () => {
      let size = oppDeckWindow.getSize();
      config.set("opponent-deck-width", size[0]);
      config.set("opponent-deck-height", size[1]);
      oppDeckWindow.webContents.send('resize', size[0], size[1]);
    });

    oppDeckWindow.on('move', () => {
      let position = oppDeckWindow.getPosition();
      config.set("opponent-deck-x", position[0]);
      config.set("opponent-deck-y", position[1]);
    });
  });

  
  overlayWindow = new BrowserWindow({
    icon: "icon.png",
    transparent:true,
    frame:false,
    fullscreen:true,
    //show:false,
    webPreferences: {
      nodeIntegration:true
    }
  })

  overlayWindow.accessibleTitle = "overlay";

  overlayWindow.loadFile('overlay.html');

  overlayWindow.webContents.on('did-finish-load', () => {
    overlayWindow.setVisibleOnAllWorkspaces(true);
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    overlayWindow.setSkipTaskbar(true);
    overlayWindow.setIgnoreMouseEvents(true);

    
    if(config.get("overlay-disabled")) {
      overlayWindow.hide();
    }
  });

  ipcMain.on('preview', (event, src, x, y, window) => {
    let windowPosition;
    let windowSize;
    let windowY;
    let fullSize = fullCardWindow.getSize();

    switch (window) {
      case "tracker":
        windowPosition = trackerWindow.getPosition();
        windowSize = trackerWindow.getSize();
        break;
      case "graveyard": 
        windowPosition = graveyardWindow.getPosition();
        windowSize = graveyardWindow.getSize();
        break;
      case "oppDeck":
        windowPosition = oppDeckWindow.getPosition();
        windowSize = oppDeckWindow.getSize();
        break;
      case "main":
        windowPosition = mainWindow.getPosition();
        windowPosition[0] += x;
        windowSize = 0;
        break;
    }

    if (windowPosition[1] - (fullSize[1] / 2) + y < 0) {
      windowY = 0;
    } 
    else if (windowPosition[1] + (fullSize[1] / 2) + y > screen.getPrimaryDisplay().workAreaSize.height) {
      windowY = parseInt(screen.getPrimaryDisplay().workAreaSize.height - fullSize[1]);
    } 
    else {
      windowY = parseInt(windowPosition[1] - (fullSize[1] / 2) + y);
    }

    if (windowPosition[0] > screen.getPrimaryDisplay().workAreaSize.width / 2 || window === "main") { // config
      fullCardWindow.setPosition(windowPosition[0] - fullSize[0], windowY); 
    }
    else {
      fullCardWindow.setPosition(windowPosition[0] + windowSize[0], windowY); 
    }

    fullCardWindow.webContents.send('preview', src, x, y);
    fullCardWindow.show();
  });

  ipcMain.on('unpreview', (event) => {
    fullCardWindow.hide();
  });

  ipcMain.on('size', (event, height, window) => {
    switch (window) {
      case "tracker":
        trackerWindow.setSize(trackerWindow.getSize()[0], parseInt(height));
        break;
      case "graveyard": 
        graveyardWindow.setSize(graveyardWindow.getSize()[0], parseInt(height));
        break;
      case "oppDeck":
        oppDeckWindow.setSize(oppDeckWindow.getSize()[0], parseInt(height));
        break;
    }
  });

  ipcMain.on('hotkeySet', (event) => {
    registerHotkeys();
  });

  ipcMain.on("update", (event) => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.on("saveUpdate", (event) => {
    trackerWindow.setPosition(config.get("tracker-x"), config.get("tracker-y"));
    trackerWindow.setSize(config.get("tracker-width"), config.get("tracker-height"));
    trackerWindow.setIgnoreMouseEvents(config.get("tracker-ignore-mouse-events"));
    if (config.get("tracker-disabled")) {
      trackerWindow.hide();
    }
    else {
      if (ingame) {
        trackerWindow.show();
      }
    }

    graveyardWindow.setPosition(config.get("graveyard-x"), config.get("graveyard-y"))
    graveyardWindow.setSize(config.get("graveyard-width"), config.get("graveyard-height"));
    graveyardWindow.setIgnoreMouseEvents(config.get("graveyard-ignore-mouse-events"));
    if (config.get("graveyard-disabled")) {
      graveyardWindow.hide();
    }
    else {
      if (ingame) {
        graveyardWindow.show()
      }
    }

    oppDeckWindow.setPosition(config.get("opponent-deck-x"), config.get("opponent-deck-y"))
    oppDeckWindow.setSize(config.get("opponent-deck-width"), config.get("opponent-deck-height"));
    oppDeckWindow.setIgnoreMouseEvents(config.get("opponent-deck-ignore-mouse-events"));
    if (config.get("opponent-deck-disabled")) {
      oppDeckWindow.hide();
    }
    else {
      if (ingame) {
        oppDeckWindow.show();
      }
    }

    fullCardWindow.setSize(config.get("preview-width"), parseInt(config.get("preview-width") * 512 / 340));

  });

  registerHotkeys();

  autoUpdater.checkForUpdates();
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

function registerHotkeys() {
  globalShortcut.unregisterAll();

  globalShortcut.register(config.get("hotkey"), () => {
    if (trackerWindow.isVisible()) {
      trackerWindow.hide();
    }
    else {
      if (!config.get("tracker-disabled")) {
        trackerWindow.show();
      }
    }
    
    if (graveyardWindow.isVisible()) {
      graveyardWindow.hide();
    }
    else {
      if (!config.get("graveyard-disabled")) {
        graveyardWindow.show();
      }
    }
    
    if (oppDeckWindow.isVisible()) {
      oppDeckWindow.hide();
    }
    else {
      if (!config.get("opponent-deck-disabled")) {
        oppDeckWindow.show();
      }
    }
  })
}

const sendStatusToWindow = (text, important) => {
  log.info(text);
  if (mainWindow) {
    mainWindow.webContents.send('message', text, important, app.getVersion(), firstRun);
    if (!text.startsWith("Checking for update")) {
      firstRun = false;
    }
  }
};

const axios = require('axios');

async function httpGet(theUrl)
{
  try {
    let res = await axios({
         url: theUrl,
         method: 'get'
         }
     );
     return res.data
 }
 catch (err) {
     console.error(err);
 }
}

var url = "http://127.0.0.1:21337/positional-rectangles";
var setJson = require('./cards/set1-en_us.json');
var prevDraw;
var cardsLeft;
var height;
var handSize;
var deckCode;
var gameStartTime;
var opponentName;
var initialCardArr;
var initialIsExpedition;
var currentRectangles = [];
global.cardArr = [];
global.graveyardArr = [];
global.oppDeckArr = [];
global.deckRegions = [];
global.cardRegions = [];


function waitingForGame(r) {
  console.log("Waiting");

  if (!r) {
    setTimeout(function() {httpGet(url).then(res => waitingForGame(res));}, 500);
  }
  else {
    if ((r.GameState) === ('InProgress')) {
      opponentName = r.OpponentName;
      prevDraw = null;
      cardsLeft = 40;
      height = r.Screen.ScreenHeight;
      httpGet("http://127.0.0.1:21337/static-decklist").then(res => matchFound(res));
    }
    else
      setTimeout(function() {httpGet(url).then(res => waitingForGame(res));}, 5000);
  }
}

function matchFound(r) {
  if (!r) {
    setTimeout(function() {httpGet(url).then(res => waitingForGame(res));}, 500);
  }
  else {

    global.graveyardArr = [];
    global.oppDeckArr = [];
    currentRectangles = [];
    ingame = true;

    
    if(!config.get("tracker-disabled")) {
      trackerWindow.show();
    }
    if(!config.get("graveyard-disabled")) {
      graveyardWindow.show();
    }
    if(!config.get("opponent-deck-disabled")) {
      oppDeckWindow.show();
    }
    
    size = trackerWindow.getSize();

    gameStartTime = Date.now();

    deckCode = r.DeckCode;

    if(Object.keys(r.CardsInDeck).length > 0) {
      startTracker(size[0], size[1], r.CardsInDeck);

      graveyardWindow.webContents.send('update', "test");
      
      oppDeckWindow.webContents.send('update', "test");
    
      handSize = 4;
      trackerWindow.webContents.send('handUpdate', handSize);
    
      console.log("Waiting for Mulligan");
      httpGet(url).then(res => waitingForMulligan(res));
    }
    else {
      log.log("Searching for deck again")
      console.log("Searching for deck again")
      setTimeout(function() {httpGet("http://127.0.0.1:21337/static-decklist").then(res => matchFound(res))}, 500);
    }
  }
}

function waitingForMulligan(r, rExpedition) { //Mulligan  
  if (!r) {
    setTimeout(function() {httpGet(url).then(res => waitingForGame(res));}, 500);
  }
  else {
    var card = null;
    var firstCard = null;
    
    for (let element of r.Rectangles) {
      if ((element.Height > height / 2 - 10) && (element.Height < height / 2 + 10)) {
        card = element;
        firstCard = element.CardID;
        break;
      }
    };

    if (card == null) {
      setTimeout(function() {httpGet(url).then(res => waitingForMulligan(res));}, 1000);
    }
    else { // First Draw
      //initialIsExpedition = httpGet("http://127.0.0.1:21337/expeditions-state").IsActive;
      httpGet("http://127.0.0.1:21337/expeditions-state").then(res => initialIsExpedition = res.IsActive);
      prevDraw = card;
      
      for (let element of r.Rectangles) {

        if ((element.CardCode !== ("face")) && (element.LocalPlayer) && (element.CardID !== firstCard)) {
          cardsLeft--;
          
          let setCard = setJson.find(o => o.cardCode === element.CardCode);
          
          if (setCard.type === "Unit") 
            trackerWindow.webContents.send('update', element.CardCode, true);
          else
            trackerWindow.webContents.send('update', element.CardCode, false);
        }
      };

      console.log("Tracking Game");

      httpGet(url).then(res => trackingGame(res));
    }
  }
}

function trackingGame(r) {
  if (!r) {
    setTimeout(function() {httpGet(url).then(res => waitingForGame(res));}, 500);
  }
  else {
    var tempHandSize = 0;
    let tempCurrentRectangles = [];

    if (r.GameState !== ("InProgress")) {
      httpGet("http://127.0.0.1:21337/game-result").then(res => matchOver(res));
    }
    else {
      //let card;
      for (let element of r.Rectangles) {
        if (element.CardCode !== "face") {
          tempCurrentRectangles.push({"CardID": element.CardID, "CardCode": element.CardCode, "LocalPlayer": element.LocalPlayer});
        }

        if ((element.TopLeftY < height * 0.17)) {
          tempHandSize++;
        }
        if ((element.Height > height / 2 - 10) && (element.Height < height / 2 + 10)) {
          card = element;
          break;
        }
      };
      
      // I don't think the first condition does anything

      if (currentRectangles !== tempCurrentRectangles && tempHandSize !== 0) {
        for (let element of tempCurrentRectangles) {
          if ( !currentRectangles.find(o => o.CardID === element.CardID) && !element.LocalPlayer) {
            let card = setJson.find(o => o.cardCode === element.CardCode);

            if (card.type === "Unit" || card.type === "Spell") {
              if (oppDeckArr.find(o => o.cardCode === element.CardCode && o.localPlayer === element.LocalPlayer)) {
                let existingCard = oppDeckArr.find(o => o.cardCode === element.CardCode);
                if (!existingCard.IDs.includes(element.CardID)) {
                  existingCard.quantity++;
                  existingCard.IDs.push(element.CardID)
                }
              }
              else {
                oppDeckArr.push({
                  "cardCode": card.cardCode,
                  "mana": card.cost,
                  "quantity": 1,
                  "imageUrl": null,
                  "name": card.name,
                  "region": card.regionRef,
                  "localPlayer": element.LocalPlayer,
                  "type": card.type,
                  "isChamp": (card.supertype === "Champion"),
                  "IDs": [element.CardID],
                });
              }
            }
            oppDeckWindow.webContents.send('update', "test");
          }
        }

        for (let element of currentRectangles) {
          if ( !tempCurrentRectangles.find(o => o.CardID === element.CardID)) {//!tempCurrentRectangles.includes(element)) {
            try {
              let card = setJson.find(o => o.cardCode === element.CardCode);

              if (card.type === "Unit" || card.type === "Spell") {
                if (graveyardArr.find(o => o.cardCode === element.CardCode && o.localPlayer === element.LocalPlayer)) {
                  let existingCard = graveyardArr.find(o => o.cardCode === element.CardCode);
                  if (!existingCard.IDs.includes(element.CardID)) {
                    existingCard.quantity++;
                    existingCard.IDs.push(element.CardID)
                  }
                }
                else {
                  graveyardArr.push({
                    "cardCode": card.cardCode,
                    "mana": card.cost,
                    "quantity": 1,
                    "imageUrl": null,
                    "name": card.name,
                    "region": card.regionRef,
                    "localPlayer": element.LocalPlayer,
                    "type": card.type,
                    "IDs": [element.CardID]
                  });
                }
              }
            }
            catch(e) {
              console.log(currentRectangles)
            }
            graveyardWindow.webContents.send('update', "test");
          }
        }

        currentRectangles = tempCurrentRectangles;
      }


      if (card != null && card.CardID !== prevDraw) {
        let setCard = setJson.find(o => o.cardCode === card.CardCode);
        prevDraw = card.CardID;
        cardsLeft--;
        if (setCard.type === "Unit") 
          trackerWindow.webContents.send('update', card.CardCode, true);
        else
          trackerWindow.webContents.send('update', card.CardCode, false);
      }

      if (handSize !== tempHandSize && tempHandSize !== 0) {
        handSize = tempHandSize;
        trackerWindow.webContents.send('handUpdate', handSize);
      }

      setTimeout(function() {httpGet(url).then(res => trackingGame(res));}, 1000);
    }
  }
}

function matchOver(r) {
  if (!r)
    httpGet(url).then(res => waitingForGame(res));
  else {
    if (r.LocalPlayerWon) {
      //logGame(true);
      setTimeout(function() {httpGet("http://127.0.0.1:21337/expeditions-state").then(res => logGame(true, res))}, 3000);
    }
    else {
      //logGame(false);
      setTimeout(function() {httpGet("http://127.0.0.1:21337/expeditions-state").then(res => logGame(false, res))}, 3000);
    }
    ingame = false;

    trackerWindow.hide();
    graveyardWindow.hide();
    oppDeckWindow.hide();
    
    httpGet(url).then(res => waitingForGame(res));
  }
}

ipcMain.on("arrUpdate", (event, window, cardCode, change) => {
  if (window == graveyardWindow.accessibleTitle) {
    if (graveyardArr.find(o => o.cardCode === cardCode)) {
      graveyardArr.find(o => o.cardCode === cardCode).quantity += change;
      graveyardWindow.webContents.send('update', "test");
    }
  } 
  else if (window == oppDeckWindow.accessibleTitle) {
    if (oppDeckArr.find(o => o.cardCode === cardCode)) {
      oppDeckArr.find(o => o.cardCode === cardCode).quantity += change;
      oppDeckWindow.webContents.send('update', "test");
    }
  }
})

function startTracker(width, height, obj) {
  let keys = Object.keys(obj);
  cardsLeft = 0;
  spellsLeft = 0;
  unitsLeft = 0;
  cardArr = [];
  deckRegions = [];
  cardRegions = [];

  for (let element of keys) {

    let card = setJson.find(o => o.cardCode === element);

    for (i = 0; i < obj[element]; i++) {
        cardsLeft++;
        if (card.type === "Unit")
            unitsLeft++;
        else 
            spellsLeft++;


        if (!deckRegions.includes(card.regionRef)) {
            deckRegions.push(card.regionRef);
            cardRegions.push( {"region" : card.regionRef, "quantity" : 1})
        }
        else {
            cardRegions.find(o => o.region === card.regionRef).quantity++;
        }
    }

    cardArr.push({
      "cardCode": card.cardCode,
      "mana": card.cost,
      "quantity": obj[element],
      "imageUrl": null,
      "name": card.name,
      "region": card.regionRef,
      "type": card.type,
      "isChamp": (card.supertype === "Champion")
    });
  }


  initialCardArr = JSON.parse(JSON.stringify(Array.from(cardArr)));

  
  trackerWindow.webContents.send('start', width, height, cardsLeft, spellsLeft, unitsLeft);
}


function logGame (isMatchWin, expeditionR) {
  let decksArr = data.get('decks');
  let gamesArr = data.get('games');
  let oppRegions = [];
  let isComputer = opponentName.startsWith('decks_') || opponentName.startsWith('deckname_');
  let isExpedition = false;
  let expeditionRecord = null;

  if (isComputer && !config.get("record-ai-games")) {
    return;
  }

  if (expeditionR.State === "Picking" || expeditionR.State === "Swapping" || expeditionR.State === "Other" || expeditionR.IsActive !== initialIsExpedition) {
    isExpedition = true;
    expeditionRecord = expeditionR.Record;
    reversedArr = Array.from(decksArr).reverse();

    if (expeditionR.games == 1 || !decksArr.find( o => o.isExpedition) || JSON.stringify(deckRegions) !== JSON.stringify(reversedArr.find( o => o.isExpedition).regions)) {
      deckCode = "ex_" + Date.now();
    }
    else {
      deckCode = reversedArr.find( o => o.isExpedition).deckCode;
    }
  }
  

  if (!decksArr) {
    decksArr = [];
  }

  let currDeck = decksArr.find(o => o.deckCode === deckCode);

  if (currDeck) {
    if (isExpedition) {
      currDeck.wins = expeditionR.Wins;
      currDeck.losses = expeditionR.Losses
    }
    else {
      if (isMatchWin) {
        currDeck.wins++;
      }
      else {
        currDeck.losses++;
      }
    }
    currDeck.mostRecentPlay = Date.now();

    currDeck.expeditionRecord = expeditionRecord;

    if (isExpedition) {
      currDeck.cards = initialCardArr;
    }

    data.set("decks", decksArr.filter( o => o.deckCode !== deckCode ).concat(currDeck));
  }
  else {
    currDeck = {
      'name': null,
      'deckCode': deckCode,
      'wins': 0,
      'losses': 0,
      'mostRecentPlay': Date.now(),
      'regions': deckRegions,
      'cards': initialCardArr,
      'isExpedition': isExpedition,
      'expeditionRecord': expeditionRecord
    };

    if (isExpedition) {
      currDeck.wins = expeditionR.Wins;
      currDeck.losses = expeditionR.Losses
    }
    else {
      if (isMatchWin) {
        currDeck.wins++;
      }
      else {
        currDeck.losses++;
      }
    }

    data.set("decks", decksArr.concat(currDeck));
  }

  for (let oppCard of oppDeckArr) {
    if (!oppRegions.includes(oppCard.region)) {
      oppRegions.push(oppCard.region);
    }
  }
  
  let gameObj = {
    "deckCode": deckCode,
    "isWin": isMatchWin,
    "timePlayed": Date.now(),
    "opponentName": opponentName,
    "gameLength": Date.now() - gameStartTime,
    "oppCards": oppDeckArr,
    "oppRegions": oppRegions,
    "isComputer": isComputer
  }

  if (gamesArr) {
    data.set("games", gamesArr.concat(gameObj));
  }
  else {
    data.set("games", [gameObj]);
  }

  
  mainWindow.webContents.send('update');
}