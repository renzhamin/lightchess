import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App.js";

export const Chat = (props) => {
  const { initSocket, socket, updateUserList, userList } =
    useContext(AppContext);
  const { name } = props;

  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState({});

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("message", { to: receiver.id, msg: text });
  };

  const handleReceiverChange = (e) => {
    e.preventDefault();
    const selectedIndex = e.target.options.selectedIndex;
    const id = e.target.options[selectedIndex].getAttribute("id");
    setReceiver({ id, name: e.target.value });
  };

  const handleTextChange = (e) => {
    e.preventDefault();
    setText(e.target.value);
  };

  return (
    <div>
      <form onSubmit={sendMessage}>
        <label htmlFor="Receiver">Choose Receiver</label>
        <select
          name="Receiver"
          onChange={handleReceiverChange}
          onMouseOver={() => {
            initSocket(name);
            updateUserList();
          }}
        >
          <option value="Select Receiver">Select Receiver</option>
          {userList &&
            userList.map((user) => {
              return (
                <option key={user.id} id={user.id} value={user.name}>
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
