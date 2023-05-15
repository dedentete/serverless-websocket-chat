<template>
  <div id="app">
    <div class="chat-container">
      <div class="message" v-for="message in messages" :key="message.id" :class="message.type">
        <div class="message-text">{{ message.text }}</div>
      </div>
    </div>
    <div class="input-area">
      <input class="input-message" type="text" v-model="inputMessage" @keyup.enter="sendMessage(inputMessage)"
        placeholder="ここにメッセージを入れる">
      <button class="send-button" @click="sendMessage(inputMessage)">送信</button>
      <button class="connect-button" @click="connect">接続</button>
      <button class="disconnect-button" @click="disconnect">切断</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onUnmounted } from 'vue';

interface Message {
  id: number;
  text: string;
  type: string;
}

export default defineComponent({
  setup() {
    const connection = ref<WebSocket | null>(null);
    const inputMessage = ref<string>('');
    const messages = reactive<Message[]>([]);

    function sendMessage(message: string) {
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
        connection.value = new WebSocket("wss://80j5cnrtd1.execute-api.ap-northeast-1.amazonaws.com/dev");

        connection.value.onmessage = (event: MessageEvent) => {
          console.log(event);
          messages.push({ id: Date.now(), text: event.data, type: 'received' });
        };

        connection.value.onopen = (event: Event) => {
          console.log(event);
          console.log("Successfully connected to the echo websocket server...");
          messages.push({ id: Date.now(), text: "WebSocketサーバーと接続した！", type: 'status' });
        };

        connection.value.onclose = (event: CloseEvent) => {
          console.log("WebSocket connection closed:", event);
          messages.push({ id: Date.now(), text: "WebSocketサーバーから切断した！", type: 'status' });
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
});
</script>
