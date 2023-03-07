import { Link } from "react-router-dom";
import "./index.css";

const Chat = () => {
  return (
    <div className="chat flex flex-center-center">
      <div className="wrapper flex flex-column">
        <Link to="/" className="back btn font-size-4">Back</Link>
        <div className="chat-pane">
        </div>
        <div className="input-pane flex">
          <textarea className="user-input"/>
          <div className="btn font-size-4">Enter</div>
        </div>
      </div>
    </div>
  )
}

export default Chat;