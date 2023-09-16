export function revivalBack(goBack) {
    window.onpopstate = undefined
    if (goBack === true) {
        window.history.back()
    }
}

export function neutralizeBack(callback) {
    window.history.pushState(null, "", window.location.href)
    window.onpopstate = () => {
        window.history.pushState(null, "", window.location.href)
        callback()
    }
}
