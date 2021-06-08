// In development, always fetch from the network and do not enable offline support.
// This is because caching would make development more difficult (changes would not
// be reflected on the first load after each change).
self.addEventListener('fetch', () => { });

let handler;

window.Connection = {
    Initialize: function (interop) {

        handler = function () {
            interop.invokeMethodAsync("Connection.StatusChanged", navigator.onLine);
        }

        window.addEventListener("online", handler);
        window.addEventListener("offline", handler);

        handler(navigator.onLine);
    },
    Dispose: function () {

        if (handler != null) {

            window.removeEventListener("online", handler);
            window.removeEventListener("offline", handler);
        }
    }
};

window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    // Stash the event so it can be triggered later.
    // where you store it is up to you
    window.PWADeferredPrompt = e;
    // Notify C# Code that it can show an alert 
    // MyBlazorInstallMethod must be [JSInvokable]
    DotNet.invokeMethodAsync("MyBlazorAssembly", "MyBlazorInstallMethod");
});

window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    hideInstallPromotion();
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
    // Optionally, send analytics event to indicate successful install
    console.log('PWA was installed');
});

window.BlazorPWA = {
    installPWA: function () {
        if (window.PWADeferredPrompt) {
            // Use the stashed event to continue the install process
            window.PWADeferredPrompt.prompt();
            window.PWADeferredPrompt.userChoice
                .then(function (choiceResult) {
                    window.PWADeferredPrompt = null;
                });
        }
    }
};