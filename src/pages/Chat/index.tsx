import { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { MessageType } from "../../types/message.types";
import chatApi from "../../api/chat-api";
import "./index.css";
import Contents from "./contents";
import { parseChunkToContents, autoScrollDown } from "./utils";

const Chat = () => {
  const [content, setContent] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [userWheelInfo, setUserWheelInfo] = useState<{ hasUserWheel: boolean, deltaY: number }>({ hasUserWheel: false, deltaY: 0 });
  const chatPaneRef = useRef<HTMLInputElement>(null);

  const submitMessages = async () => {
    if (!content) {
      alert("There is no text in the input box!");
      return;
    }

    const requestMessages = [...messages, { role: "user", content }];
    setContent("");
    setMessages(requestMessages);
    setUserWheelInfo({ hasUserWheel: false, deltaY: 0 });

    try {
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
  
  useEffect(() => {
    updateChatPaneScroll();
  }, [messages]);

  const updateChatPaneScroll = () => {
    if (!chatPaneRef.current) return;
    autoScrollDown(chatPaneRef.current, userWheelInfo.hasUserWheel, userWheelInfo.deltaY);
  }

  const handleChatPaneWheel = ({ deltaX, deltaY }: React.WheelEvent<HTMLDivElement>) => {
    if (deltaX) return;
    setUserWheelInfo({ hasUserWheel: true, deltaY });
  }

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = textarea.scrollHeight + "px";
    setContent(textarea.value);
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
};

export default Chat;