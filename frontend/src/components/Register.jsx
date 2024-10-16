import React from 'react'
import { useNavigate } from 'react-router-dom'

function Register() {

    const navigate = useNavigate()

    const handleRegister = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target);
        const user = {};

        for (let [key, value] of formData) {
            user[key] = value;
        }

        

        user.socketId=''
        user.status='offline'

             fetch('https://lets-chat-backend-od7s.onrender.com/registerUser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) })
            .then((response) => { return response.json() })
            .then((data) => {
                console.log(data);
                
                 if(data.message=="User Registered Successfully...")
                 {
                    navigate('/Login')
                 }
                 })
            .catch((error) => { console.log(error) })

    }

    return (
        <div>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white shadow-md rounded-lg p-8 w-96">
                    <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
                    <form onSubmit={(e) => { handleRegister(e) }}>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200"
                        >
                            Register
                        </button>
                    </form>
                    <p className="mt-4 text-sm text-center text-gray-600">
                        Already have an account? <span className="text-blue-500 hover:underline" onClick={() => { navigate('/Login') }}>Login</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register