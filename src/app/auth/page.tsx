'use client';
import { useState } from 'react';
import { supabase } from '../libs/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSignUp = async () => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Check your email for the confirmation link.');
        }
    };

    const handleSignIn = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Signed in successfully.');
            router.push('/');
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
                <div className="window-title">Swot-up Authentication</div>
            </div>
            
            <div className="auth-container">
                <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Swot-up</h1>
                <div className="space-y-4">
                    <div>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="auth-buttons">
                        <button onClick={handleSignUp} className="flex-1">Sign Up</button>
                        <button onClick={handleSignIn} className="flex-1">Sign In</button>
                    </div>
                    {message && (
                        <div className="message mt-4 p-3 rounded-lg bg-opacity-10 bg-white">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
