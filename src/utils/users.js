const users = [];


// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();


    //validate the data
    if(!username || !room ) {
        return {
            error: 'Username and name are requried.'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room  && user.username === username
    })

    //validate username

    if(existingUser) {
        return {
            error: 'User is in use!!'
        }
    }

    // Store user
    const user = { id, username, room};
    users.push(user);
    return { user };
}


const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user =  users.find((user) => {
        return user.id === id
    })

    if(user) {
        return user
    } else{
        return undefined
    }
}


const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room
    })
    return usersInRoom;
}

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}
// addUser({
//     id: 22, 
//     username: 'Aman khurana',
//     room: "chandigarh"
// })
// addUser({
//     id: 23, 
//     username: 'Aman 2',
//     room: "panchkula"
// })
// addUser({
//     id: 24, 
//     username: 'Aman 3',
//     room: "chandigarh"
// })
// addUser({
//     id: 25, 
//     username: 'Aman 4',
//     room: "panchkula"
// })


// console.log(users);


// console.log(getUsersInRoom('mohali'))