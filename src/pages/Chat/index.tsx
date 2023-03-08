import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageType } from "../../types/message.types";
import chatApi from "../../api/chat-api";
import "./index.css";

const Chat = () => {
  const [content, setContent] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  const submitMessages = async () => {
    if (!content) {
      alert("There is no text in the input box!");
      return;
    }

    try {
      const requestMessages = [...messages, {
        role: "user",
        content
      }];
      const message = await chatApi(requestMessages);
      if (!message) throw "message is undefined!";
      const newMessage = [...requestMessages, message];

      setContent("");
      setMessages(newMessage);
    } catch (error) {
      alert(error);
    }
  }

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  }

  return (
    <div className="chat flex flex-center-center">
      <div className="wrapper flex flex-column">
        <Link to="/" className="back btn font-size-4">Back</Link>
        <div className="chat-pane">
          {messages.map((message, index) => {
            return (
              <div 
                key={message.role + index}
                className={message.role === "user" ? "user-pane" : "assistant-pane"}
              >
                <h3>{message.role}</h3>
                <p>{message.content}</p>
              </div>
            )
          })}
        </div>
        <div className="input-pane flex">
          <textarea className="user-input" value={content} onChange={handleContentChange} />
          <button className="btn font-size-4" onClick={submitMessages}>Enter</button>
        </div>
      </div>
    </div>
  )
}

export default Chat;