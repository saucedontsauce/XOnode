
# what it is
multiplayer tic tac toe game using websockets to communicate between players


## Technical Requirements

 - a web based game, meaning cross compatability
 - live games between players 
 - able to change username 
 - view list of players searching for a game 
 

 - styling will be one of the last things to be done as functionalit is going to be the main focus
### done
script to select which screen is visible
cycles throught gameView class objects and makes them invisible then makes sure the target is visible
showscreen function now accepts a callback function making general use easier due to using display none

 ### user connection
user is added to liveusers object on connection
user is made using user template class;
user can store a preferred username in their browser localstorage
all users are updated on user count

### user disconnection
user is removed from liveusers object on disconnection
 message is sent to everyone in game rooms when player is disconnecting
 any game the user is in is ended 
any live games containing user are disconnected
all users are updated on user count

### opponent disconnection
when opponent disconnects user is redirected to page to inform them that they have been removed from a room


###  searching / game creation
when a user wants to search for a game client makes a request to server
server adds liveuser to searchingusers
server then uses the clients id to cycle through searchingusers and find and id that doesnt match
it then adds both to a room and emits the game initial state
game is added to live games 
live games is counted then sent to all users
server then removes both users from searching users

### game loop
if userid matches whos turn allow play click otherwise give notification to tell them 
client modifies gamefield locally then changes last turn info and sends to server
server checks if there is a winner, if so emits winner package
server sends game to both clients
on game update both clients update the grid based on lastmove 

### game winner
server detects winning conditions 
winner package is sent to both clients
game is removed from livegames and all users are updated on the count
clients redirect to winnerpage and display winners info with button to home screen


 ### needs fixing/doing
fix css for options
fix css for playerleft
fix css for winnerpage






have server tell client what to call next

