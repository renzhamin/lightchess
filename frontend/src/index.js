import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import axios from "axios"
axios.defaults.withCredentials = true

const rootElement = document.getElementById("root")
ReactDOM.render(<App />, rootElement)
