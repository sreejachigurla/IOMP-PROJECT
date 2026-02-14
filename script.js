let chatHistory = [];

async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();

  if (!message) return;

  displayMessage("You", message);

  chatHistory.push({
    role: "user",
    content: message
  });

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: chatHistory }),
    });

    const data = await response.json();

    displayMessage("Bot", data.reply);

    chatHistory.push({
      role: "assistant",
      content: data.reply
    });

  } catch (error) {
    console.error("Frontend Error:", error);
    displayMessage("Bot", "Error connecting to server.");
  }

  input.value = "";
}

function displayMessage(sender, message) {
  const chatBox = document.getElementById("chatBox");

  const msgDiv = document.createElement("div");
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}
