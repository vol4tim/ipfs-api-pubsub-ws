import express from 'express'
import cors from 'cors'
import http from 'http'
import Socket from 'socket.io'
import find from 'lodash/find'
import { PORT, HOST } from './config'
import IPFS from './ipfs'

const app = express()
const server = http.Server(app);
const io = Socket(server)
app.use(cors())
const ipfs = IPFS()

const chanels = []

const subscribeOld = (chanel) => {
  ipfs.pubsub.ls((e, chanels) => {
    if (!find(chanels, (item) => item === chanel)) {
      ipfs.pubsub.subscribe(chanel, (msg) => {
        const data = Buffer.from(msg.data).toString('utf8');
        io.emit(chanel, data)
      })
    }
  })
}

const subscribe = (chanel) => {
  if (!find(chanels, (item) => item === chanel)) {
    chanels.push(chanel)
    ipfs.pubsub.subscribe(chanel, (msg) => {
      const data = Buffer.from(msg.data).toString('utf8');
      io.emit(chanel, data)
    })
  }
}

const runApp = () => {
  io.on('connection', (socket) => {
    socket.on('chanel', (chanel) => {
      subscribe(chanel)
      socket.on(chanel, (msg) => {
        msg = Buffer.from(JSON.parse(msg).data);
        ipfs.pubsub.publish(chanel, msg, (err) => {
          if (err) {
            console.log(err)
          }
        })
      });
    });
  });
}

ipfs.once('ready', () => {
  server.listen(PORT, HOST, () => {
    console.log('App listening on port ' + PORT);
    runApp()
  });
})
