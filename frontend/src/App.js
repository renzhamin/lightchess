import { BrowserRouter, Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import PgnViewer from "./components/PgnViewer";

import { io } from "socket.io-client";
import React from "react";
import { useState } from "react";

export const AppContext = React.createContext();

const socket = io("ws://localhost:5000", { autoConnect: false });

socket.on("welcome", (data) => {
    console.log(data);
});

socket.on("message", (data) => {
    console.log("Got Data : ", data);
});

const initSocket = (name) => {
    if (socket.connected === true || name === "") return;
    socket.connect();
    console.log("Inited socket with", name);
    socket.emit("name", name, (response) => {
        console.log(response);
    });
};

function App() {
    const [userMap, setUserMap] = useState(new Map());

    return (
        <AppContext.Provider
            value={{ userMap, setUserMap, socket, initSocket }}
        >
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
                </Switch>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
