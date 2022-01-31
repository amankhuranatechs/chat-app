const socket = io(); 


const messageForm =  document.querySelector('form');
// const messageFromClient =  document.getElementById('message-from-client');
const messageFromClient = document.querySelector('input');


//Elements
const $messageForm = document.querySelector('#chat-form')
const $messageFormButton = $messageForm.querySelector('button');
const $messageFormInput = $messageForm.querySelector('input');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;  // innerHTML because we need html inside    
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

/***
 * 
 socket.on('countUpdated', (count) =>{
     console.log(`Updated count from server is ${count}`)
 })

 document.querySelector('#increment').addEventListener('click', () => {
     console.log('clicked!!');
 
 socket.emit('increment');
 })
 * 
 */

socket.on('roomData', ({room, users}) => {
    console.log(room);
    console.log(users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html;
    // $sidebar.insertAdjacentHTML('beforeend', html);

})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;
    console.log($newMessage);

    //New message Style
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    console.log('newMessageHeight', newMessageHeight)

    //Visible height
    const visibleHeight = $messages.offsetHeight;
    console.log('visibleHeight', visibleHeight);

    // Height of messge container
    const containerHeight = $messages.scrollHeight;
    console.log('containerHeight', containerHeight);

    //How far i have scrolled?
    console.log($messages.scrollTop )
    const scrollOffset = $messages.scrollTop + visibleHeight;
    console.log(scrollOffset);

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    } 

}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,  
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    
    // console.log(messageFromClient.value)
    const value = event.currentTarget.elements.message.value;
    // const message = event.target
    socket.emit('message', value, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error) {
            return console.log(error)
        }
        console.log('Message delivered!!')
        // console.log('This message was delivered!!', message)
    })
})


// document.querySelector('#send-location').addEventListener('click', () => {
$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        alert('Naviagation is not supported By user browser!!')            
    } else {
        navigator.geolocation.getCurrentPosition((position) => {
            
            console.log(position);
            let location = {
                longitude: position.coords.longitude,
                latitude: position.coords.latitude,
            }

            socket.emit('sendLocation',location, (acknowlege) => {
                $sendLocationButton.removeAttribute('disabled')
                console.log(acknowlege);
            })
        })
    }
})

socket.emit('join', {username, room} , (error) =>{
    if(error) {
        alert(error);
        location.href = '/';
    }
})

