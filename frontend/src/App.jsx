import React, { useEffect, useState } from 'react';
import './App.css'; 
import { Routes, Route } from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';

function App() {
    const [connectedUsers, setConnectedUsers] = useState({});
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [senderId, setSenderId] = useState(null);
    const [recipientId, setRecipientId] = useState('');

    return (

        <Routes>

            <Route path='/Login' element={<Login/>}/>
            <Route path='/Register' element={<Register/>}/>
            <Route element={<ProtectedRoute/>}>
                <Route path='/' element={<Home/>}/>
            </Route>

        </Routes>

       
    );
}

export default App;
