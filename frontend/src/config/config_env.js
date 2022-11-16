let backend = ""
let backend_ws = ""

if (process.env.NODE_ENV === "development") {
    backend = process.env.REACT_APP_BACKEND_URL
    backend_ws = process.env.REACT_APP_WEB_SOCKET_URL
}

export const config = {
    backend,
    backend_ws,
}
