let backend = ""

if (process.env.NODE_ENV === "development")
    backend = process.env.REACT_APP_BACKEND_URL

export const config = {
    backend,
}
