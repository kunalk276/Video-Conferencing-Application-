# MeetPro 🎥💬


[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Issues](https://img.shields.io/github/issues/kunalk276/Video-Conferencing-Application-)](https://github.com/kunalk276/Video-Conferencing-Application-/issues)
[![Stars](https://img.shields.io/github/stars/kunalk276/Video-Conferencing-Application-)](https://github.com/kunalk276/Video-Conferencing-Application-)

**MeetPro** is a modern, full-stack video conferencing web application built using **React**, **Spring Boot**, **WebRTC**, and **WebSocket**. It's designed to deliver a secure, real-time experience similar to Google Meet.

---

## ✨ Features

- ✅ JWT Authentication & Authorization  
- 🎥 Real-Time Video & Audio Communication (WebRTC)  
- 🖥️ Screen Sharing (with simultaneous camera & mic)  
- 🗣️ Live In-Meeting Chat  
- 📅 Schedule or Create Meetings  
- ⏰ Meeting Timers & Status Indicators  
- 🧑‍🤝‍🧑 View Active Participants  
- 🌐 Responsive UI for All Devices  

---

## 🧰 Tech Stack

| Layer       | Tech Used                                  |
|-------------|---------------------------------------------|
| Frontend    | React, Tailwind CSS, Zustand, Socket.IO     |
| Backend     | Spring Boot, Spring Security, WebSocket     |
| Real-Time   | WebRTC (peer-to-peer), STOMP over SockJS    |
| Database    | PostgreSQL (prod), MySQL (dev)              |
| Deployment  | Docker, Vercel (frontend), Render (backend) |

---

## 🌐 Live Demo

- 🔗 [Frontend (Vercel)](https://video-conferencing-application-taupe.vercel.app)
- 🔗 [Backend Render](https://video-conferencing-application-gmsl.onrender.com)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kunalk276/Video-Conferencing-Application-.git
cd Video-Conferencing-Application-
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### 3. Backend Setup (Spring Boot)

#### Option A: Docker (Recommended)

```bash
cd backend
docker build -t meetpro-backend .
docker run -p 8080:8080 --env-file .env meetpro-backend
```

#### Option B: Local Maven Run

```bash
cd backend
./mvnw spring-boot:run
```

> ⚠️ Create a `.env` file or configure your `application.properties` for DB and JWT settings.

---

## 🗃️ Database Overview

* `User`: Stores user credentials and profile info  
* `Meeting`: Stores meeting room codes, timestamps, and host references  
* `Message`: Stores in-meeting chat messages  

📄 Full ER Diagram → ![image](https://github.com/user-attachments/assets/ad7e49d6-2e9d-4ffe-a962-7199719e3e55)
  
📄 SQL Schema → ## 🗃️ SQL Schema (PostgreSQL)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  meeting_code VARCHAR(10) UNIQUE NOT NULL,
  host_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  meeting_id INTEGER REFERENCES meetings(id),
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


---

## 📡 API Reference

| Method | Endpoint               | Description           |
|--------|------------------------|------------------------|
| POST   | `/api/auth/signup`     | Register a new user    |
| POST   | `/api/auth/login`      | Login with JWT         |
| POST   | `/api/meetings/create` | Create a meeting       |
| GET    | `/api/meetings/{code}` | Fetch meeting details  |
| WS     | `/ws/chat`             | Real-time messaging    |

➡️ Full API collection → [`docs/postman_collection.json`](docs/postman_collection.json)

---

## 🧑‍💻 Contributing

We welcome your contributions! Follow these steps to get started:

1. Fork the repository  
2. Create a new branch:  
   ```bash
   git checkout -b feature/your-feature
   ```  
3. Commit your changes:  
   ```bash
   git commit -m "Add: your feature"
   ```  
4. Push to your branch:  
   ```bash
   git push origin feature/your-feature
   ```  
5. Open a **Pull Request** 🎉  

📜 See [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed guidelines.

---

## 🧪 Testing

- Manual testing via frontend interface and Postman  
- Unit testing with Spring Boot JUnit  
- E2E testing roadmap (coming soon)

---

## 🔒 Security

- JWT-secured APIs and WebSocket access  
- Role-based access for meeting creation and joining  
- Input validation and XSS-safe messaging

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Kunal Kadam**  
📧 [kunalkadam2762001@gmail.com](mailto:kunalkadam2762001@gmail.com)  
🌐 [GitHub](https://github.com/kunalk276) | [LinkedIn](https://linkedin.com/in/kunaldkadam)

---

## ⭐️ Support This Project

If you find this project helpful or inspiring, give it a ⭐ on [GitHub](https://github.com/kunalk276/Video-Conferencing-Application-)!

