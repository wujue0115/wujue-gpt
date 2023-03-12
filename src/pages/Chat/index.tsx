import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MessageType } from "../../types/message.types";
import chatApi from "../../api/chat-api";
import "./index.css";
import Contents from "./contents";
import { parseChunkToContents, autoScrollDown } from "./utils";

const Chat = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [userWheelInfo, setUserWheelInfo] = useState<{ hasUserWheel: boolean, deltaY: number }>({ hasUserWheel: false, deltaY: 0 });
  const [menuActive, setMenuActive] = useState<boolean>(false);
  const chatPaneRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submitMessages = async () => {
    const userQuestion = textareaRef.current!.value;
    textareaRef.current!.value = "";
    textareaRef.current!.style.height = "0";
    textareaRef.current!.style.height = textareaRef.current!.scrollHeight + "px";
    if (!userQuestion) {
      alert("There is no text in the input box!");
      return;
    }

    const requestMessages = [...messages, { role: "user", content: userQuestion }];
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

  const handleContentInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = "0";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  const handleResetClick = () => {
    setMessages([]);
    setMenuActive(false);
  }

  return (
    <div className="chat flex flex-center-center">
      <div className="wrapper flex flex-column">
        <Link to="/" className="back btn font-size-4">Back</Link>
        <div className="chat-pane" ref={chatPaneRef} onWheel={handleChatPaneWheel}>
          <Contents messages={messages} />
        </div>
        {menuActive && 
          <div className="menu-pane">
            <div className="btn font-size-4" onClick={handleResetClick}>Reset</div>
          </div>
        }
        <div className="input-pane flex">
          <div className="menu flex flex-center-center">
            <div 
              className={"hamburger flex flex-column " + (menuActive ? "active" : "") } 
              onClick={() => { setMenuActive(!menuActive) }}
            >
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
          </div>
          <textarea 
            className="user-input" 
            ref={textareaRef}
            onInput={handleContentInput} 
            placeholder="Please type out your questions..."
          ></textarea>
          <div className="btn font-size-4" onClick={submitMessages}>Enter</div>
        </div>
      </div>
    </div>
  )
};

export default Chat;