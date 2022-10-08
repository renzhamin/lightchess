import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App.js";

export const Chat = (props) => {
    const { userMap, initSocket, setUserMap, socket } = useContext(AppContext);
    const { name } = props;

    useEffect(() => {
        initSocket(name);
    });

    const [userList, setUserList] = useState([]);
    const [text, setText] = useState("");
    const [receiver, setReceiver] = useState({});

    const sendMessage = (e) => {
        e.preventDefault();
        socket.emit("message", { to: receiver.id, msg: text });
        updateUserList();
    };

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

    const handleReceiverChange = (e) => {
        e.preventDefault();
        updateUserList();
        const selectedIndex = e.target.options.selectedIndex;
        const id = e.target.options[selectedIndex].getAttribute("id");
        setReceiver({ id, name: e.target.value });
    };

    const handleTextChange = (e) => {
        e.preventDefault();
        updateUserList();
        setText(e.target.value);
    };

    return (
        <div>
            <form onSubmit={sendMessage}>
                <label htmlFor="Receiver">Choose Receiver</label>
                <select name="Receiver" onChange={handleReceiverChange}>
                    <option value="Select Receiver">Select Receiver</option>
                    {userList.map((user) => {
                        return (
                            <option
                                key={user.id}
                                id={user.id}
                                value={user.name}
                            >
                                {user.name}
                            </option>
                        );
                    })}
                </select>
                <input
                    type="text"
                    id="message"
                    placeholder="message"
                    value={text}
                    onChange={handleTextChange}
                />
            </form>
        </div>
    );
};
