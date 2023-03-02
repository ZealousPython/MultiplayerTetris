let myBoardState = {
    board: null,
    piece: null,
    held: null,
    queue: null,
    queuePos:null
}
let theirBoardState = {
    board: null,
    piece: null,
    held: null,
    queue: null,
    queuePos:null
}
let ip = "10.127.20.50";
let peerID = null

let peer = new Peer(options = { host: ip, port: '9000', path: '/myapp', debug: 2 })
let conn = null
let getOtherPlayer = null
peer.on('connection',(connection)=>{
    conn = connection
    SetUpPeer()
})
function SetUpPeer(){
    conn.on('open', function() {
        // Receive messages
        conn.on('data', function(data) {
          if (data.boardState != null){
            theirBoardState = data.boardState
            console.log(theirBoardState.piece)
          }
          if (data.garbage != null){
            addGarbage(data.garbage)
          }
        });
        
        // Send messages
        conn.send('Hello!');
      });
}

function connectToPools(){
    let data = {peerID:peerID}
    const config = {
        method: "post",
        data: data,
        url: "http://" + ip + ":3000/connectToPool",
    };
    
    axios(config)
        .then((res) => {
            if (res.data.otherID != -1){
                try{
                    conn = peer.connect(res.data.otherID)
                    SetUpPeer()
                }
                catch{
                    conn = null
                }
                 
            }
            else{
                clearInterval(getOtherPlayer)
            }
            console.log(res.data);
        })
        .catch((error) => {
            console.log(error);
        });
}
peer.on('open', function (id) {
    peerID = id
    getOtherPlayer = setInterval(connectToPools,5000)
    
});