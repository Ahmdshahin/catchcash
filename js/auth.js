window.Auth = (function() {
  const CLIENT_ID = "369176326066-jqhu4je0a4n1hrjl7dkkbkugqpcpuvsp.apps.googleusercontent.com";
  let currentUser = null;
  let onSignInCallback = null;
  let onSignOutCallback = null;

  function init(onSignIn, onSignOut) {
    onSignInCallback = onSignIn;
    onSignOutCallback = onSignOut;
    
    // Check if session exists in localStorage
    const savedSession = localStorage.getItem('catchcash_user_session');
    if (savedSession) {
      try {
        currentUser = JSON.parse(savedSession);
        if (onSignInCallback) onSignInCallback(currentUser);
      } catch (e) {
        localStorage.removeItem('catchcash_user_session');
      }
    }
    
    // Initialize GSI when library loads
    if (window.google && window.google.accounts) {
      initGSI();
    } else {
      // Polling for GSI to load (since async defer)
      const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(interval);
          initGSI();
        }
      }, 100);
    }
  }

  function initGSI() {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: true
    });
    
    const btnContainer = document.getElementById('gsi-button-container');
    if (btnContainer) {
      window.google.accounts.id.renderButton(
        btnContainer,
        { theme: document.body.classList.contains('light-mode') ? 'outline' : 'filled_black', size: 'large', shape: 'pill', width: 250 }
      );
    }
  }

  function handleCredentialResponse(response) {
    try {
      const payload = decodeJwt(response.credential);
      currentUser = {
        uid: payload.sub,
        name: payload.name || 'User',
        email: payload.email,
        photoURL: payload.picture
      };
      
      localStorage.setItem('catchcash_user_session', JSON.stringify(currentUser));
      if (onSignInCallback) onSignInCallback(currentUser);
      
    } catch (e) {
      console.error("Error parsing JWT:", e);
      alert('Sign in failed.');
    }
  }

  function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  function signOut() {
    currentUser = null;
    localStorage.removeItem('catchcash_user_session');
    
    // Revoke auto-select
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    if (onSignOutCallback) onSignOutCallback();
  }

  function getCurrentUser() {
    return currentUser;
  }

  function getUid() {
    return currentUser ? currentUser.uid : null;
  }

  return {
    init,
    signOut,
    getCurrentUser,
    getUid
  };
})();
