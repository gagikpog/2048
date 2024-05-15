export function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        const version = 0;
        isCurrentVersion(version).then((done) => {
            if (!done) {
                console.log('Service Worker: Version changed');
                unregister().then((needReload) => {
                    if (needReload) {
                        // @ts-ignore
                        window.navigation.reload();
                        return;
                    }
                    return register(version);
                }).catch((error) => {
                    console.log('Service Worker: Update failed with' + error);
                });
            }
        });
    }
}

function register(version: number): Promise<boolean> {
    return navigator.serviceWorker.register(`/sw.js?v=${version}`)
        .then((reg) => {
            console.log('Service Worker: Registration succeeded. Scope is ' + reg.scope);
            return true;
        }).catch((error) => {
            console.log('Service Worker: Registration failed with ' + error);
            return false;
        });
}

function unregister(): Promise<boolean> {
    return navigator.serviceWorker.getRegistrations()
        .then((regList) => Promise.all(regList.map((reg) => reg.unregister())))
        .then((res) => res.length ? res.every(Boolean) : false)
        .catch(() => false);
}

function isCurrentVersion(version: number): Promise<boolean> {
    return navigator.serviceWorker.getRegistrations()
        .then((regList) => {
            return !!regList.find((reg) => {
                return reg.active?.state === 'activated' && compareVersion(reg.active?.scriptURL, version);
            });
        })
        .catch(() => false);
}

function compareVersion(url: string, version: number): boolean {
    try {
        const ver = new URL(url).searchParams.get('v');
        return Number(ver) === version;
    } catch (error) {
        return false;
    }
}
