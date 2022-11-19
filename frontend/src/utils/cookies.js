import jwt_decode from "jwt-decode"

export function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === " ") {
            c = c.substring(1)
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

export function hasValidRefreshToken() {
    const token = getCookie("refreshToken")
    if (token === "") return false
    const decoded = jwt_decode(token)
    const cDate = new Date()
    return decoded.exp * 1000 < cDate.getTime() ? false : true
}
