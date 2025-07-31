// groupModel.js
import { DataTypes } from "sequelize";
import sequelize from "../utils/db-connection.js";

const Group = sequelize.define('Group', {
    id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    groupName:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdBy:{ // The user who created the group
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
})

export default Group;