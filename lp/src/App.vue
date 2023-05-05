<template>
  <div id="app">
    <div class="chat-container">
      <div class="message" v-for="message in messages" :key="message.id" :class="message.type">
        <div class="message-text">{{ message.text }}</div>
      </div>
    </div>
    <div class="input-area">
      <input class="input-message" type="text" v-model="inputMessage" @keyup.enter="sendMessage(inputMessage)" placeholder="Type your message here">
      <button class="send-button" @click="sendMessage(inputMessage)">Send</button>
      <button class="connect-button" @click="connect">Connect</button>
      <button class="disconnect-button" @click="disconnect">Disconnect</button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onUnmounted } from 'vue';

export default {
  setup() {
    const connection = ref(null);
    const inputMessage = ref('');
    const messages = reactive([]);

    function sendMessage(message) {
      if (message && connection.value && connection.value.readyState === WebSocket.OPEN) {
        console.log("Sending message:", message);
        const formattedMessage = JSON.stringify({
          action: 'sendmessage',
          message: message
        });
        connection.value.send(formattedMessage);
        messages.push({ id: Date.now(), text: message, type: 'sent' });
        inputMessage.value = "";
      }
    }

    function connect() {
      if (!connection.value || connection.value.readyState === WebSocket.CLOSED) {
        console.log("Starting connection to WebSocket Server");
        connection.value = new WebSocket("wss://ie3l31fg0g.execute-api.ap-northeast-1.amazonaws.com/production");

        connection.value.onmessage = (event) => {
          console.log(event);
          messages.push({ id: Date.now(), text: event.data, type: 'received' });
        };

        connection.value.onopen = (event) => {
          console.log(event);
          console.log("Successfully connected to the echo websocket server...");
          messages.push({ id: Date.now(), text: "Connected to the WebSocket server.", type: 'status' });
        };

        connection.value.onclose = (event) => {
          console.log("WebSocket connection closed:", event);
          messages.push({ id: Date.now(), text: "Disconnected from the WebSocket server.", type: 'status' });
        };
      }
    }

    function disconnect() {
      if (connection.value && connection.value.readyState === WebSocket.OPEN) {
        console.log("Disconnecting from WebSocket Server");
        connection.value.close();
      }
    }

    onUnmounted(disconnect);

    return { connection, inputMessage, messages, sendMessage, connect, disconnect };
  },
};
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  height: 80vh;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.message {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.message-text {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #cccccc;
  padding: 8px 16px;
  border-radius: 16px;
  word-wrap: break-word;
}

.message.received .message-text {
  align-self: flex-start;
}

.message.sent .message-text {
  align-self: flex-end;
}

.message.status .message-text {
  background-color: #00b900;
  color: #ffffff;
  border: 1px solid #009900;
  align-self: center;
}

.input-area {
  display: flex;
  padding-top: 20px;
  background-color: #ffffff;
  border-top: 1px solid #ccc;
}

.input-message {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
  outline: none;
}

.send-button,
.connect-button,
.disconnect-button {
  margin-left: 8px;
  background-color: #00b900;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
}

.send-button:hover,
.connect-button:hover,
.disconnect-button:hover {
  background-color: #009900;
}

.send-button:disabled,
.connect-button:disabled,
.disconnect-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>