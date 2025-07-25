import {Sequelize, DataTypes} from 'sequelize'
import sequelize from '../utils/db-connection.js'


const Message = sequelize.define('messages', {
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true

    },

    userMessage:{
        type:DataTypes.TEXT,
        allowNull:false
    },

    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
})

export default Message