window.Auth = (function() {
  
  // PLACEHOLDER: The user will need to add their Firebase Config here
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
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

  function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
    
    try {
      if (isMobile) {
        firebase.auth().signInWithRedirect(provider);
      } else {
        firebase.auth().signInWithPopup(provider);
      }
    } catch(e) {
      console.error("Sign in error", e);
      alert("Sign in failed. Ensure Firebase config is set.");
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
