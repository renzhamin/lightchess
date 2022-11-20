import { createTheme } from "@mui/material"

const themeLight = createTheme({
    palette: {
        primary: {
            main: "#2A54DB",
        },
        secondary: {
            main: "#E1FAFD",
        },
        background: {
            default: "#f0ecec",
        },
    },
    typography: {
        fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
    },
})

const themeDark = createTheme({
    palette: {
        background: {
            default: "#222222",
        },
        text: {
            primary: "#ffffff",
        },
    },
})

// lightchess logo color is "#3b97f2"
export { themeLight, themeDark }
