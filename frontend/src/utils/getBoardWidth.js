export function getBoardWidth() {
    const ww = window.innerWidth
    const wh = window.innerHeight
    let w = ww

    if (ww <= 500) w = ww - 10
    else if (ww <= 800) w = ww - 20
    else {
        w = 720
    }

    if (w > wh) w = wh - 10

    return w
}
