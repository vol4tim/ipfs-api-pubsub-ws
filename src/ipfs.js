import IPFS from 'ipfs-api'
import { IPFS_HOST } from './config'

const ipfs = () => {
  const inst = IPFS(IPFS_HOST)
  inst['once'] = (n, cb) => { cb() }
  return inst
}

export default ipfs
