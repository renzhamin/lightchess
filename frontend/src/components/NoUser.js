import * as React from "react"
import { useLocation } from "react-router-dom"
import Typography from "@mui/material/Typography"

function PgnViewer() {
    const location = useLocation()
    const username = location.pathname.split("/").at(-1)
    return (
        <>
            <Typography variant="h1" textAlign={"center"} gutterBottom>
                Oops!!!
            </Typography>
            <Typography variant="h2" textAlign={"center"} gutterBottom>
                We couldn't find the user "{username}"
            </Typography>

            <Typography variant="h4" textAlign={"center"} gutterBottom>
                Make sure the username is correct.
            </Typography>
        </>
    )
}

export default PgnViewer
