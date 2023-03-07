import { Link } from "react-router-dom";
import "./index.css";

const Root = () => {
  return (
    <div className="root flex flex-column flex-center-center">
      <h1 className="title">Welcome to the Wujue GPT</h1>
      <div>
        <Link className="link btn font-size-2" to="/chat">Start</Link>
      </div>
    </div>
  )
}

export default Root;