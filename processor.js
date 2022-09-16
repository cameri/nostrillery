const { getPrivateKey, getPublicKey, signEvent } = require('./lib/nostr.js')

const secret = process.env.SECRET;
if (typeof secret !== 'string' || !secret.length) {
  throw new Error('SECRET is not set or is empty')
}

function createMessage(context, _events, done) {
  const { kind, content, privateKey, tags } = context.vars;
  createEvent(context.vars['$uuid'], { kind, content, privateKey, tags }).then((event) => {
    context.vars.message = ['EVENT', event]
    done()
  }, (err) => done(err))
}

async function createEvent(uuid, { kind, content, privateKey, tags }) {
  const privkey = privateKey ?? getPrivateKey(uuid, secret)
  const pubkey = getPublicKey(privkey)
  const created_at =  Math.floor(Date.now()/1000)

  const event = await signEvent(
    {
      pubkey,
      kind: Number.parseInt(kind),
      content: content ?? `Performance test ${Date.now()}`,
      created_at,
      tags: JSON.parse(tags),
    },
    privkey,
  )

  return event
}

module.exports = { createMessage };
