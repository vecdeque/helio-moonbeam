const path = require('path')
const menubar = require('menubar')
const { Socket, Presence } = require('phoenix')
const WebSocket = require('websocket').w3cwebsocket

let mb = menubar({
  index: 'file://' + path.join(__dirname, 'ui/index.html'),
  preloadWindow: true
})

let presences = {}

mb.on('ready', function ready () {
  let socket = new Socket('ws://127.0.0.1:4000/socket', {
    logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) },
    transport: WebSocket,
    params: {user: 'sam'}
  })

  socket.connect()

  let channel = socket.channel('room:lobby', {})
  channel.join()
    .receive('ok', (resp) => {
      console.log('Joined successfully', resp)
    })
    .receive('error', (resp) => {
      console.log('Unable to join', resp)
    })

  channel.on('presence_state', (state) => {
    presences = Presence.syncState(presences, state)
  })

  channel.on('presence_diff', (diff) => {
    presences = Presence.syncDiff(presences, diff)
  })
})
