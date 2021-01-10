var net = require('net');

var server = net.createServer(function(socket) {});

function jsonToStr(json) {
	return JSON.stringify(json)
}

function strToJson(str) {
	return JSON.parse(str)
}

users = []

// Steekspel variables.
player1 = ""
player2 = ""
scorePlayer1 = -1
scorePlayer2 = -1

server.on('connection', function(socket) {
    console.log('A new connection has been established.');
	
    socket.on('data', function(chunk) {
		json = strToJson(chunk.toString())
		type = json.type
		id = json.id
		room = json.room
		
		switch(type) {
			case "handshake": {
				users.push({
					"id": id,
					"room": room,
					"socket": socket
				})
				
				socket.write(jsonToStr({"type": "handshake", "success": true}));
				break
			}
			case "exit": {
				for (user of users) {
					if (user.id == id) {
						users.splice(users.indexOf(user), 1)
					}
				}

				break
			}
			case "steekspel": {
				score = json.score

				if (scorePlayer1 == -1) {
					scorePlayer1 = score

					player1 = id
				}
				else if (scorePlayer2 == -1) {
					scorePlayer2 = score
					player2 = id

					// Calculate who won.
					winner = ""

					if (scorePlayer1 > scorePlayer2) {
						winner = player1
					} else if (scorePlayer2 > scorePlayer1) {
						winner = player2
					} else {
						winner = "NONE"
					}

					for (user of users) {
						console.log("sent")
						user.socket.write(jsonToStr({"type": "steekspel", "winner": winner}))
						user.socket.pipe(user.socket)
					}

					// Reset the minigame.
					player1 = ""
					player2 = ""
					scorePlayer1 = -1
					scorePlayer2 = -1
				}

				break
			}
		}
		
        console.log("Data received from client: " +  chunk.toString());
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('Closing connection with the client');
    });
		
	socket.on('error', function(err) {
		console.log("Error: " + err);
    });
});

let port = 8080;
server.listen(port);
console.log(`listening on port ${port}`);
