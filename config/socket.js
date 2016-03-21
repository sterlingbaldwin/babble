var socketFunc = (function(){
  console.log('Loading socket.io config');
}());


// export function for listening to the socket
module.exports = function (socket) {
  //When a new connection is made, tell the client their connected
  socket.emit('init', {
    message: 'The connection has been initialized'
  });


  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      message: 'A client has disconnected'
    });
  });
};
