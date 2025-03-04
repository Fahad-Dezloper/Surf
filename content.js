(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted on this page");
    } catch (error) {
        console.error("Microphone access denied:", error);
    }
})();
