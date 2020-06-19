var firebase = require('firebase');
var Vue = require('vue');
const Store = require('electron-store');
const config = new Store();
var test = false;

const firebaseConfig = {
    apiKey: 'AIzaSyBMQKaakJbv0H1D-vNj1aA8ebS0IcsQemA',
    authDomain: 'runetiera.firebaseapp.com',
    databaseURL: 'https://runetiera.firebaseio.com',
    projectId: 'runetiera',
    storageBucket: 'runetiera.appspot.com',
    messagingSenderId: '533615885683',
    appId: '1:533615885683:web:a39e1fe7c2a5754827d906',
    measurementId: 'G-28YZE23KHB',
};
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    //firebase.analytics();
  }
  const db = firebase.firestore();
  console.log(db);
  
  // User structure: {id: xxx, runs: [{expedition}... ]}
  // May return null.
module.exports = {
    getUser: async function (userId) {
    const doc = await db.collection('users').doc(userId).get();
    return doc.data();
  },
  
  updateUser: async function (userId, toUpdate) {
    toUpdate.lastUpdateTime = Date.now();
    return await db.collection('users').doc(userId).update(toUpdate);
  },
  
  getAllUsers: async function () {
    const usersQuery = await db.collection('users').get();
    const users = [];
    usersQuery.forEach((user) => users.push(user.data()));
    return users;
  },
  
  // Returns whether the run was successfully saved.
  saveRun: async function (expedition, user) {
    if (expedition.userId && expedition.userId != user.id) {
      swal('Huh.', 'That expedition already belongs to someone else!', 'error');
      return false;
    }
  
    const runIndex = user.runs.findIndex((e) => e.id == expedition.id);
    if (runIndex >= 0) {
      const oldExpedition = user.runs[runIndex];
      // Copy over old metadata, if found.
      expedition.time = oldExpedition.time ? oldExpedition.time : Date.now();
      expedition.userId = oldExpedition.userId ? oldExpedition.userId : user.id;
      // Reactive equivalent of: user.runs[runIndex] = expedition;
      Vue.set(user.runs, runIndex, expedition);
    } else {
      // New run for this user; save run metadata.
      expedition.time = Date.now();
      expedition.userId = user.id;
      user.runs.push(expedition);
    }
  
    // Denormalize project id & name to Users table
    // TODO: If there are too many runs for a user, migrate to subcollections.
    await db.collection('users').doc(user.id).update({
      runs: user.runs,
      lastUpdateTime: Date.now(),
    });
  
    // Save the run itself
    await db.collection('runs').doc(expedition.id).set(expedition);
  
    return true;
  },
  
  loadRun: async function (id) {
    const doc = await db.collection('runs').doc(id).get();
    return doc.data();
  },
  
  getCollection: async function (userId) {
    const doc = await db.collection('collections').doc(userId).get();
    return doc.data();
  },
  
  // A collection is a map of {cardId: cardCount, ...}
  saveCollection: async function (userId, collection) {
    await db
      .collection('users')
      .doc(userId)
      .update({ lastUpdateTime: Date.now() });
    collection.lastUpdateTime = Date.now();
    return await db.collection('collections').doc(userId).set(collection);
  },
  
  getAllCollections: async function () {
    const usersQuery = await db.collection('collections').get();
    const collections = {};
    usersQuery.forEach((doc) => (collections[doc.id] = doc.data()));
    console.log(collections);
    return collections;
  },
  
  
  listenForLogin: function (vueApp) {
    // Load the persisted user object, if possible.
    console.log("test1")
    const authUser = config.get("AUTH_USER_KEY");
    if (authUser) {
      vueApp.user = JSON.parse(authUser);
      console.log(authUser)
    }
  
    if (test) {
      enterSudo(vueApp, sudoUserId());
      console.log("test3")
      return;
    }
  
    firebase.auth().onAuthStateChanged(async function (user) {
      
      console.log(user)
      if (user) {
        
        console.log("test5")
        let fetchedUser = await getUser(user.uid);
        if (!fetchedUser) {
          // User just created an account; save them to our database.
          fetchedUser = {
            id: user.uid,
            runs: [],
            name: user.displayName,
            email: user.email,
            createTime: Date.now(),
            lastUpdateTime: Date.now(),
          };
          await db.collection('users').doc(fetchedUser.id).set(fetchedUser);
        } else {
          // Just update the email and name provided by Firebase Auth.
          fetchedUser.name = user.displayName;
          fetchedUser.email = user.email;
        }
        vueApp.user = fetchedUser;
        // Persist to local storage, to reduce login blink.
        // Note: Cap on size is ~5mb; each run adds 3-4kb. Maybe revisit when a user has 1k runs.
        config.set("AUTH_USER_KEY", JSON.stringify(fetchedUser));
      }
    });
  },
  
  firebaseLogout: async function () {
    firebase.analytics().logEvent('logout');
    await firebase.auth().signOut();
    config.delete("AUTH_USER_KEY");
  },
  
  sudoUserId: function () {
    return config.get("SUDO_UID_KEY");
    test = true;
  },
  
  enterSudo: async function (vueApp, userId) {
    vueApp.user = await getUser(userId);
    config.set("SUDO_UID_KEY", userId);
    config.set("AUTH_USER_KEY", JSON.stringify(vueApp.user));
  },
  
  exitSudo: function () {
    config.delete("SUDO_UID_KEY");
    config.delete("AUTH_USER_KEY");
  },
  
  runUrl: function (runId) {
    const parsedUrl = new URL(window.location.href);
    return `${parsedUrl.origin}/draft-viewer?run=${runId}`;
  },
  
  loadFromCache: async function (reference) {
    const db = firebase.firestore();
    const doc = await db.collection('rooms').doc(reference).get();
    return doc.data() ? doc.data().cache : null;
  },
  
  saveToCache: async function (reference, json) {
    const db = firebase.firestore();
    return await db.collection('rooms').doc(reference).set({ cache: json });
  },
  
  sendMail: async function (to, subject, text, html, live = false) {
    const email = {
      to,
      message: {
        subject,
        text,
        html,
      },
    };
    if (live) {
      await db.collection('mail').add(email);
    }
    return email;
  },
  
  sendMailObject: async function (email) {
    await db.collection('mail').add(email);
  }
}