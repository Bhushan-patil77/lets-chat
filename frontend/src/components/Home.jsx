import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import ting from '../assets/pop.mp3'
const socket = io('https://lets-chat-backend-od7s.onrender.com');



function Home() {
    const [clickedUserId, setClickedUserId]=useState('')
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [senderSocketId, setSenderSocketId] = useState(null);
    const [recipient, setRecipient] = useState({})
    const [updateUsers, setUpdateUsers] = useState('')
    const [onlineUsers, setOnlineUsers] = useState([])
    const [unreadMsgObj, setUnreadMsgObj] = useState({})
    const audio = new Audio(ting)
    

    const loggedInUser = JSON.parse(localStorage.getItem('user'))


    useEffect(() => {
        socket.on('getOnlineUsers', (obj) => {
            setOnlineUsers(Object.keys(obj))
        })
    }, [])

    useEffect(()=>{console.log(unreadMsgObj)}, [unreadMsgObj])

  

    useEffect(() => {

       console.log(recipient)


        socket.emit('getPreviousMessages', { senderId: loggedInUser._id, receiverId: recipient._id });
        // Listening for previous messages
        socket.on('previousMessages', (msgObj) => {
            setMessages(msgObj)
        });
        const newObj = {...unreadMsgObj}
        delete newObj[recipient._id]

        console.log(newObj)
        setUnreadMsgObj(newObj)

    }, [recipient])


    
    useEffect(() => {
        const lastMsg = document.querySelector('.lastMsg');
        if (lastMsg) {
          lastMsg.scrollIntoView({ behavior: 'smooth' });
        lastMsg.classList.add('scale-100')

        }

      }, [messages]);
    

    useEffect(() => {


        const promise = new Promise((resolve, reject) => {
            if (socket.connected) {
                resolve(socket.id)
            } else {
                socket.on('connect', () => {
                    resolve(socket.id)
                })
            }
        })

        promise.then((res) => { socket.emit('updateSocketId', { userId: loggedInUser._id, socketId: res }); setSenderSocketId(res) })

        socket.on('socketChanged', (id) => {
            setUpdateUsers(id)
        })

        getUsers()

    }, [])


    useEffect(() => {
        socket.on('receiveMessage', (msgObj) => {

         

          if (msgObj.sender.userId != localStorage.getItem('clickedUser')) {
            setUnreadMsgObj((prevObj) => {
                return {...prevObj, [msgObj.sender.userId]: (prevObj[msgObj.sender.userId] || 0) + 1 };
            });
        }
  

        console.log(msgObj.sender.userId===localStorage.getItem('clickedUser'));
        
        
           if(msgObj.sender.userId===localStorage.getItem('clickedUser'))
           {
            setMessages((prevMessages) => [...prevMessages, msgObj]);
            audio.play()
           }

        });

        socket.on('broadcast', (msg) => {
            alert(msg)
        })


  
        return () => {
            socket.off('receiveMessage');
        };
    }, []);





    const getUsers = () => {
        fetch('https://lets-chat-backend-od7s.onrender.com/getUsers')
            .then((response) => { return response.json() })
            .then((data) => {
                if (data.message == 'all users') {
                    setConnectedUsers(data.users)
                }
            })
            .catch((err) => { alert('Error getting online users...') })
    }

    const sendMessage = () => {
        if (message && recipient._id) {
            const msgObject = {
                sender: { username: loggedInUser.username, userId: loggedInUser._id, },
                receiver: { username: recipient.username, userId: recipient._id },
                fromSocket: senderSocketId,
                toSocket: recipient.socketId,
                content: message
            }


            socket.emit('sendMessage', msgObject);
            setMessages((prevMessages) => [...prevMessages, msgObject]);
            setMessage('');
        }
    };

    const getRecipient = (userId) => {
        
        fetch('https://lets-chat-backend-od7s.onrender.com/getRecipient', { method: 'post', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: userId }) })
            .then((response) => { return response.json() })
            .then((data) => {
                setRecipient(data.user) 
            })
            .catch((err) => { alert(err) })
    }








    return (

    <div className="flex h-screen bg-gray-900 text-gray-100">
        {/* Sidebar (Recent Chats) */}
        <div className="w-1/3 border-r border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between p-4 bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-200">Chats</h2>
            <button className="text-blue-400 hover:text-blue-600">New Chat</button>
          </div>

          {/* Recent Chats List */}
          <div className="overflow-y-auto h-full">
            {/* Chat Item */}
            <div className="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700">
              <div className="flex items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-200">John Doe</h3>
                    <span className="text-xs text-gray-400">10:30 AM</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">Hey, how are you?</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700">
              <div className="flex items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-200">Jane Smith</h3>
                    <span className="text-xs text-gray-400">9:15 AM</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">Let's catch up later!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center">
              <img
                src="https://via.placeholder.com/40"
                alt="Chat Profile"
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-3">
                <h3 className="font-semibold text-gray-200">John Doe</h3>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>
            <button className="text-blue-400 hover:text-blue-600">More</button>
          </div>

          {/* Messages Section */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
            {/* Message bubble (incoming) */}
            <div className="mb-4">
              <div className="bg-gray-800 p-3 rounded-lg max-w-xs">
                <p className="text-sm text-gray-200">Hello! How's it going?</p>
              </div>
              <span className="text-xs text-gray-400">10:30 AM</span>
            </div>

            {/* Message bubble (outgoing) */}
            <div className="mb-4 text-right">
              <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs ml-auto">
                <p className="text-sm">All good! You?</p>
              </div>
              <span className="text-xs text-gray-400">10:32 AM</span>
            </div>
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-700 p-4 bg-gray-800">
            <div className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-600 rounded-l-lg p-2 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none"
                placeholder="Type a message..."
              />
              <button className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    )
}

export default Home
