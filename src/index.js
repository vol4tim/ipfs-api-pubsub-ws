import express from 'express'
import cors from 'cors'
import Socket from 'socket.io'
import _indexOf from 'lodash/indexOf'
import { PORT, HOST } from './config'
import IPFS from './ipfs'
import createServer from './server'

const app = express()
const server = createServer(app)
const io = Socket(server)
app.use(cors())
const ipfs = IPFS()

const topics = []

const subscribe = (topic) => {
  return new Promise((resolve) => {
    ipfs.pubsub.ls((e, list) => {
      const isSys = _indexOf(list, topic) >= 0
      const isApp = _indexOf(topics, topic) >= 0
      if (!isApp) {
        console.log('add app', topic);
        topics.push(topic)
      }
      if (!isApp || !isSys) {
        console.log('add sys', topic);
        ipfs.pubsub.subscribe(topic, (msg) => {
          const data = Buffer.from(msg.data).toString('utf8');
          io.emit(topic, data)
        })
      }
      resolve(true)
    })
  })
}

const runApp = () => {
  io.on('connection', (socket) => {
    socket.on('chanel', (topic) => {
      subscribe(topic)
        .then(() => {
          socket.on(topic, (msg) => {
            msg = Buffer.from(JSON.parse(msg).data);
            subscribe(topic)
              .then(() => {
                ipfs.pubsub.publish(topic, msg, (err) => {
                  if (err) {
                    console.log(err)
                  }
                })
              })
          });
        })
    });
  });
}

ipfs.once('ready', () => {
  server.listen(PORT, HOST, () => {
    console.log('App listening on port ' + PORT);
    runApp()
  });
})
