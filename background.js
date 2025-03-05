chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "searchYouTube") {
        fetch("http://localhost:3000/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: message.query })
        }).then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error("Error:", error));
    }
});