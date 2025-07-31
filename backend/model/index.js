


import User from './userModel.js'
import Message from './messageModel.js'
import Group from './groupModel.js';
import GroupMember from './groupMemberModel.js';


User.hasMany(Message, {foreignKey:'userId', onDelete:'CASCADE'});
Message.belongsTo(User, {foreignKey:'userId'})


Message.belongsTo(Group, {foreignKey:'messageId', onDelete:'CASCADE'})
Group.hasMany(Message, {foreignKey:'messageId'})

User.belongsToMany(Group, {
    through:GroupMember,
    foreignKey:'userId',
    otherKey:'groupId',
    as:'groups'
})

Group.belongsToMany(User,{
    through:GroupMember,
    foreignKey:'groupId',
    otherKey:'userId',
    as:'members'
})

User.hasMany(GroupMember, {foreignKey:'userId', as:'memberships'});
GroupMember.belongsTo(User, {foreignKey:'userId'})

Group.hasMany(GroupMember, {foreignKey:'groupId', as:'memberships'})
GroupMember.belongsTo(Group, {foreignKey:'groupId'})




export default {
    User, Message, Group, GroupMember
}