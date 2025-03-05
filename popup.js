const API_KEY = "AIzaSyB4m4N94YFzKbQHHV-6leennxiTpq87uSk";

document.addEventListener("DOMContentLoaded", () => { 
    const inputField = document.getElementById("queryInput");
    const exampleQueries = document.querySelectorAll(".example-query");

    const getCommandFromLLM = async (userCommand) => {
        try {
            document.getElementById("response").textContent = "Fetching response...";

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: `You are an AI that strictly analyzes user queries and generates only JavaScript Web API commands in response. Follow these rules: Understand the User Intent: Convert natural language instructions into precise JavaScript commands. Generate Only Code: Do not provide explanations, descriptions, or additional text—only the command. Use Standard Web APIs: Ensure compatibility with modern browsers, using DOM, Window, Navigator, and other Web APIs. Do Not Assume Undefined Variables: If a variable is required, use placeholders like element, url, message, etc. No Extra Formatting: Return plain JavaScript code without Markdown formatting. Examples: User: Open a new tab AI: window.open(url, '_blank'); User: Show an alert message AI: alert(message); User: Get user's location AI: navigator.geolocation.getCurrentPosition(position => console.log(position.coords)); User: Copy text to clipboard AI: navigator.clipboard.writeText(text); User: Scroll to the top of the page  AI: window.scrollTo({ top: 0, behavior: 'smooth' }); User: Ask for microphone access AI: navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => console.log(stream)); User: Play Karan Aujla music AI: window.open("https://www.youtube.com/results?search_query=Karan+Aujla+music", "_blank"); Do not respond with anything other than the JavaScript command here is the user query -> . ${userCommand}` }]
                        }
                    ]
                })
            });

            const data = await response.json();
            console.log("API Response:", data);

            const llmResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

            executeWebAPI(llmResponse);

            document.getElementById("response").textContent = llmResponse;
        } catch (error) {
            document.getElementById("response").textContent = "Error fetching response";
            console.error("Error fetching from Gemini API:", error);
        }
    };

    const playYouTubeVideo = async (searchQuery) => {
        try {
            await fetch("http://localhost:3000/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchQuery })
            });

            document.getElementById("response").textContent = `Playing: ${searchQuery}`;
        } catch (error) {
            console.error("Error fetching video:", error);
            document.getElementById("response").textContent = "Error playing video";
        }
    };

    const searchFlipkart = async (query) => {
        try {
            await fetch("http://localhost:3000/flipkart/add-to-cart", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });
    
            document.getElementById("response").textContent = `Searching Flipkart for: ${query}`;
        } catch (error) {
            console.error("Error fetching Flipkart data:", error);
            document.getElementById("response").textContent = "Error searching Flipkart";
        }
    };

    const searchAmazon = async (query) => {
        try {
            await fetch("http://localhost:3000/amazon/add-to-cart", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });
    
            document.getElementById("response").textContent = `Searching Amazon for: ${query}`;
        } catch (error) {
            console.error("Error fetching Amazon data:", error);
            document.getElementById("response").textContent = "Error searching Amazon";
        }
    };

    const executeWebAPI = (command) => {
        try {
            if (command.includes("youtube.com/results?search_query=")) {
                const searchQueryMatch = command.match(/search_query=([^"]+)/);
                    if (searchQueryMatch) {
                        playYouTubeVideo(decodeURIComponent(searchQueryMatch[1]));
                    }
            }
            else if (command.includes("https://www.flipkart.com/search?q=") || command.includes("buy on Flipkart" || "add to cart in flipkart")) {
                searchFlipkart(command);
            } 
            else if (command.includes("https://www.amazon.com/s?k=") || command.includes("buy on Amazon" || "add to cart in amazon")) {
                searchAmazon(command);
            }
            else if (command.includes("window.open") || command.includes("alert") || command.includes("navigator.") || command.includes("document.body.style.zoom") || command.includes("document.documentElement.style.transform")) {
                eval(command);
            } else {
                console.warn("Untrusted command, not executing:", command);
            }
        } catch (error) {
            console.error("Error executing command:", error);
        }
    };

    const startVoiceRecognition = async () => {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            document.getElementById("response").textContent = "Speech recognition not supported";
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Microphone access granted:", stream);

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
                document.getElementById("response").textContent = `Error: ${event.error}`;
            };

            recognition.onend = () => {
                document.getElementById("response").textContent = "Voice recognition ended";
            };

            recognition.start();
        } catch (error) {
            console.error("Microphone access error:", error);
            document.getElementById("response").textContent = "Microphone access denied!";
        }
    };

    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const userQuery = inputField.value.trim();
            console.log("value", userQuery);
            if (userQuery) {
                getCommandFromLLM(userQuery);
                inputField.value = "";
            }
        }
    });

    exampleQueries.forEach((queryElement) => {
        queryElement.addEventListener("click", () => {
            const query = queryElement.textContent;
            getCommandFromLLM(query);
        });
    });


    document.getElementById("startBtn").addEventListener("click", startVoiceRecognition);

});
