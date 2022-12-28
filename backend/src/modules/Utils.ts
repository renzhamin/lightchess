export const get_url_from_req = (req) => {
    const url = req.protocol + "://" + req.get("host") + req.originalUrl
    return url
}
