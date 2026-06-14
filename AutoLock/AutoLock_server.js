const fs = require('fs');
const path = require('path');
const { logInfo, logWarn, logError } = require('../../server/console');

const configPath = path.resolve(__dirname, '../../config.json');

let apiData, pluginsApi, serverConfig, mainWss, pluginsWss;

try {
    apiData = require('../../server/datahandler');
    pluginsApi = require('../../server/plugins_api');
    serverConfig = pluginsApi.getServerConfig?.(); 
    mainWss = pluginsApi.getWss?.();
    pluginsWss = pluginsApi.getPluginsWss?.();
} catch (e) {
    logWarn("[AutoLock] ERROR: Unable to link server components.");
}

if (!serverConfig) serverConfig = require('../../config.json');

let unlockTimer = null;
let activeLockWs = null;

function applyTotalLock(state) {
    try {
        if (serverConfig) serverConfig.publicTuner = state;
        if (apiData && apiData.initialData) apiData.initialData.publicTuner = state;

        const fileCfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        fileCfg.publicTuner = state;
        fs.writeFileSync(configPath, JSON.stringify(fileCfg, null, 2), 'utf8');

        if (mainWss && mainWss.clients) {
            const msg = JSON.stringify({ publicTuner: state });
            mainWss.clients.forEach(c => {
                if (c.readyState === 1) c.send(msg);
            });
        }
        
        if (state === false) {
            logInfo(`[AutoLock] Tuning is now LOCKED.`);
        } else {
            logInfo(`[AutoLock] The user has left the server. Tuning is now UNLOCKED.`);
        }
    } catch (err) {
        logError(`[AutoLock] ERROR: ${err.message}`);
    }
}

if (pluginsWss) {
    pluginsWss.on('connection', (ws, req) => {
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'Unknown IP';

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type !== 'AutoLock') return;

                const tunePass = serverConfig?.password?.tunePass;
                if (!tunePass || tunePass === "") return;

                const { action, key, clientId } = msg.value;

                if (key !== tunePass) {
                    if (action === 'login') logWarn(`[AutoLock] Tuning lock request denied (Invalid key) - IP: ${ip}`);
                    return;
                }

                if (action === 'login') {
                    activeLockWs = ws;
                    
                    if (serverConfig && serverConfig.publicTuner === false) {
                        ws.send(JSON.stringify({ type: 'AutoLock_OK', clientId }));
                        return;
                    }

                    logInfo(`[AutoLock] Tuning lock request accepted - IP: ${ip}`);
                    applyTotalLock(false);
                    ws.send(JSON.stringify({ type: 'AutoLock_OK', clientId }));

                    if (unlockTimer) {
                        clearTimeout(unlockTimer);
                        unlockTimer = null;
                    }
                }
            } catch (e) {}
        });

        ws.on('close', () => {
            if (activeLockWs === ws) {
                activeLockWs = null; 
                
                if (unlockTimer) clearTimeout(unlockTimer);
                unlockTimer = setTimeout(() => {
                    if (!activeLockWs) {
                        applyTotalLock(true);
                    }
                    unlockTimer = null;
                }, 10000);
            }
        });
    });
}
module.exports = {};