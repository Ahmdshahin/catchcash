window.Auth = (function() {
  
  // PLACEHOLDER: The user will need to add their Firebase Config here
const firebaseConfig = {
  apiKey: "AIzaSyAuxnhxEdJtDy66TxxwGfu8RrJawuH889I",
  authDomain: "catch-cash-app.firebaseapp.com",
  projectId: "catch-cash-app",
  storageBucket: "catch-cash-app.firebasestorage.app",
  messagingSenderId: "965129090008",
  appId: "1:965129090008:web:57ece0a194fdc470d9b8ad",
  measurementId: "G-CN4FR6C64X"
};

  let currentUser = null;
  let onSignInCallback = null;
  let onSignOutCallback = null;

  function init(onSignIn, onSignOut) {
    onSignInCallback = onSignIn;
    onSignOutCallback = onSignOut;

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          currentUser = {
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL
          };
          if (onSignInCallback) onSignInCallback(currentUser);
        } else {
          currentUser = null;
          if (onSignOutCallback) onSignOutCallback();
        }
      });

      // Handle redirect result for mobile
      firebase.auth().getRedirectResult().catch(error => {
        console.error("Auth redirect error:", error);
      });
    } catch (e) {
      console.warn("Firebase not configured correctly yet.", e);
    }
  }

  async function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
    
    try {
      if (isMobile) {
        await firebase.auth().signInWithRedirect(provider);
      } else {
        await firebase.auth().signInWithPopup(provider);
      }
    } catch(e) {
      console.error("Sign in error", e);
      alert("Sign in failed. Ensure Firebase config is set and that you are serving this website from a web server (e.g. localhost) rather than opening the file directly.");
    }
  }

  function signOut() {
    try {
      firebase.auth().signOut();
    } catch(e) {
      console.error("Sign out error", e);
    }
  }

  function getCurrentUser() {
    return currentUser;
  }

  function getUid() {
    return currentUser ? currentUser.uid : null;
  }

  return {
    init,
    signIn,
    signOut,
    getCurrentUser,
    getUid
  };
})();
