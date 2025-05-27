# 🐱 Catculator 💸

A cute and simple web app to split expenses among friends.

## ✨ Features

* 🏠 **Create or Join a Room** with a 6-digit code
* 👯 **Add Members** with randomly assigned cat avatars
* 💰 **Add Shared Expenses** with:

  * Title, Amount
  * Single-select "Paid By"
  * Multi-select "Involved"
* 📊 **See Summary** of who owes who
* 📜 **View & Delete Past Transactions**
* 🎨 **Cute UI** designed for mobile and desktop
* 🌐 **Works on All Devices** — fully responsive

---

## 🧱 Tech Stack

| Frontend                                           | Backend                 
| -------------------------------------------------- | ----------------------- 
| React                                      | Flask (Python)          |
| Tailored CSS (Comic Sans MS)               | PostgreSQL via Supabase |          
| Vercel Deployment                                  | Render Deployment       |               

---

## 🚀 Getting Started

### Backend Setup (Flask)

1. Navigate to `/backend`
2. Create `.env` with:

```bash
DATABASE_URL=your_supabase_postgres_url
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the app locally:

```bash
flask run
```

---

### Frontend Setup (React)

1. Navigate to `/frontend`
2. Install packages:

```bash
npm install
```

3. Update `API_BASE_URL` in `src/api.js` to your backend Render URL.
4. Run locally:

```bash
npm run dev
```
---

## 📁 Project Structure

```
catculator/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/Home.js
│   │   ├── pages/Room.js
│   │   ├── components/
│   │   ├── assets/
│   │   └── styles/
│   ├── public/
│   └── package.json
```

---

## 📸 Preview

| Home Page                 | Room Page (Expense Entry) |
| ------------------------- | ------------------------- |
| ![Home](https://github.com/user-attachments/assets/8b24eaf5-13e7-4169-94c5-f057c64d2550)| ![Room](https://github.com/user-attachments/assets/063a7cfb-50a2-4554-a739-2a1575a2af7a)

---

## 🐾 Future Improvements

* User authentication
* Settle up tracking
* Export summaries

---

## 🐱 Why Catculator?

Because cats don’t split bills…
But you should. ✨


