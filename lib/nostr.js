const secp256k1 = require('@noble/secp256k1')
const { createHmac } = require('crypto')

function getPrivateKey(uuid, secret) {
  const hmac = createHmac('sha256', secret)

  hmac.update(uuid)

  return hmac.digest().toString('hex')
}

function getPublicKey(privateKey) {
  return Buffer.from(secp256k1.getPublicKey(privateKey, true)).toString('hex').substring(2)
}

async function signEvent(event, privateKey) {
  const id = await secp256k1.utils.sha256(
    Buffer.from(serializeEvent(event))
  );
  const sig = await secp256k1.schnorr.sign(id, privateKey)
  
  return {
    id: Buffer.from(id).toString('hex'),
    ...event,
    sig: Buffer.from(sig).toString('hex'),
  }
}

function serializeEvent(event){
  return  JSON.stringify([
    0,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags,
    event.content,
  ])
}

module.exports = {
  getPrivateKey,
  getPublicKey,
  signEvent,
}
