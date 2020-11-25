var net = require('net');

var server = net.createServer(function(socket) {});

function jsonToStr(json) {
	return JSON.stringify(json)
}

function strToJson(str) {
	return JSON.parse(str)
}

users = []

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
			}
			case "exit": {
				for (user of users) {
					if (user.id == id) {
						users.splice(users.indexOf(user), 1)
					}
				}
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

server.listen(8080);
