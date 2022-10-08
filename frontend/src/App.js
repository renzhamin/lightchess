import { BrowserRouter, Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import PgnViewer from "./components/PgnViewer";
import Board from "./components/Chessboard";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Login />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/dashboard">
          <Navbar />
          <Dashboard />
        </Route>
        <Route path="/pgnviewer">
          <Navbar />
          <PgnViewer />
        </Route>
        <Route path="/play">
          <Navbar />
          <Board />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
