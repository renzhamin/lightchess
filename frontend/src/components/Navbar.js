import React, { useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AppContext } from "../App.js";

const Navbar = () => {
    const { socket } = useContext(AppContext);
    const history = useHistory();

    const Logout = async () => {
        try {
            await axios.delete("http://localhost:5000/api/logout");
            history.push("/");
            socket.disconnect();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <nav
            className="navbar is-light"
            role="navigation"
            aria-label="main navigation"
        >
            <div className="container">
                {/*                <div className="navbar-brand">
                    <a className="navbar-item" href="">
                        <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28" alt="logo" />
                    </a>

                    <a href="/" role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>
*/}

                <div id="navbarBasicExample" className="navbar-menu">
                    <div className="navbar-start">
                        <a href="/" className="navbar-item">
                            Home
                        </a>
                    </div>

                    <div className="navbar-end">
                        <div className="navbar-item">
                            <div className="buttons">
                                <button
                                    onClick={Logout}
                                    className="button is-light"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
