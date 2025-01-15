Swot-Up 📚
Turn notes and PDFs into interactive flashcards—powered by AI!

Swot-Up is your smart study companion that transforms study material into bite-sized flashcards in seconds. Upload text, paste content, or even submit a PDF, and let Swot-Up do the heavy lifting. It's studying made simple, efficient, and fun!

🚀 Features
AI-Powered Flashcards: Generates flashcards from any text or PDF using GROQ AI.
User Authentication: Securely sign up, log in, and access personalized study material with Supabase.
PDF Support: Seamlessly parse PDFs into clean, usable text for flashcard creation.
Interactive Design: Flip through flashcards with a responsive, intuitive interface built with Next.js.
Cloud Storage: Save flashcards to your account and access them anytime, anywhere.
🛠️ Built With
Languages & Frameworks
Python
TypeScript
JavaScript
React
FastAPI
Next.js
Cloud & Databases
Supabase (User Authentication & Flashcard Storage)
GROQ AI (Flashcard Generation)
APIs
GROQ Inference API
Supabase Auth API
📖 How It Works
Upload or Paste Content: Enter text or upload a PDF file.
AI Processing: GROQ AI analyzes the content and generates concise flashcards.
Review & Save: Flip through flashcards on an interactive UI, and save them to your account for later access.
🛠️ Installation & Setup
Follow these steps to set up Swot-Up locally:

Prerequisites
Python 3.9+
Node.js 16+
Supabase Project & API Key
GROQ API Key
Backend Setup
Clone this repository:
bash
Copy code
git clone https://github.com/yourusername/swot-up.git
cd swot-up/backend
Create a .env.local file and add your API keys:
env
Copy code
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_KEY=<your_supabase_key>
GROQ_API_KEY=<your_groq_api_key>
Install dependencies and start the backend:
bash
Copy code
pip install -r requirements.txt
uvicorn main:app --reload
Frontend Setup
Navigate to the frontend directory:
bash
Copy code
cd ../frontend
Install dependencies and start the development server:
bash
Copy code
npm install
npm run dev
Visit http://localhost:3000 in your browser.
🤔 Challenges We Solved
AI Fine-Tuning: Ensured flashcards were relevant and concise.
PDF Parsing: Extracted clean, readable text from diverse formats.
Secure Authentication: Built seamless and secure login functionality with Supabase.
🎉 Accomplishments
Integrated GROQ AI to deliver accurate, engaging flashcards.
Built a fully functional, responsive web app with Next.js and FastAPI.
Securely stored user data and flashcards in Supabase.
🚧 Roadmap
Add support for additional file types (PowerPoint, Word).
Develop a mobile app for on-the-go learning.
Introduce collaborative features for shared study sessions.
📄 License
This project is licensed under the MIT License. See the LICENSE file for details.

