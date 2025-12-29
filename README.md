# 🔥 The Brutal VC.ai

An AI-powered startup idea roasting machine that evaluates your pitch like a brutally honest Silicon Valley Venture Capitalist.

No hype.  
No encouragement.  
Just reality.

---

## 🚀 Overview

**The Brutal VC.ai** is a React-based demo application that uses Hugging Face inference APIs to analyze and roast startup ideas.  
It mimics the mindset of a cynical VC by focusing on:

- Market saturation
- Weak unit economics
- Execution risks
- Competitive threats

Perfect for founders who want **honest feedback before wasting months of effort**.

---

## 🧠 How It Works

1. User submits a startup idea via the chat interface
2. The idea is sent to a Hugging Face LLM via API
3. The AI responds in a **harsh VC tone**
4. The response is rendered in a conversational UI

---

## 🛠 Tech Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS**
- Modern component-based UI

### AI / Backend
- **Hugging Face Inference API**
- Secure API token via environment variables

---

## 🔐 Environment Variables

Create a `.env` file in the root of the project:

```env
VITE_HF_API_TOKEN=hf_your_token_here
