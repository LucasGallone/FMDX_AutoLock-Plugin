# AutoLock Plugin for FM-DX Webservers
This plugin allows a user to easily lock the tuning of an [FM-DX webserver](https://github.com/NoobishSVK/fm-dx-webserver) using a URL argument.
<br>
Unlocking is then automatic as soon as the user logs out.

<img width="1917" height="1030" alt="Exemple-AutoLock" src="https://github.com/user-attachments/assets/5768f87e-3191-4b61-8701-85b0ebfbb2a4" />

## How the plugin works
After installing this plugin, the user can instantly lock their FM-DX server's tuning at any time using the `?LockKey=` argument (case-insensitive), followed by their "Tune" Password (previously configured in the server's administration interface).
<br>
<br>
Example: `https://mytefwebserver.com/?LockKey=tunepassword123`
<br>
<br>
For example, a practical use case is for a user to add a bookmark to their web browser with the argument `?LockKey=`, which will lock the server immediately upon access. They will then be the only one able to control the server, since the connection to the server interface with the Tuning privileges is automated.
<br>
<br>
The server's tuning will automatically unlock 10 seconds after the user who used the argument leaves the server.
<br>
<br>
The plugin keeps track of activations and deactivations by writing logs to the console.
<br>
These logs also include unsuccessful attempts to lock the tuning with an incorrect key, along with the IP address of the user who used the argument.

## Installation instructions
<b>⚠️ Important: Make sure you have configured a "Tune" password beforehand in the admin interface of your FM-DX server, otherwise the plugin will not work!</b>
<br>
<br>
1 - [Download the entire repository as a ZIP file by clicking here.](https://github.com/LucasGallone/FMDX_AutoLock-Plugin/archive/refs/heads/main.zip)
<br>
<br>
2 - Extract the ZIP file content.
<br>
<br>
3 - Place the `AutoLock-Plugin.js` file and the `AutoLock` folder (which contains `AutoLock.js` and `AutoLock_server.js`) in the `plugins` folder of your FM-DX webserver.
<br>
<br>
4 - Restart your FM-DX webserver.
<br>
<br>
5 - Access your webserver's configuration panel using the admin account, click "Plugins" and select "AutoLock by Lucas Gallone" in the plugins list, then save the changes.
<br>
<br>
6 - Restart your FM-DX webserver again. You should see in the console that the plugin has loaded successfully.
<br>
All you need to do now is use the `?LockKey=` argument in the URL, followed by your "Tune" password to lock the tuning.
<br>
<br>
<i>Note: It is perfectly normal not to see an icon in the plugin table at the top of your server's main page.
<br>
The plugin is designed to be discreet.</i>
