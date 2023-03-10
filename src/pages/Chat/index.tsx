import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { MessageType } from "../../types/message.types";
import chatApi from "../../api/chat-api";
import "./index.css";
import Contents from "./contents";

function parseChunkToContents(chunk: Uint8Array): string[] {
  const chunkData: string = new TextDecoder().decode(chunk);
  const dataArray: string[] = chunkData
    .trim()
    // Since the format of chunkData as follows: "data: {...} \n data: {...} ...",
    // use the split method to separate each data JSON string object
    .split("data:") 
    // Remove the content of the array at index 0 because it is ""
    .filter(str => str !== "")
    // Each JSON string object containing data may have leading and trailing whitespace and newline characters, 
    // which need to be stripped or cleaned. 
    .map(str => str.trim());

  const contents = dataArray.map(data => {
    const jsonData = data.includes("[DONE]") ? null : JSON.parse(data);
    return jsonData ? jsonData.choices[0].delta.content || "" : "";
  });
  return contents;
}

const Chat = () => {
  const [content, setContent] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const chatPaneRef = useRef<HTMLInputElement>(null);;

  const submitMessages = async () => {
    if (!content) {
      alert("There is no text in the input box!");
      return;
    }

    try {
      const requestMessages = [...messages, { role: "user", content }];
      setContent("");
      setMessages(requestMessages);

      const asyncStream = await chatApi(requestMessages);

      if (!asyncStream) throw new Error("stream is null");
      
      const newMessages = [...requestMessages, { role: "assistant", content: "" }]
      for await (const chunk of asyncStream) {
        const contents = parseChunkToContents(chunk);
        const lastMessage = newMessages[newMessages.length - 1]; 
        lastMessage.content += contents.join(""); 
        setMessages([...newMessages.slice(0, -1), lastMessage]);
        if (chatPaneRef.current) {
          chatPaneRef.current.scrollTop = chatPaneRef.current.scrollHeight;
        }
      }
    } catch (error) {
      console.error(error)
    }
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
        <div className="chat-pane" ref={chatPaneRef}>
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