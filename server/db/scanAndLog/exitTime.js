const { users } = require('../userSchema')

exports.exitLog = async (usn, userDateTime) => {
    let dayStart = new Date(userDateTime.getFullYear(), userDateTime.getMonth(), userDateTime.getDate())

    return new Promise((resolve, reject) => {
        users.findOneAndUpdate({ usn }, {
            lastOut: userDateTime,
            currentLogStatus: false,
            $set: {
                "logsData.0.outTime": userDateTime
                }
        },{
            returnDocument:'after'
            }
        )
            .then(msg => {
                console.log('there is exitTIme:', msg)
                const { name, lastLogin, lastOut, currentLogStatus } = msg
                resolve({ name, lastLogin, lastOut, currentLogStatus })
            })
            .catch(err => {
                console.log(`- - - - -Error- - - - -\n`, err)
                reject({ code: 500, msg: 'Unable to log exit time' })
            })
    })
}