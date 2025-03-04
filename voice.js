const startVoiceRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            document.getElementById("response").textContent = "Listening... Speak your command";
        };

        recognition.onresult = (event) => {
            const userCommand = event.results[0][0].transcript;
            document.getElementById("response").textContent = `Recognized: ${userCommand}`;
            getCommandFromLLM(userCommand);
        };

        recognition.onerror = (event) => {
            document.getElementById("response").textContent = `Error occurred: ${event.error}`;
        };

        recognition.onend = () => {
            document.getElementById("response").textContent = "Voice recognition ended";
        };

        recognition.start();
    } else {
        document.getElementById("response").textContent = "Speech recognition not supported";
    }
};
