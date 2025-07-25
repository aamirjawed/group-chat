import User from "../model/userModel.js"

export const dashboardController = async(req, res) => {
   const {token} = req.cookies

   const {id} = req.user;


   const user = await User.findByPk(id, {
    attributes:{exclude:['password']}
   })

   res.send(user)

   
}