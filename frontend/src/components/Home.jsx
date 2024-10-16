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

        <div className='flex gap-2 w-screen h-screen p-2'>
            <div className="recentChats overflow-y-auto flex gap-2 flex-col rounded-lg w-[20%] p-2 bg-slate-600">

                {
                    connectedUsers && connectedUsers.map((user, index) => (
                        <div key={index} className={` ${loggedInUser.username === user.username ? 'hidden' : 'flex'} items-center gap-4 p-3 border  ${onlineUsers.includes(user._id) ? 'bg-green-400' : 'bg-slate-400'}  cursor-pointer rounded-lg hover:bg-gray-100 transition duration-200`} onClick={() => { getRecipient(user._id), localStorage.setItem('clickedUser', user._id) }} >
                            <span className='profilePhoto w-[50px] h-[50px] border border-gray-300 rounded-full bg-gray-300 flex items-center justify-center'>
                                {/* <span className='text-gray-600 font-semibold'>{user.username.charAt(0)}</span> */} {user._id in unreadMsgObj ? `${unreadMsgObj[user._id]}` : ''}
                            </span>
                            <span className='userName text-gray-800 font-semibold'>{user.username}</span>
                        </div>
                    ))


                }

            </div>

            <div className="chatWindowAndInputBox rounded-lg flex flex-col gap-2 w-[80%] h-full">
                <div className="chat border h-full rounded-lg bg-slate-600 p-4 overflow-y-auto">
                    {messages.map((msgObject, index) => (

                        <div
                            key={index}
                            className={`flex mb-2 ${msgObject.sender?.userId === loggedInUser._id ? 'justify-end ' : 'justify-start'}`}
                        >
                            <div
                                className={` ${index == messages.length-1 ? "lastMsg transition-all duration-300 transform scale-0" : ""}    relative max-w-[75%] p-2 rounded-lg text-white ${msgObject.sender.userId === loggedInUser._id
                                        ? 'bg-purple-600 rounded-tr-none'
                                        : 'bg-pink-600 rounded-tl-none '
                                    }`}
                            >
                                {msgObject.content}
                            </div>


                        </div>

                        
                    ))}
                </div>


                <div className='flex justify-between gap-2 h-[50px] w-full'>
                    <input className='w-full rounded-lg text-lg pl-2 bg-slate-600' type="text" placeholder={loggedInUser.username} value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button className='bg-slate-600 text-white font-semibold px-6 rounded-lg' onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    )
}

export default Home