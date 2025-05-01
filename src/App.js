import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

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
          setMessages((prev) => [...prev, data]);
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

  return (
    <div className="d-flex vh-100">
      <div className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h5 className="mb-4">Members</h5>
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
              style={{ height: "70%", overflowY: "auto" }}
            >
              {messages.map((msg, i) => (
                <div key={i} className="mb-2">
                  {msg.systemMessage && (
                    <div style={{ fontStyle: "italic", color: "#888" }}>
                      {msg.systemMessage}
                    </div>
                  )}
                  {msg.publicMessage && (
                    <div>
                      <strong>{msg.publicMessage.split(":")[0]}</strong>:{" "}
                      {msg.publicMessage.split(":").slice(1).join(":").trim()}
                    </div>
                  )}
                  {msg.from && msg.message && (
                    <div>
                      <strong>{msg.from}</strong>: {msg.message}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="d-flex gap-2 mb-2">
              <input
                className="form-control"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="btn btn-success" onClick={sendPublic}>
                Public
              </button>
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
