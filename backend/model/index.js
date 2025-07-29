


import User from './userModel.js'
import Message from './messageModel.js'
import Group from './groupModel.js';


User.hasMany(Message, {foreignKey:'userId', onDelete:'CASCADE'});
Message.belongsTo(User, {foreignKey:'userId'})

User.hasMany(Group, {foreignKey:'userId', onDelete:'CASCADE'});
Group.hasMany(User, {foreignKey:'userId'})

Message.belongsTo('Group', {foreignKey:'messageId', onDelete:'CASCADE'})
Group.hasMany('Message', {foreignKey:'messageId'})


export default {
    User, Message
}