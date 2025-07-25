import jwt from 'jsonwebtoken'
import User from '../model/userModel.js'

export const authUser = async (req, res, next) => {
    try {
        const { token } = req.cookies

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "No token provided",
                message: "Token not valid"
            })
        }

        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET)
        const { id } = decodedMessage

        const user = await User.findByPk(id)

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "Token not valid"
            })
        }

        req.user = user
        next()

    } catch (error) {
        console.log("Error in auth middleware:", error.message)
        return res.status(401).json({
            success: false,
            error: "Invalid token",
            message: "Token not valid"
        })
    }
}