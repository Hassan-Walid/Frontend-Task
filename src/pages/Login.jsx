// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        console.log("in login");
        e.preventDefault();
        const res = await fetch(`${API_BASE_URL}/users?email=${email}&password=${password}`);
        const users = await res.json();

        if (users.length > 0) {
            signIn(users[0]);
            navigate('/');
        } else {
            alert('Invalid email or password');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded">
            <h2 className="text-2xl mb-4">Sign In</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border p-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border p-2 rounded"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Sign In</button>
            </form>
        </div>
    );
};

export default Login;