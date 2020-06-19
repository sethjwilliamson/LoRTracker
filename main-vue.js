var Vue = require('vue');

const { listenForLogin, firebaseLogout } = require('./runetiera-firebase-network.js');

module.exports = {
    newVue: function() {
        return new Vue({
            el: '#vueApp',
            data: {
                user: {},
                credentialString: '',
            },
            mounted() {
                listenForLogin(this);
            },
            methods: {
                signIn() {
                // Build Firebase credential from the copied string.
                const credential = firebase.auth.AuthCredential.fromJSON(
                    atob(this.credentialString)
                );

                // Sign in with credential from the Google user.
                firebase
                    .auth()
                    .signInWithCredential(credential)
                    .catch(function (error) {
                    console.warn('error', error);
                    });
                },
                async signOut() {
                await firebaseLogout();
                this.user.id = '';
                },
            },
        });
    },

    exportCredentialString: async function () {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    return JSON.stringify(result.credential.toJSON());
    }
}