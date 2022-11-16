import React, { useContext, useState } from "react"
import axios from "axios"
import { useHistory } from "react-router-dom"
import { AppContext } from "../App"
import { config } from "../config/config_env"

const Register = () => {
    const { username, setUserName } = useContext(AppContext)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confPassword, setConfPassword] = useState("")
    const [msg, setMsg] = useState("")
    const history = useHistory()

    const Register = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${config.backend}/api/register`, {
                username,
                email,
                password,
                confPassword,
            })
            history.push("/")
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg)
            }
        }
    }

    return (
        <section className="hero has-background-grey-light is-fullheight is-fullwidth">
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-4-desktop">
                            <form onSubmit={Register} className="box">
                                <p className="has-text-centered">{msg}</p>
                                <div className="field mt-5">
                                    <label className="label">Username</label>
                                    <div className="controls">
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) =>
                                                setUserName(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="field mt-5">
                                    <label className="label">Email</label>
                                    <div className="controls">
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="field mt-5">
                                    <label className="label">Password</label>
                                    <div className="controls">
                                        <input
                                            type="password"
                                            className="input"
                                            placeholder="********"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="field mt-5">
                                    <label className="label">
                                        Confirm Password
                                    </label>
                                    <div className="controls">
                                        <input
                                            type="password"
                                            className="input"
                                            placeholder="********"
                                            value={confPassword}
                                            onChange={(e) =>
                                                setConfPassword(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="field mt-5">
                                    <button className="button is-success is-fullwidth">
                                        Register
                                    </button>
                                </div>
                                <div className="field mt-5">
                                    <p>Already have an account?</p>
                                    <a href="login">Login</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Register
