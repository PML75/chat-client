import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import EmojiPicker from "emoji-picker-react";

const SOCKET_URL =
  "wss://xubzgv3dv1.execute-api.us-east-1.amazonaws.com/production/";

export default function ChatApp() {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState("");
  const [privateTo, setPrivateTo] = useState("");
  const [members, setMembers] = useState([]);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.members) {
          setMembers(data.members);
        } else {
          const timestampedData = {
            ...data,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, timestampedData]);
        }
      };
    }
  }, [ws]);

  const connect = () => {
    const socket = new WebSocket(SOCKET_URL);
    socket.onopen = () => {
      setWs(socket);
      setConnected(true);
      socket.send(JSON.stringify({ action: "setName", name }));
    };
    socket.onclose = () => {
      setConnected(false);
      setWs(null);
    };
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
    }
  };

  const sendPublic = () => {
    const now = Date.now();
    if (now - lastSentTime < 1000) {
      alert("You're sending messages too quickly. Please wait a second.");
      return;
    }

    if (input && ws) {
      ws.send(JSON.stringify({ action: "sendPublic", message: input }));
      setInput("");
      setLastSentTime(now);
    }
  };

  const sendPrivate = () => {
    if (input && privateTo) {
      ws.send(
        JSON.stringify({ action: "sendPrivate", message: input, to: privateTo })
      );
      setInput("");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      if (ws) ws.close();
      localStorage.removeItem("loggedInUserId");
      window.location.href = "https://main.d3d5a526enwg5q.amplifyapp.com/";
    }
  };

  const exportChat = (format = "txt") => {
    if (messages.length === 0) {
      alert("No chat messages to export.");
      return;
    }

    let content = "";

    if (format === "json") {
      content = JSON.stringify(messages, null, 2);
    } else {
      content = messages
        .map((msg) => {
          if (msg.systemMessage)
            return `[System] ${msg.systemMessage} (${msg.timestamp})`;
          if (msg.publicMessage)
            return `[Public] ${msg.publicMessage} (${msg.timestamp})`;
          if (msg.from && msg.message)
            return `${msg.from}: ${msg.message} (${msg.timestamp})`;
          return JSON.stringify(msg);
        })
        .join("\n");
    }

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/plain",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chat-log.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="d-flex vh-100">
      <div className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h5 className="mb-2">Members</h5>
        <div
          style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "1rem" }}
        >
          🟢 Users Online: {members.length}
        </div>
        {members.map((member, i) => (
          <div
            key={i}
            className="mb-2"
            onClick={() => setPrivateTo(member)}
            style={{ cursor: "pointer" }}
          >
            {member}
          </div>
        ))}
      </div>

      <div className="flex-grow-1 p-3">
        {!connected ? (
          <div className="d-flex gap-2 mb-3">
            <input
              className="form-control"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={connect}
              disabled={!name}
            >
              Connect
            </button>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Chat Room</h5>
              <div>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => exportChat("txt")}
                >
                  📄 Export TXT
                </button>
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => exportChat("json")}
                >
                  🧾 Export JSON
                </button>
                <button
                  className="btn btn-secondary me-2"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button className="btn btn-danger" onClick={disconnect}>
                  Disconnect
                </button>
              </div>
            </div>

            <div
              className="border rounded p-3 mb-3"
              style={{
                height: "70%",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              {messages.map((msg, i) => {
                const isOwn =
                  msg.from === name ||
                  (msg.publicMessage &&
                    msg.publicMessage.startsWith(`${name}:`));
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: msg.systemMessage
                        ? "center"
                        : isOwn
                        ? "flex-end"
                        : "flex-start",
                      width: "100%",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: msg.systemMessage
                          ? "transparent"
                          : isOwn
                          ? "#007bff"
                          : "#e4e6eb",
                        color: isOwn ? "white" : "black",
                        padding: "8px 12px",
                        borderRadius: "15px",
                        maxWidth: "75%",
                        fontStyle: msg.systemMessage ? "italic" : "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.systemMessage && (
                        <>
                          {msg.systemMessage}
                          {msg.timestamp && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.8em",
                                color: "#999",
                              }}
                            >
                              ({msg.timestamp})
                            </span>
                          )}
                        </>
                      )}
                      {msg.publicMessage && (
                        <>
                          <strong>{msg.publicMessage.split(":")[0]}</strong>:{" "}
                          {msg.publicMessage
                            .split(":")
                            .slice(1)
                            .join(":")
                            .trim()}
                          {msg.timestamp && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.8em",
                                color: "#ccc",
                              }}
                            >
                              ({msg.timestamp})
                            </span>
                          )}
                        </>
                      )}
                      {msg.from && msg.message && (
                        <>
                          <strong>{msg.from}</strong>: {msg.message}
                          {msg.timestamp && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.8em",
                                color: "#ccc",
                              }}
                            >
                              ({msg.timestamp})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div
              className="d-flex gap-2 mb-2 align-items-center"
              style={{ position: "relative" }}
            >
              <input
                className="form-control"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😊
              </button>
              <button className="btn btn-success" onClick={sendPublic}>
                Public
              </button>
              {showEmojiPicker && (
                <div
                  style={{ position: "absolute", bottom: "60px", zIndex: 1000 }}
                >
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setInput((prev) => prev + emojiData.emoji);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <select
                className="form-select w-auto"
                value={privateTo}
                onChange={(e) => setPrivateTo(e.target.value)}
              >
                <option value="">Select user</option>
                {members
                  .filter((member) => member !== name)
                  .map((member, i) => (
                    <option key={i} value={member}>
                      {member}
                    </option>
                  ))}
              </select>

              <button className="btn btn-info" onClick={sendPrivate} disabled={!privateTo}>
              <button
                className="btn btn-info"
                onClick={sendPrivate}
                disabled={!privateTo}
              >
                Send Private
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
