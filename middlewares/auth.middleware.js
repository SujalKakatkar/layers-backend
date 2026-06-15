import { sendError } from "../utils/apiHandler.js";
import jwt from 'jsonwebtoken'

//middlware to check if the access token is valid or not
export function verifyToken(req, res, next) {
    try {
        
        const token = req.cookies.accessToken;
        console.log(req.cookies);
        

        if (!token) {
            return sendError(res, 401, null, "Unauthorized, no token found")
        }

        const payload = jwt.verify(token, process.env.ACCESS_SECRET);

        req.user = payload;

        next();

    } catch (error) {
        return sendError(res, 401, null, "Unauthorized, no token")
    }
}