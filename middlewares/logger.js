
const logger = (req, res, next) => {
    const { rawHeaders, httpVersion, method, socket, url, body } = req;
    const { remoteAddress, remoteFamily } = socket;
    const { statusCode, statusMessage } = res;
    const headers = res.getHeaders();
    console.log(
        JSON.stringify({
            timestamp: Date.now(),
            rawHeaders,
            body,
            httpVersion,
            method,
            remoteAddress,
            remoteFamily,
            url,
            response: {
                statusCode,
                statusMessage,
                headers
            }
        }).yellow.bgBlue
    );
    next();
}

module.exports = logger;