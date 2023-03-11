import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MessageType } from "../../types/message.types";
import chatApi from "../../api/chat-api";
import "./index.css";
import Contents from "./contents";
import { parseChunkToContents, autoScrollDown } from "./utils";

const Chat = () => {
  const [content, setContent] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [hasUserWheel, setHasUserWheel] = useState<boolean>(false);
  const [userWheelDeltaY, setUserWheelDeltaY] = useState<number>(0);
  const chatPaneRef = useRef<HTMLInputElement>(null);

  const submitMessages = async () => {
    if (!content) {
      alert("There is no text in the input box!");
      return;
    }

    try {
      const requestMessages = [...messages, { role: "user", content }];
      setContent("");
      setMessages(requestMessages);
      setHasUserWheel(false);

      const asyncStream = await chatApi(requestMessages);

      if (!asyncStream) throw new Error("stream is null");
      
      const newMessages = [...requestMessages, { role: "assistant", content: "" }]
      for await (const chunk of asyncStream) {
        const contents = parseChunkToContents(chunk);
        const lastMessage = newMessages[newMessages.length - 1]; 
        lastMessage.content += contents.join(""); 
        setMessages([...newMessages.slice(0, -1), lastMessage]);
      }
    } catch (error) {
      console.error(error)
    }
  } 
  
  const updateScroll = () => {
    if (!chatPaneRef.current) return;
    autoScrollDown(chatPaneRef.current, hasUserWheel, userWheelDeltaY);
  }

  useEffect(() => {
    updateScroll();
  }, [messages]);

  const handleChatPaneWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    setUserWheelDeltaY(event.deltaY);
    setHasUserWheel(true); 
  }

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event.target.style.height = "0px";
    event.target.style.height = event.target.scrollHeight + "px";
    setContent(event.target.value);
  }

  return (
    <div className="chat flex flex-center-center">
      <div className="wrapper flex flex-column">
        <Link to="/" className="back btn font-size-4">Back</Link>
        <div className="chat-pane" ref={chatPaneRef} onWheel={handleChatPaneWheel}>
          <Contents messages={messages} />
        </div>
        <div className="input-pane flex">
          <textarea 
            className="user-input" 
            placeholder="Please type out your questions..."
            value={content} 
            onChange={handleContentChange} />
          <div className="btn font-size-4" onClick={submitMessages}>Enter</div>
        </div>
      </div>
    </div>
  )
}

export default Chat;