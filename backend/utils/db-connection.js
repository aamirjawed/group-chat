
import { Sequelize } from "sequelize";


const sequelize =  new Sequelize("groupchat", "root", "8083571820",{
    host:"localhost",
    dialect:"mysql"
});


(async () => {
    try {
        await sequelize.authenticate()
        console.log("Database connected")
    } catch (error) {
        console.log("Error in db-connection in utils", error.message)
    }
})()


export default sequelize