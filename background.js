let recognition;
const apiKey = "YOUR_OPENAI_API_KEY";  // Replace with your API key

chrome.runtime.onInstalled.addListener(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => console.log("Microphone permission granted"))
        .catch(err => console.error("Microphone access denied", err));
});

// async function sendToLLM(command) {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${apiKey}`
//         },
//         body: JSON.stringify({
//             model: "gpt-4", 
//             messages: [{ role: "user", content: `Convert this voice command into an accurate browser action: "${command}"` }],
//             max_tokens: 50
//         })
//     });

//     const data = await response.json();
//     return data.choices[0].message.content.trim();
// }

// function executeCommand(action) {
//     if (action.includes("open google")) {
//         chrome.tabs.create({ url: "https://www.google.com" });
//     } else if (action.includes("new tab")) {
//         chrome.tabs.create({});
//     } else if (action.includes("close tab")) {
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//             chrome.tabs.remove(tabs[0].id);
//         });
//     } else {
//         console.log("Unknown command:", action);
//     }
// }

function startListening() {
    if (!("webkitSpeechRecognition" in window)) {
        console.error("Speech recognition not supported");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript;
        console.log("Voice command:", command);
        const action = await sendToLLM(command);
        executeCommand(action);
    };

    recognition.onerror = (event) => {
        console.error("Recognition error:", event.error);
    };

    recognition.start();
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "startListening") {
        startListening();
    }
});
