# 💬 Chat Client – Real-Time Messaging Web App

This is a lightweight real-time chat client built as a **cloud computing class project**. It enables users to send and receive messages instantly using **WebSockets** powered by a **serverless AWS backend**.

The frontend is developed using **React**, while the backend leverages **AWS Lambda** and **API Gateway WebSocket API** for scalable, real-time communication.

---

## 🚀 Features

- 🔄 Real-time public and private messaging  
- ☁️ Serverless backend using AWS Lambda + API Gateway  
- 🧑‍🤝‍🧑 Live user list with online count  
- 🕓 Timestamps for all messages  
- 😄 Emoji picker support  
- 📤 Export chat logs as `.txt` or `.json`  
- 🧼 Clean, modern UI with chat bubble styling  
- 🔐 Smooth login/logout flow  

---

## 🛠️ Technologies Used

- **Frontend**: React, Bootstrap, Emoji Picker  
- **Backend**: AWS Lambda (Node.js), API Gateway (WebSocket)  
- **Cloud**: AWS (Lambda, API Gateway, IAM), optionally Firebase Auth  
- **Hosting**: AWS Amplify


## ▶️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chat-client.git
cd chat-client

### 2. Install dependencies
```bash
npm install

### 3. Start the development server
```bash
npm start

### 📂 Project Structure
/public
/src
  ├── ChatApp.js          # Main chat component
  ├── index.js            # Entry point
  ├── firebaseauth.js     # Optional Firebase auth
  └── style.css           # Custom styles

