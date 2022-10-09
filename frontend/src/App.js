import { BrowserRouter, Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import PgnViewer from "./components/PgnViewer";
import Board from "./components/Chessboard";

import { io } from "socket.io-client";
import React from "react";
import { useState } from "react";

export const AppContext = React.createContext();

const socket = io("ws://localhost:5000", { autoConnect: false });

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
    const [userList, setUserList] = useState([]);

    const updateUserList = () => {
        socket.emit("getusers", "args", (usermap) => {
            let newUserMap = new Map(Object.entries(usermap));
            let users = [];
            newUserMap.forEach((value, key) => {
                users.push({ id: key, name: value.name });
            });
            setUserMap(newUserMap);
            setUserList([...users]);
        });
    };

    return (
        <AppContext.Provider
            value={{
                userList,
                updateUserList,
                socket,
                initSocket,
            }}
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
                    <Route path="/play">
                        <Navbar />
                        <Board />
                    </Route>
                </Switch>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
