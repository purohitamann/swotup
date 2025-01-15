'use client';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import { supabase } from './libs/supabaseClient';

interface Flashcard {
  question: string;
  answer: {
    Front: string;
    Back: string;
  };
}

interface FlashcardProps {
  question: string;
  answer: {
    Front: string;
    Back: string;
  };
}

const FlashcardComponent: React.FC<FlashcardProps> = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flashcard-container" onClick={handleClick}>
      <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
        {!isFlipped ? (
          <div className="flashcard-face flashcard-front">
            <div className="flashcard-content">
              <ReactMarkdown>{answer.Front}</ReactMarkdown>
            </div>
            <div className="flashcard-question">{question}</div>
            <div className="flashcard-hint">Click to reveal answer</div>
          </div>
        ) : (
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-content">
              <ReactMarkdown>{answer.Back}</ReactMarkdown>
            </div>
            <div className="flashcard-question">{question}</div>
            <div className="flashcard-hint">Click to see front</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && session.user) {
        setUserEmail(session.user.email);
      } else {
        router.push('/auth');
      }
    };

    // Listen for changes in auth state
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email);
      } else {
        router.push('/auth');
      }
    });

    checkUser();

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage('Logged out successfully.');
    setUserEmail(null);
    router.push('/auth');
  };

  // Handle text input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'subject') setSubject(value);
    if (name === 'content') setContent(value);
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Call the /analyze endpoint for text-based analysis
  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('subject', subject);
      if (content) formData.append('content', content);

      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('Received data:', data);
      setFlashcards(data.flashcards);
      setMessage('Flashcards generated.');
    } catch (error) {
      console.error('Error calling /analyze:', error);
      setMessage('Error generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  // Call the /upload endpoint for PDF file upload
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a PDF file to upload.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('Received data:', data);
      setFlashcards(data.flashcards);
      setMessage('Flashcards generated from uploaded file.');
    } catch (error) {
      console.error('Error calling /upload:', error);
      setMessage('Error generating flashcards from upload.');
    } finally {
      setLoading(false);
    }
  };
  const handleSaveFlashcards = async () => {
    if (!userEmail) {
      setMessage('You must be logged in to save flashcards.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('flashcards', JSON.stringify(flashcards));

      const res = await fetch('http://localhost:8000/store-flashcards', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log("Store flashcards response:", data);
      setMessage(data.message);
    } catch (error) {
      console.error('Error storing flashcards:', error);
      setMessage('Error storing flashcards.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="desk">
      <div className="titlebar">
        <div className="window-controls">
          <div className="window-button close"></div>
          <div className="window-button minimize"></div>
          <div className="window-button maximize"></div>
        </div>
        <div className="window-title">Swot-up!</div>
      </div>

      <div className="paper">
        <h1>Bud it's time to cram;:-)</h1>

        {/* Logout Option */}
        {userEmail && (
          <div>
            <p>Logged in as {userEmail}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}

        {/* Analysis Section (Text Input) */}
        <section>
          <h2>Generate Flashcards (Text Input)</h2>
          <form onSubmit={handleAnalyze}>
            <div>
              <label>
                Subject:
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  onChange={handleInputChange}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                Content (optional):
                <textarea
                  name="content"
                  value={content}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <button type="submit" disabled={loading}>
              Analyze
            </button>
          </form>
        </section>

        {/* Upload Section (PDF Upload) */}
        <section>
          <h2>Generate Flashcards (Upload PDF)</h2>
          <form onSubmit={handleUpload}>
            <div>
              <label>
                Subject:
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  onChange={handleInputChange}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                PDF File:
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
            <button type="submit" disabled={loading}>
              Upload and Generate
            </button>
          </form>
        </section>
        <section>
          <h2>Store Flashcards</h2>
          <button onClick={handleSaveFlashcards} disabled={loading || flashcards.length === 0}>
            Save Flashcards for {userEmail ? userEmail : 'User'}
          </button>
        </section>
        {/* Flashcards Display */}
        <section>
          <h2>Flashcards</h2>
          {flashcards.length > 0 ? (
            <div className="flashcards-grid">
              {flashcards.map((card, idx) => (
                <FlashcardComponent key={idx} question={card.question} answer={card.answer} />
              ))}
            </div>
          ) : (
            <p>No flashcards yet.</p>
          )}
        </section>

        {loading && <p className="loading">Loading...</p>}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
