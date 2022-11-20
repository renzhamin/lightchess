import { Grid, Typography } from "@mui/material"
import { Box } from "@mui/system"
import lightchess_logo_blue from "./static/images/lightchess_logo_blue.png"

const NotFound = () => {
    return (
        <Grid container align="center" justify="center" alignItems="center">
            <Grid item>
                <img
                    style={{ width: 200, height: 200 }}
                    src={lightchess_logo_blue}
                    alt="lightchess-logo"
                />
            </Grid>
            <Grid item>
                <Typography variant="h1" textAlign={"center"} gutterBottom>
                    404
                </Typography>

                <Typography variant="h5" textAlign={"center"} gutterBottom>
                    Oops! User doesn't exist within the 64 squares of this
                    chessboard.
                </Typography>
            </Grid>
        </Grid>
    )
}

export default NotFound
