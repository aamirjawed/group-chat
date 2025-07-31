// import GroupMember from "../model/groupMemberModel.js"
// import Group from "../model/groupModel.js"
// import User from "../model/userModel.js"

import {GroupMember, Group, User} from '../model/index.js'


export const createGroup = async(req, res) => {
    try {
        

        const {groupName, description} = req.body

        if(!groupName){
            return res.status(400).json({
                success:false,
                error:"No group name is given",
                message:"Group name cannot be empty"
            })
        }

        const userId = req.userId;

        // check to ensure userId exists
        if (!userId) {
            console.log("ERROR: req.userId is undefined!");
            console.log("req.user exists:", !!req.user);
            console.log("req.user.id:", req.user?.id);
            
            return res.status(401).json({
                success: false,
                error: "Authentication failed",
                message: "User ID not found. Auth middleware may not have run."
            });
        }

        console.log("Using userId:", userId);

        // Debug user data
        const user = await User.findByPk(userId);
        console.log("User lookup result:", user ? `Found: ${user.fullName} (${user.email})` : "Not found");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                message: "User does not exist in database"
            });
        }

        
        // Create the group with userId as createdBy (for database relationships)
        const group = await Group.create({
            groupName,
            description: description || null,
            createdBy: userId
        });

        
        // Create GroupMember entry (make the creator an admin)
        console.log("Creating group membership...");
        const groupMember = await GroupMember.create({
            groupId: group.id,
            userId: userId,
            role: 'admin'
        });


        // Send response with both ID and creator name
        res.status(201).json({
            success: true,
            message: "Group created successfully",
            data: {
                id: group.id,
                groupName: group.groupName,
                description: group.description,
                createdBy: {
                    id: userId,
                    name: user.fullName,
                    email: user.email
                },
                createdAt: group.createdAt,
                role: 'admin' 
            }
        });

    } catch (error) {
        console.log("ERROR in create group controller:", error.message);
    
        res.status(500).json({
            success: false,
            error: "Internal Server error", 
            message: "Something went wrong while creating group",
        });
    }
}



export const addUserToGroup = async(req,res) => {
    try {
        const {groupId} = req.params;
        const {userIds} = req.body;
        const requesterId = req.userId;

        const requesterMembership =  await GroupMember.findOne({
            where:{
                groupId,
                userId:requesterId,
                role:'admin'
            }
        });

        if(!requesterMembership){
            return res.status(403).json({
                success:false,
                message:"Only group admins can add members"
            })
        }


        const group = await Group.findByPk(groupId)

        if(!group){
            return res.status(404).json({
                success:false,
                message:"Group not found"
            })
        }

        const addedUsers = [];
        const failedUsers = [];


        for(const userId of userIds){
            try {
                const user = User.findByPk(userId)
                if(!user){
                    failedUsers.push({userId, reason:"User not found"})
                    continue;
                }

                const existingMembership = await GroupMember.findOne({
                    where:{groupId, userId}
                });

                if(existingMembership){
                    failedUsers.push({userId, reason:"User already a member"});
                    continue;
                }

                await GroupMember.create({
                    groupId,
                    userId,
                    role:"member"
                })

                addedUsers.push({
                    userId,
                    fullName:user.fullName,
                    email:user.email
                })
            } catch (error) {
                failedUsers.push({userId, reason:error.message})
            }
        }

        res.status(200).json({
            success:true,
            message:"Users processed",
            data:{
                addedUsers,
                failedUsers
            }
        })
    } catch (error) {
        console.log("Error in add user to group controller", error.message)
        res.status(500).json({
            success: false,
            error: "Internal Server error",
            message: "Something went wrong while adding users to group"
        })
    }
}


export const getUserGroups = async (req, res) => {
    try {
        
        
        const userId = req.userId;


        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication failed",
                message: "User ID not found"
            });
        }

        // Method 1: Using the many-to-many association
        const userGroups = await Group.findAll({
            include: [
                {
                    model: User,
                    as: 'members', 
                    where: { id: userId },
                    attributes: [], 
                    through: {
                        attributes: ['role', 'joinedAt']
                    }
                },
                {
                    // Include creator information
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'fullName', 'email'],
                    required: false
                }
            ],
            attributes: ['id', 'groupName', 'description', 'createdBy', 'createdAt']
        });

        console.log("Found groups:", userGroups.length);

        // Format the response
        const formattedGroups = userGroups.map(group => {
            const groupData = group.toJSON();
            
            // Extract role from the through table
            const membership = groupData.members && groupData.members.length > 0 
                ? groupData.members[0].GroupMember 
                : { role: 'member', joinedAt: null };

            return {
                id: groupData.id,
                groupName: groupData.groupName,
                description: groupData.description,
                createdBy: {
                    id: groupData.createdBy,
                    name: groupData.creator?.fullName || 'Unknown',
                    email: groupData.creator?.email || null
                },
                createdAt: groupData.createdAt,
                userRole: membership.role,
                joinedAt: membership.joinedAt,
                isCreator: groupData.createdBy === userId
            };
        });

        res.status(200).json({
            success: true,
            message: "Groups retrieved successfully",
            data: {
                groups: formattedGroups,
                totalGroups: formattedGroups.length
            }
        });

    } catch (error) {
        console.log(" Error in get user groups controller:", error.message);
        console.log("Full error:", error);

        res.status(500).json({
            success: false,
            error: "Internal Server error",
            message: "Something went wrong while fetching user groups",
            
        });
    }
}