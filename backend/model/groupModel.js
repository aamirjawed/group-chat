import { DataTypes } from "sequelize";
import sequelize from "../utils/db-connection";

const Group = sequelize.define('Group', {
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
    },

    groupName:{
        type:DataTypes.STRING,
        allowNull:false
    },

    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    messageId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
})

export default Group;