function parsePgn(pgn) {
    var moves = []
    const neopgn = pgn.split(" ")
    for (let i = 0; i < neopgn.length; i += 3) {
        if (i + 2 < neopgn.length) {
            moves[i / 3] = {
                whiteMove: neopgn[i + 1],
                blackMove: neopgn[i + 2],
            }
        } else {
            moves[i / 3] = { whiteMove: neopgn[i + 1], blackMove: "" }
        }
    }
    return moves
}

// parsePgn("1. e3 e6 2. d4 d6 3. d5 exd5 4. e4 dxe4 5. f3 exf3 6. Nxf3")
export default parsePgn
