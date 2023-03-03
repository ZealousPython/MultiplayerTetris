let myBoardState = {
    board: null,
    piece: null,
    held: null,
    queue: null,
    queuePos: null
}
let theirBoardState = {
    board: null,
    piece: null,
    held: null,
    queue: null,
    queuePos: null
}
let ip = "192.168.237.96";
let peerID = null

let peer = new Peer(options = { host: ip, port: '9000', path: '/myapp', debug: 2 })
let conn = null
let getOtherPlayer = null
peer.on('connection', (connection) => {
    conn = connection
    SetUpPeer()
})
function SetUpPeer() {
    document.getElementById('connected').innerHTML = "Not Connected"
    seed = Math.floor(Math.random()*1000000)
    
    resetBoard()
    conn.on('open', function () {
        // Receive messages
        conn.on('data', function (data) {
            if (data.boardState != null) {
                theirBoardState = data.boardState
                theirBoardState.piece = new Piece(0, data.boardState.piece)
            }
            if (data.garbage != null) {
                addGarbage(data.garbage)
            }


        });
        document.getElementById('connected').innerHTML = "connected"
        clearInterval(getOtherPlayer)
    });
}

function connectToPools() {
    console.log(peerID)
    let data = { peerID: peerID }
    const config = {
        method: "post",
        data: data,
        url: "http://" + ip + ":3000/connectToPool",
    };

    axios(config)
        .then((res) => {
            if (res.data.otherID != -1) {
                try {
                    console.log("A")
                    conn = peer.connect(res.data.otherID)
                    SetUpPeer()
                }
                catch {
                    conn = null
                    document.getElementById('connected').innerHTML = "Not Connected"
                }

            }
            else {
                document.getElementById('connected').innerHTML = "Searching"
            }
            console.log(res.data);
        })
        .catch((error) => {
            console.log(error);
        });
}
peer.on('open', function (id) {
    peerID = id

});

function search() {
    clearInterval(getOtherPlayer)
    getOtherPlayer = setInterval(connectToPools, 1000)
}