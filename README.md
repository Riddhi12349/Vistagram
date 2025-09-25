# 📸 Vistagram - AI-Powered Social Media Platform 🚀

A social media platform for sharing moments through images and captions, enhanced with AI-powered features like automatic caption generation, hashtag suggestions, and content moderation. Built with ReactJS, NodeJS, Express, MongoDB, and Redis.

## 🎥 Demo Video

[![Vistagram Demo](https://img.shields.io/badge/▶️%20Watch%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/your-demo-video-link)

> 📹 **See Vistagram in action!** Watch our demo showcasing AI caption generation, real-time interactions, and seamless image sharing.

## 🛠️ Tech Stack

### Frontend 🎨
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### Backend ⚙️
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Multer](https://img.shields.io/badge/Multer-FF6B6B?style=for-the-badge)

### Database & Caching 🗄️
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### AI & Machine Learning 🤖
![Google Gemini](https://img.shields.io/badge/Google%20Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)

### Deployment 🌐
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

## 🌟 Features

- 🤖 **AI Caption Generation**: Generates 6 creative Instagram-style captions using Gemini 2.5 Flash
- 🏷️ **Smart Hashtag Suggestions**: Automatic hashtag recommendations based on image content
- 🛡️ **Content Moderation**: AI-powered inappropriate content detection
- ⚡ **Real-time Interactions**: Like and share posts with Redis caching
- 📷 **Image Sharing**: Upload and share images with captions

## 📁 Project Structure

```
frontend/          # React SPA
├─ public/       # Static assets + _redirects
├─ src/
    ├─ components/
    ├─ pages/
    └─ App.js

backend/           # Express API
├─ controllers/
├─ routes/
├─ models/
└─ server.js

uploads/           # Multer uploads (temporary)
.env               # Environment variables (DO NOT COMMIT)
```

## ⚙️ Setup Instructions 🚀

### 1️⃣ Clone the repository 📥

```bash
git clone https://github.com/your-username/vistagram.git
cd vistagram
```

### 2️⃣ Backend Setup 🔧

```bash
cd backend
npm install
```

Create `.env` 📝:

```env
PORT=5000
BASE_URL=https://your-backend-render-url.com
MONGO_URL=your-mongodb-uri
REDIS_CLIENT_URL=your-redis-url
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-google-gemini-api-key
```

Start backend 🚀:

```bash
npm run dev
```

### 3️⃣ Frontend Setup 🎨

```bash
cd frontend
npm install
```

Create `.env` 📝:

```env
REACT_APP_BASE_URL=https://your-backend-render-url.com
```

Start frontend ✨:

```bash
npm start
```

## 📝 API Overview 🔗

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/get/all/posts/:userId` | 📋 GET | Fetch user's posts |
| `/send/new/post/:userId/:postId` | 📤 POST | Create post with image |
| `/send/likes/count/:postId` | 💖 PATCH | Update post likes |
| `/send/shares/count/:postId` | 🔄 PATCH | Update post shares |
| `/api/ai/analyze/image` | 🤖 POST | AI caption generation |

## 🤖 AI Features 🧠

**Image Analysis with Gemini 2.5 Flash ⚡:**
```javascript
const contents = [
  {
    inlineData: {
      mimeType: "image/jpeg", 
      data: imageBase64
    }
  },
  { text: "Describe the image in 2-3 sentences." }
];

const response = await clientAI.models.generateContent({
  model: "gemini-2.5-flash",
  contents: contents
});
```

**Content Moderation 🚫:**
```javascript
const bannedWords = [
  "porn", "nudity", "sex", "violence", "drugs", "gore",
  "blood", "weapon", "abuse", "kill"
];
```

## 💡 Best Practices ✨

- 📦 Multer is fine for development, but use cloud storage (S3/Cloudinary) in production
- ⚡ Redis caching improves performance for feed, likes, and shares  
- 🔒 React env vars (`REACT_APP_`) are exposed in frontend — never store secrets
- 🧹 Clean ESLint warnings to avoid CI build errors

## ⚡ Future Improvements 🚀

- ☁️ Cloud storage for persistent uploads (AWS S3 / Cloudinary)
- 🔐 JWT authentication & secure user accounts
- 🔔 Real-time notifications with Socket.io
- 🎯 Advanced AI-powered content recommendations

## 📄 License 📜

MIT License ✅
