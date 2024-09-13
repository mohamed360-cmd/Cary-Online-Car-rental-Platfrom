import { useEffect, useState } from "react"
import "./SupportArea.css"
import {IoMdSend} from "react-icons/io"
import {MdOutlineSupportAgent} from 'react-icons/md'

export default function SupportSection({ userGlobalData }) {
    const [messageList, setMessageList] = useState([])
    const [oToMsg, setOtoMsgs] = useState([])//this is the one to one Message btw the user and the support team
    const [toEmail ,setToEmail] = useState("")
    const [replyMsg,setReplyMsg] = useState("")
    const getSupportMessages = async () => {
        try {
            const res = await fetch('http://localhost:8080/spMessageGet', {
                method: "POST",
                headers: {
                    'Content-type': "application/json"
                },
                body: JSON.stringify({
                    Email: "support@cary.com"
                })
            })
            const data = await res.json()
            
            setMessageList(data)
        } catch (error) {
            console.log("error in the getSupportMessages Function", error)
        }
    }
        //this funtion send the support messages to the server 
        const sendMessage = async(msg)=>{
            try {
                const res = await fetch("http://localhost:8080/spMessageSave",{
                    method : "POST",
                    headers :{"content-type" : "application/json"},
                    body : JSON.stringify(msg)
                })
            } catch (error) {
                console.log('Error in the sendMessage function /landingpage line 99->',error)
            }
          }
    const sendMsgHandler= () => {
        console.log(toEmail)
        if(replyMsg.length>1 && replyMsg != " "){
            const localPushMsg = 
            {
                From : "support@cary.com",
                To  : toEmail,
                messageContent    : replyMsg,
                timeStamp : Math.random() *1000,
            }
            //this message will be localy pushed to increase performance
            setOtoMsgs([...oToMsg,localPushMsg])
            //this is the message which will be sent to the database for persistant storage 
            const remoteMessage ={
                From : "support@cary.com",
                To : toEmail,
                senderRole : userGlobalData.Role,
                messageContent : replyMsg
            } 
            sendMessage(remoteMessage)
    
        }
      }
    const replyMsgHandler = async (FromAddress) => { //this get all the support related messages  
        setToEmail(FromAddress)
        setOtoMsgs([])
        try {
            const res = await fetch("http://localhost:8080/spMessageGet", {
                method: "POST",
                headers: {
                    'Content-type': "application/json"
                },
                body: JSON.stringify({
                    Email: "support@cary.com"
                })
            })
            const data = await res.json();
            setOtoMsgs(data)
            console.log(data[0].From)
            setToEmail(data[0].To = "support@cary.com" ? data[0].From : data[0].To)
        } catch (error) {
            console.log("error in the replyMsgHandler Function", error)
        }

    }
    useEffect(() => {
        getSupportMessages()
    }, [])
    return (
        <div className="mainSupportContainer">
            <div className="mainSupportMessagingContainer">
                <div className="messageTilesMainContainer">
                    {
                        messageList.length > 0 && messageList.map(msg => {
                            if (msg.From == "support@cary.com") {
                                return null;
                            } else {
                                return (
                                    <div className="MessageTile" key={msg._id}>
                                        <div className="senderInitalsContainer">
                                            <p className="senderInitals">{msg.From[0].toUpperCase() + "" + msg.From[1]}</p>
                                        </div>
                                        <div className="msgContentContainer">
                                            <div className="sendersEmail">
                                                <p>From : {msg.From}</p>
                                            </div>
                                            <div className="latestMsgContent">
                                                <p>{msg.messageContent.length > 50 ? msg.messageContent.slice(0, 40) + "..." : msg.messageContent}</p>
                                            </div>
                                        </div>
                                        <div className="messageTileActionContainer">
                                            <button className="messageTileActionBtn ReplyMsg" onClick={() => replyMsgHandler(msg.From)}>Reply</button>
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }
                    {
                        messageList.length == 0 && <div>
                            <h3>No Messages</h3>
                        </div>
                    }

                </div>
                <div className="mainChatingScreen">
                    <div className="mainChatingScreenHeader">
                        <h2>Cary Support Messaging </h2>
                    </div>
                    {
                        oToMsg.length == 0 && <p>Click a  tile to start chating with a Client </p>
                    }
                    {
                        oToMsg.length > 0 && 
                        <div className="chatbox">
                        <div className="chatDisplayContainer">
                            { 
                                oToMsg.map(message=>{
                            return(
                                <div className={message.From == "support@cary.com" ? "SupportMessageBubble" : "MessageBubble"}>
                                        { message.From == "support@cary.com" && <MdOutlineSupportAgent/>}
                                        <p className="ActualMessage"> {message.messageContent}</p>
                                    </div>
                            )
                        })
                        }
                        </div>
                        <div className="msgInputBtnContainer">
                                <input className="supportInputField" type="text" placeholder={`Chating with client`} onChange={e=>setReplyMsg(e.target.value)} />
                                <button className="SendMessageBtn" onClick={sendMsgHandler} ><IoMdSend /></button>
                            </div>
                        </div>

                    }
                </div>
            </div>
        </div>
    )
}