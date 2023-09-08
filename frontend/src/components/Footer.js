import { Link, Typography } from "@mui/material"

export function Footer(props) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            marginTop={5}
            marginBottom={1}
            {...props}
        >
            {"Copyright © "}
            <Link
                color="inherit"
                href="https://github.com/renzhamin/lightchess"
            >
                renzhamin
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    )
}
