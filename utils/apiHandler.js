class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

class ApiError  {
    constructor(statusCode, message = "Something went wrong") {
        this.statusCode = statusCode
        this.message = message
        this.success = false
    }
}

export function sendResponse(res, statusCode, data = null, message = "Success") {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message))
}

export function sendError(res, statusCode, message = "Something went wrong") {
    return res.status(statusCode).json(new ApiError(statusCode, message))
}

export { ApiResponse, ApiError }