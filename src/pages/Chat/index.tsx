import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageType } from "../../types/message.types";
import chatApi from "../../api/chat-api";
import "./index.css";

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
      }
    } catch (error) {
      console.error(error)
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