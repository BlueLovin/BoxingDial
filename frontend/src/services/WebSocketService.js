//TODO: refactor this horse shit. turn it into a hook?

class WebSocketService {
  static instance = null;
  callbacks = {};

  static getInstance(token, userToContact) {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
      WebSocketService.instance.token = token;
      WebSocketService.instance.userToContact = userToContact;
    }
    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  connect() {
    const path = "ws://localhost:8000/ws/chat";
    if (this.userToContact && this.token) {
      document.cookie = `Authorization=${this.token};path=/`;
      document.cookie = ` user-to-contact=${this.userToContact}; path=/`;
    } 

    this.socketRef = new WebSocket(path);
    this.socketRef.onopen = () => {
      console.log("WebSocket open");
    };
    this.socketRef.onmessage = (e) => {
      this.socketNewMessage(e.data);
    };

    this.socketRef.onerror = (e) => {
      console.log(e.message);
    };
    this.socketRef.onclose = () => {
      console.log("WebSocket closed let's reopen");
      this.connect();
    };
  }

  socketNewMessage(data) {
    console.log(data);
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

  fetchMessages() {
    this.sendMessage({ command: "fetch_messages" });
  }

  newChatMessage(message) {
    console.log("new chat message");
    this.sendMessage({
      command: "new_message",
      text: message,
    });
  }

  addCallbacks(messagesCallback, newMessageCallback) {
    this.callbacks["messages"] = messagesCallback;
    this.callbacks["new_message"] = newMessageCallback;
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
    const socket = this.socketRef;
    const recursion = this.waitForSocketConnection;
    setTimeout(function () {
      if (socket !== null && socket.readyState === 1) {
        console.log("Connection is made");
        if (callback != null) {
          callback();
        }
      } else {
        console.log("wait for connection...");
        recursion(callback);
      }
    }, 1000); // wait 5 milisecond for the connection...
  }
}

export default WebSocketService;
