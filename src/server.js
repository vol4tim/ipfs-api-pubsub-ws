import fs from 'fs'
import https from 'https'
import http from 'http'
import { PATH_SSL } from './config'

export default (app) => {
  const SSL_ENABLE = process.env.SSL_ENABLE || false;
  if (SSL_ENABLE) {
    const options = {
      key: fs.readFileSync(PATH_SSL + 'devjs-01.corp.aira.life.key'),
      cert: fs.readFileSync(PATH_SSL + 'fullchain.cer')
    };
    return https.createServer(options, app);
  }
  return http.createServer(app);
}
