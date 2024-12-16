const registerButton = document.querySelector('#register-button');
const authenticateButton = document.querySelector('#authenticate-button');
const deleteButton = document.querySelector('#delete-button');
const loader = document.querySelector('#loader');
const authDialog = document.querySelector('#auth-dialog');
const dialogBody = authDialog.querySelector('[slot="body"]');
const closeButton = document.querySelector('#close-dialog');

closeButton.addEventListener('click', () => {
  authDialog.close();
});

const bufferToBase64 = buffer => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToBuffer = base64 => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

const removeCredential = () => {
  localStorage.removeItem('credential');
  deleteButton.style.display = 'none';
  authenticateButton.style.display = 'none';
  registerButton.style.display = 'block';
};

const apiUrl = 'https://localhost:3000';

const register = async () => {
  registerButton.disabled = true;
  loader.style.display = 'block';

  try {
    const credentialCreationOptions = await (await fetch(`${apiUrl}/registration-options`, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })).json();

    credentialCreationOptions.challenge = new Uint8Array(credentialCreationOptions.challenge.data);
    credentialCreationOptions.user.id = new Uint8Array(credentialCreationOptions.user.id.data);
    credentialCreationOptions.user.name = 'pwa@example.com';
    credentialCreationOptions.user.displayName = 'What PWA Can Do Today';

    const credential = await navigator.credentials.create({
      publicKey: credentialCreationOptions
    });

    const credentialId = bufferToBase64(credential.rawId);

    localStorage.setItem('credential', JSON.stringify({credentialId}));

    const data = {
      rawId: credentialId,
      response: {
        attestationObject: bufferToBase64(credential.response.attestationObject),
        clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        id: credential.id,
        type: credential.type
      }
    };

    await (await fetch(`${apiUrl}/register`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({credential: data}),
      credentials: 'include'
    })).json();

    registerButton.style.display = 'none';
    authenticateButton.style.display = 'block';
    deleteButton.style.display = 'block';

    dialogBody.innerHTML = 'Registration successful!';
    authDialog.open();
  }
  catch(e) {
    console.error('registration failed', e);

    dialogBody.innerHTML = 'Registration failed';
    authDialog.open();
  }
  finally {
    registerButton.disabled = false;
    loader.style.display = 'none';
  }
};

const authenticate = async () => {
  authenticateButton.disabled = true;
  deleteButton.disabled = true;
  loader.style.display = 'block';

  try {
    const credentialRequestOptions = await (await fetch(`${apiUrl}/authentication-options`, {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })).json();

    const {credentialId} = JSON.parse(localStorage.getItem('credential'));

    credentialRequestOptions.challenge = new Uint8Array(credentialRequestOptions.challenge.data);
    credentialRequestOptions.allowCredentials = [
      {
        id: base64ToBuffer(credentialId),
        type: 'public-key',
        transports: ['internal']
      }
    ];

    const credential = await navigator.credentials.get({
      publicKey: credentialRequestOptions
    });

    const data = {
      rawId: bufferToBase64(credential.rawId),
      response: {
        authenticatorData: bufferToBase64(credential.response.authenticatorData),
        signature: bufferToBase64(credential.response.signature),
        userHandle: bufferToBase64(credential.response.userHandle),
        clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        id: credential.id,
        type: credential.type
      }
    };

    const response = (await fetch(`${apiUrl}/authenticate`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({credential: data}),
      credentials: 'include'
    }));

    if(response.status === 404) {
      dialogBody.innerHTML = 'Credential has expired, please register a new credential';

      authDialog.open();
      removeCredential();
    }
    else {
      const assertionResponse = await response.json();

      dialogBody.innerHTML = 'Authentication successful!';
      authDialog.open();
    }
  }
  catch(e) {
    console.error('authentication failed', e);

    dialogBody.innerHTML = 'Authentication failed';
    authDialog.open();
  }
  finally {
    authenticateButton.disabled = false;
    deleteButton.disabled = false;
    loader.style.display = 'none';
  }
};

const hasCredential = localStorage.getItem('credential') !== null;

if(hasCredential) {
  authenticateButton.style.display = 'block';
  deleteButton.style.display = 'block';
}
else {
  registerButton.style.display = 'block';
}

registerButton.addEventListener('click', register);
authenticateButton.addEventListener('click', authenticate);
deleteButton.addEventListener('click', removeCredential);
