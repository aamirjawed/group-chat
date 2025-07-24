import jwt from 'jsonwebtoken'
import User from '../model/userModel'

export const authUser = async(req, res, next) => {

try {
    const {token} = req.cookies

    if(!token){
        throw new Error("Token is not valid")
    }

    const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET)
    const {userId} = decodedMessage

    const user = User.findByPk(userId)

    if(!user){
        throw new Error("User not found")
    }

    next()
} catch (error) {
    console.log("Error in auth middleware", error.message)
    res.status(400).json({
        success:false,
        error:"Server side error"
    })
}
    
}