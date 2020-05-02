// Modules to control application life and create native browser window
const {app, BrowserWindow, remote} = require('electron');
const path = require('path');
const {ipcMain, screen} = require('electron');
var mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 172,
    height: 800,
    minWidth:172,
    icon: "./icon.png",
    maximizable:false,
    //backgroundColor:'#7F3300',
    transparent:true,
    frame:false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration:true
    }
  })


  // and load the index.html of the app.
  mainWindow.loadFile('index.html');


  
  testWindow = new BrowserWindow({
    width:340,
    height:512,
    maximizable:false,
    //backgroundColor:'#7F3300',
    transparent:true,
    skipTaskbar:true,
    frame:false,
    focusable:false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration:true
    }
  })
  testWindow.loadFile("./previewCard.html");
  
  testWindow.webContents.on('did-finish-load', () => {
    testWindow.setVisibleOnAllWorkspaces(true);
    testWindow.setAlwaysOnTop(true, 'screen-saver');
    testWindow.setIgnoreMouseEvents(true);
    testWindow.hide();
  })

  ipcMain.on('preview', (event, src, x, y) => {
    mainPos = mainWindow.getPosition();
    if (mainPos[0] > screen.getPrimaryDisplay().workAreaSize.width / 2) { // config
      testWindow.setPosition(mainPos[0] - 340, mainPos[1] - 210 + y); 
    }
    else {
      testWindow.setPosition(mainPos[0] + mainWindow.getSize()[0], mainPos[1] - 210 + y); 
    }
    testWindow.webContents.send('preview', src, x, y);
    testWindow.show();
  });

  ipcMain.on('unpreview', (event) => {
    testWindow.hide();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setVisibleOnAllWorkspaces(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    //mainWindow.setIgnoreMouseEvents(true);

    mainWindow.on('resize', () => {
      var size = mainWindow.getSize();
      mainWindow.webContents.send('resize', size[0], size[1]);
    });

    httpGet(url).then(res => waitingForGame(res));
  });
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
//var XMLHttpRequest = require('xhr2');
//const https = require('https');

///ipcMain.on( "setCardArr", ( event, cardArr ) => {
///  global.cardArr = cardArr;
///} );

const axios = require('axios');


async function httpGet(theUrl)
{
  try {
    let res = await axios({
         url: theUrl,
         method: 'get'
         }
     );
     // Don't forget to return something   
     return res.data
 }
 catch (err) {
     console.error(err);
 }
}

var url = "http://127.0.0.1:21337/positional-rectangles";
var prevDraw;
var cardsLeft;
var height;
var handSize = 0;
global.decklist = [];
///global.cardArr;


function waitingForGame(r) {
  console.log("Waiting");

  if ((r.GameState) === ('InProgress')) {
    prevDraw = null;
    cardsLeft = 40;
    height = r.Screen.ScreenHeight;
    httpGet("http://127.0.0.1:21337/static-decklist").then(res => matchFound(res));
  }
  else
    setTimeout(function() {httpGet(url).then(res => waitingForGame(res));}, 5000);
}

function matchFound(r) {
  console.log(decklist);
  global.decklist = r.CardsInDeck;
  console.log(decklist);

  mainWindow.show();
  
  //mainWindow.webContents.on('did-finish-load', () => {
  size = mainWindow.getSize();
  mainWindow.webContents.send('start', size[0], size[1]);
  //});

  console.log("Waiting for Mulligan");
  httpGet(url).then(res => waitingForMulligan(res));
}

function waitingForMulligan(r) { //Mulligan  
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
  else {
    //print("First Draw" + item['CardCode'])

    prevDraw = card;
    
    for (let element of r.Rectangles) {

      if ((element.CardCode !== ("face")) && (element.LocalPlayer) && (element.CardID !== firstCard)) {
        console.log(element.CardCode);
        cardsLeft--;

        
      if (element.type === "Unit") 
        mainWindow.webContents.send('update', element.CardCode, true);
      else
        mainWindow.webContents.send('update', element.CardCode, false);
        //mainWindow.webContents.send('update', element.CardCode);
        //decklist[element.CardCode]--;
      }
    };

    console.log("Tracking Game");

    httpGet(url).then(res => trackingGame(res));

    //trackingGame();
  }
}

function trackingGame(r) {
  var tempHandSize = 0;

  if (r.GameState !== ("InProgress")) 
    httpGet("http://127.0.0.1:21337/game-result").then(res => matchOver(res));
    //matchOver();

  else {
    for (let element of r.Rectangles) {
      if ((element.TopLeftY < height * 0.17)) {
        tempHandSize++;
      }
      if ((element.Height > height / 2 - 10) && (element.Height < height / 2 + 10)) {
        card = element;
        break;
      }
    };

    if (card != null && card.CardID !== prevDraw) {
      prevDraw = card.CardID;
      cardsLeft--;
      if (card.type === "Unit") 
        mainWindow.webContents.send('update', card.CardCode, true);
      else
        mainWindow.webContents.send('update', card.CardCode, false);
    }

    //setTimeout(trackingGame, 1000);
    setTimeout(function() {httpGet(url).then(res => trackingGame(res));}, 1000);
  }

  if (handSize !== tempHandSize && tempHandSize !== 0) {
    handSize = tempHandSize;
    mainWindow.webContents.send('handUpdate', handSize);
  }
}

function matchOver(r) {
  r = r.LocalPlayerWon;
  if (r)
    console.log("Victory");
  else
    console.log("Defeat");

  mainWindow.hide();
  
  httpGet(url).then(res => waitingForGame(res));
}