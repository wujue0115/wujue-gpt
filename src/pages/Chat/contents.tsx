import { memo } from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { MessageType } from "../../types/message.types";

// Use memo to store messages data and only re-render when the messages data is updated.
const Contents: React.FC<{messages: MessageType[]}> = memo(({ messages }) => {
  // Combine the code string into a single entity.
  const refactorMessages = (messages: MessageType[]) => {
    const newMessages = [];
    for (const message of messages) {
      const contents = message.content.split("\n").filter(str => str !== "");
      const newContents = [];
      for (let i = 0; i < contents.length; ++i) {
        if (contents[i].startsWith("```")) {
          let codeContent = "$codeblock[language]" + contents[i].substring(3) + "[language]";
          while (++i < contents.length && contents[i] !== "```") {
            codeContent += "\n" + contents[i];
          }
          newContents.push(codeContent);
        } else {
          newContents.push(contents[i]);
        }
      }
      newMessages.push({
        role: message.role,
        contents: newContents,
      });
    }
    return newMessages;
  }
  
  return (
    <div>
      {refactorMessages(messages).map((message, mIndex) => {
        return message.contents.map((content, cIndex) => {
          return (
            <div 
              key={message.role + mIndex + cIndex}
              className={"flex  " + (message.role === "user" ? "user-pane" : "assistant-pane")}
            >
              <div className="content-pane">
                {content.startsWith("$codeblock") ?
                  <SyntaxHighlighter 
                    language={content.split("[language]")[1]} 
                    style={a11yDark} 
                    showLineNumbers
                    customStyle={{ borderRadius: "5px" }}
                  >
                    {content.split("[language]")[2].trim()}
                  </SyntaxHighlighter> :
                  <p>{content}</p>
                }
              </div>
            </div>
          )
        })
      })}
    </div>
  )
});

export default Contents;