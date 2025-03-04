const API_KEY = "AIzaSyBwv7qeYsxn7G42N6LCeAmA30FBcNcd2II";

const getCommandFromLLM = async (userCommand) => {
    try {
        document.getElementById("response").textContent = "Fetching response...";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: `You are an AI that strictly analyzes user queries and generates only JavaScript Web API commands in response. Follow these rules: 
                        Understand the User Intent: Convert natural language instructions into precise JavaScript commands.
                        Generate Only Code: Do not provide explanations, descriptions, or additional text—only the command.
                        Use Standard Web APIs: Ensure compatibility with modern browsers.
                        Do Not Assume Undefined Variables: Use placeholders like element, url, message, etc.
                        No Extra Formatting: Return plain JavaScript code.
                        Here is the user query -> ${userCommand}` }]
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
