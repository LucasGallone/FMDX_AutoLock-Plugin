(() => {
    const hideNaN = setInterval(() => {
        const sig = document.getElementById('data-signal');
        const dec = document.getElementById('data-signal-decimal');
        
        if (sig && sig.textContent.includes('NaN')) sig.textContent = '';
        if (dec && dec.textContent.includes('undefined')) dec.textContent = '';
        
        if (sig && sig.textContent !== '' && !sig.textContent.includes('NaN')) {
            clearInterval(hideNaN);
        }
    }, 10);

    const urlParams = new URLSearchParams(window.location.search);
    let lockKey = null;
    for (const [key, value] of urlParams.entries()) {
        if (key.toLowerCase() === 'lockkey') {
            lockKey = value;
            break;
        }
    }

    if (lockKey) {
        sessionStorage.setItem('AutoLock_Key', lockKey);
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    } else {
        lockKey = sessionStorage.getItem('AutoLock_Key');
    }

    if (!lockKey) return; 

    if (sessionStorage.getItem('AutoLock_Toast') === 'true') {
        sessionStorage.removeItem('AutoLock_Toast');
        setTimeout(() => {
            if (typeof window.sendToast === "function") {
                const toastId = window.sendToast('success', 'AutoLock Plugin', 'Tuning is now locked.', false, true);
                setTimeout(() => {
                    const toastEl = document.getElementById(toastId);
                    if (toastEl) toastEl.remove();
                }, 5000);
            }
        }, 500); 
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const pathname = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const dataWsUrl = `${wsProtocol}//${window.location.host}${pathname}data_plugins`;
    const textWsUrl = `${wsProtocol}//${window.location.host}${pathname}text`;
    
    let dataWs;
    const myClientId = "ID_" + Math.random().toString(36).substr(2, 9);
    let isReloading = false;

    function init() {
        dataWs = new WebSocket(dataWsUrl);
        dataWs.onopen = () => {
            dataWs.send(JSON.stringify({
                type: 'AutoLock',
                value: { action: 'login', key: lockKey, clientId: myClientId }
            }));
        };

        dataWs.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.type === 'AutoLock_OK' && msg.clientId === myClientId) {
                    const keyIcon = document.querySelector('.fa-key');
                    
                    if (!keyIcon) {
                        sessionStorage.setItem('AutoLock_Toast', 'true');
                        isReloading = true;
                        window.location.reload();
                    } else {
                        if (!sessionStorage.getItem('AutoLock_ToastShown')) {
                            if (typeof window.sendToast === "function") {
                                const toastId = window.sendToast('success', 'AutoLock Plugin', 'Tuning is now locked.', false, true);
                                setTimeout(() => {
                                    const toastEl = document.getElementById(toastId);
                                    if (toastEl) toastEl.remove();
                                }, 5000);
                            }
                            sessionStorage.setItem('AutoLock_ToastShown', 'true');
                        }
                    }
                }
            } catch (err) {}
        };
        dataWs.onclose = () => setTimeout(init, 3000);
    }

    function auth() {
        if (document.querySelector('.logout-link')) return;

        fetch('./login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'password=' + encodeURIComponent(lockKey)
        });

        const authWs = new WebSocket(textWsUrl);
        authWs.onopen = () => {
            authWs.send(JSON.stringify({ password: lockKey }));
            setTimeout(() => authWs.close(), 1000);
        };
    }

    window.addEventListener('pagehide', () => {
        if (isReloading) return;
        if (dataWs && dataWs.readyState === WebSocket.OPEN) {
            dataWs.send(JSON.stringify({
                type: 'AutoLock',
                value: { action: 'logout', key: lockKey, clientId: myClientId }
            }));
        }
    });
	
    document.addEventListener('click', (e) => {
        if (e.target.closest('.logout-link')) {
            sessionStorage.removeItem('AutoLock_Key');
        }
    });

    init();
    auth();
})();