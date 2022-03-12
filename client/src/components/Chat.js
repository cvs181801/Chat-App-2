import React, {useEffect, useState, useContext} from 'react';
import {Link} from "react-router-dom"
import Usercard from './Usercard'
import axios from 'axios'
import { io } from "socket.io-client";
import 'bootstrap/dist/css/bootstrap.css';
import '../index.scss';
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl';
import { ThemeContext } from '../contexts/ThemeContext';

const socket = io();

export default function Chat() {

const [messageInputValue, setMessageInputValue] = useState('')
const [allmessages, setAllMessages] = useState([])
const [loggedInUsers, setLoggedInUsers] = useState([])
const [logQueue, setLogQueue] = useState(false)
const theme = useContext(ThemeContext);

function postMsg() {
    setMessageInputValue('')
    const msgData = {
        userid: localStorage.getItem('userId'),
        text: messageInputValue
      }
    const response = axios.post(`/api/messages`, msgData);
    console.log(response)
}

const logoutObj = {
    userid: localStorage.getItem('userId'),
    username: localStorage.getItem('username')
}

function logOut() {
    async function logout() {
        try {
            var response = await axios.post('api/logout', logoutObj)
            if(response.data === "See you later!") {
                localStorage.removeItem('userId')
                localStorage.removeItem('username')
                console.log('see you later!')
                //const checkit = localStorage.getItem('userId');
                //console.log(checkit)
                setLogQueue(true)
                window.location.reload()
            } else {
               console.log("please try logging out again")
            }
        }
        catch(err) {
            console.log(err)
        }
    }
    logout();
}

useEffect(()=> {
    async function getUsers() {
        try {
            const response = await axios.get('api/users')
            console.log(response.data)
            setLoggedInUsers(response.data)
        }
        catch(err) {
            console.log(err)
        }
    }
    getUsers(); 
},[])


useEffect(()=> {
    socket.on("loggedInUser", (data)=> {    
         async function getLoggedUsers() {
                try {
                    const response = await axios.get('api/loggedusers')
                    console.log(response.data)
                    setLoggedInUsers(response.data)
                }
                catch(err) {
                    console.log(err)
                }
            }
        
            getLoggedUsers();  
        setLoggedInUsers((loggedInUsers)=> [...loggedInUsers, data.user])
        console.log(data)
        setLogQueue(false)
    })
           
  },[logQueue])

useEffect(()=> {
    socket.on("newMessage", (data)=>{
        setAllMessages((allMessages)=>[...allMessages, data.msg])
        console.log(data)
    });
    async function getMessages() {
        try {
            const response = await axios.get('api/messages')
            console.log('all messages :', response.data)
            setAllMessages(response.data)
        }
        catch(err) {
            console.log(err)
        }
    }

    getMessages();
}, [])

// useEffect(()=>{
//     console.log(loggedInUsers)
 const checkit = localStorage.getItem('userId');
 console.log(checkit)
//     // const checkitname = localStorage.getItem('username');
//     // console.log(checkitname)

   
// })

const allUsers = loggedInUsers.map(user => {
    return <Usercard key={user.id} username={user.username}/>
  })

const allChats = allmessages.map(msg => {
    return <Card key={msg.chat_id}>{msg.username}: {msg.text}</Card>
})

  return <div>
      <Container
        className="chatContainer"
      >
            <Card
                className="chat_usersArea"
                border="warning"
                style={{backgroundColor: "transparent"
                        }}
            >
                {allUsers} 
            </Card>
  
            <Card
                className="chat_area"
                border="warning"
                style={{background: "transparent"
                        }}
            >
                {allChats}  
            </Card>
   
        </Container>

        <div
            className="message_area"
        >

            <InputGroup 
                className="chat_input"
            >
            <FormControl        
                type="text"     
                placeholder="Type your message here"
                value={messageInputValue}
                onChange={event=>setMessageInputValue(event.target.value)}
            />
                <Button
                    onClick={postMsg}
                    variant="warning"
                    className="chat_button--post"
                >Post
                </Button> 
            </InputGroup>

        </div>

        <div
            className="chat_logoutarea"
        >

        <Button
            onClick={logOut}
            className="chat_button"
            variant="secondary"
        >Log Out
        </Button>

        </div>

  </div>
}

