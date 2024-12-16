# Web Authentication demo
A demo of passwordless authentication using Web Authentication (WebAuthn).

## Running the demo
This demo requires both the frontend and backend to run as HTTPS 
so you will need a SSL certificate.

Make sure you have `openssl` installed.

To generate a self-signed certificate, run the following command:

```
npm run generate-cert
```
This will generate a self-signed certificate and place all the 
needed files in the `ssl` folder.

After that you will need to make your device trust the certificate.

On MacOS you do this by opening the Keychain Access app and then 
click `System` under `System Keychains` in the menu on the left.

Click the `Certificates` tab in the top menu and then drag the 
file `localhost-cert.pem` in the `ssl` folder onto the Keychain 
Access app.

Then double-click the certificate you just added, find the `Trust` 
section and click the arrow to open it.

In the select box labeled "When using this certificate", select 
"Always trust".

For Windows, refer to [this link](https://aboutssl.org/installing-self-signed-ca-certificate-in-window/).

To get the demo running in Firefox you will first need to visit 
`about:config` and then search for the `security.enterprise_roots.enabled` 
option.

Click the toggle icon on its row to set the value to `true`.

Run `npm install` once, then `npm start` and then visit 
[https://localhost:8080](https://localhost:8080) to see the 
demo page.

For a detailed explanation see [my article on Medium](https://medium.com/@dannymoerkerke/its-time-to-kill-the-password-bbab40f36ba0?sk=86bde9ea8ef9c2de5c405f35ae08fc6b)

The WebAuthn server will be running on [https://localhost:3000](https://localhost:3000)
