const { chatRooms, messages } = require("../chatSchema")
const { userExistsResetPwd } = require("../userFunc/userFunc")


exports.createChatRoom = (user1, user2) => {
    return new Promise(async (resolve, reject) => {
        try {
            let chatRoomId = (Math.random() + 1).toString(15).substring(2)

            let chatRoom = new chatRooms({
                randomStringID: chatRoomId,
                createdAt: new Date(),
                participants: [user1, user2]
            })

            await chatRoom.save()
            resolve(chatRoom)

        } catch (error) {
            console.log(error)
            reject({ err: true, msg: 'Unable to create room' })
        }
    })
}


exports.getOrCreateChatRoom = (user1, user2) => {
    return new Promise(async (resolve, reject) => {
        try {
            user1ObjId = await userExistsResetPwd(user1)
            user1ObjId = user1ObjId.user[0]._id

            user2ObjId = await userExistsResetPwd(user2)
            user2ObjId = user2ObjId.user[0]._id
            let chatRoom = await chatRooms.findOne({
                participants: {
                    $all: [user1ObjId, user2ObjId]
                }
            })

            if (!chatRoom) chatRoom = await this.createChatRoom(user1ObjId, user2ObjId)
            resolve(chatRoom)
        } catch (error) {
            console.log(error)
            reject({ err: true, msg: 'Unable to get ChatRoom' })
        }
    })
}

exports.storeMessage = async (msg, to, from, chatRoomId, visited) => {
    try {
        let chatRoomObjId = await chatRooms.findOne({ randomStringID: chatRoomId })
        
        if (chatRoomObjId !== null) {
            const message = new messages({
                chatRoomId: chatRoomObjId._id,
                msgFrom: from,
                msgTo: to,
                msgBody: msg,
                visited,
                timestamp: new Date()
            })
            message.save()
        } else throw Error('Invalid Chatroom')
    } catch (err) {
        console.log(err)
    }
}

exports.fetchUserChatroomsFromDB = (usn) => {
    return new Promise((resolve, reject) => {
        chatRooms.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participantInfo'
                }
            },
            {
                $match: {
                    'participantInfo.usn': usn
                }
            }, {
                $project: {
                    'participantInfo.usn':1,
                    'participantInfo.name':1,
                    randomStringID: 1
                }
            }

        ])
            .then(result => {
                console.log(`All chat rooms` + result[0])
                resolve(result);
            })
            .catch(err => {
                console.log(err)
                reject({ err: true, msg: 'Unable to fetch chatrooms' })
            })
    })

}

exports.fetchAllMessagesFromChatRoom=(chatRoomId)=>{
    return new Promise((resolve, reject) => {
        chatRooms.findOne({ randomStringID: chatRoomId })
        .then(result=>{
            console.log(result._id)
            return messages.find({chatRoomId:result._id},{_id:0,_v:0}).sort({timestamp:1})
        })
        .then(allMessages=>{
            resolve(allMessages)
        })
        .catch(err=>{
            console.log(err)
            reject({err:true,msg:'Can not fetch messages'})
        })
    })
}