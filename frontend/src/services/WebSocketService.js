export default class WebSocketService {
  static instance = null;
  callbacks = {};

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  connect() {
    const path = "ws://localhost:8000/ws/chat";
    this.socketRef = new WebSocket(path);

    this.socketRef.onopen = () => {
      console.log("WebSocket open");
    };

    this.socketRef.onclose = () => {
      console.log("WebSocket closed");
    };

    this.socketRef.onmessage = (e) => {
      this.socketNewMessage(e.data);
    };

    this.socketRef.onerror = (e) => {
      console.log(e.message);
    };
  }

  disconnect() {
    this.socketRef.close();
  }

  addCallbacks(messagesCallback, newMessageCallback) {
    this.callbacks["messages"] = messagesCallback;
    this.callbacks["new_message"] = newMessageCallback;
  }

  initChatWithUser(username) {
    this.sendMessage({
      command: "connect_to_group",
      user_to_contact: username,
    });
  }

  socketNewMessage(data) {
    const parsedData = JSON.parse(data);
    const command = parsedData.command;
    if (Object.keys(this.callbacks).length === 0) {
      return;
    }
    if (command === "messages") {
      this.callbacks[command](parsedData.messages);
    }
    if (command === "new_message") {
      this.callbacks[command](parsedData.message);
    }
  }

  fetchMessages(userToContact) {
    if (userToContact === undefined) {
      return;
    }
    this.sendMessage({
      command: "fetch_messages",
      user_to_contact: userToContact,
    });
  }

  sendChatMessage(message, userToContact) {
    this.sendMessage({
      command: "new_message",
      text: message,
      to: userToContact,
    });
  }

  sendMessage(data) {
    try {
      this.socketRef.send(JSON.stringify({ ...data }));
    } catch (err) {
      console.log(err.message);
    }
  }

  state() {
    return this.socketRef.readyState;
  }

  waitForSocketConnection(callback) {
    if (this === undefined) {
      return;
    }

    const socket = this.socketRef;
    const recurse = this.waitForSocketConnection;

    setTimeout(function () {
      if (socket !== null && socket.readyState === 1) {
        console.log("Connection is made");
        if (callback !== null && typeof callback === "function") {
          callback();
        }
        clearTimeout();
      } else {
        console.log("wait for connection...");
        recurse(callback);
      }
    }, 1000);
  }
}
