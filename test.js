const test = require('brittle')
const promClient = require('prom-client')
const RelayServer = require('blind-relay').Server
const Hyperdht = require('hyperdht')
const createTestnet = require('hyperdht/testnet')
const Nat = require('hyperdht/lib/nat')
const { FIREWALL } = require('hyperdht/lib/constants')
const HyperDhtStats = require('.')

const DEBUG = false

test('Prometheus metrics', async (t) => {
  const testnet = await createTestnet()
  const bootstrap = testnet.bootstrap

  const dht = new Hyperdht({ bootstrap, firewalled: false })
  const stats = new HyperDhtStats(dht)
  stats.registerPrometheusMetrics(promClient)

  t.teardown(async () => {
    promClient.register.clear()
    await dht.destroy()
    await testnet.destroy()
  })

  {
    const metrics = await promClient.register.metrics()
    const lines = metrics.split('\n')

    if (DEBUG) console.log(metrics)

    t.is(getMetricValue(lines, 'dht_consistent_punches'), 0, 'dht_consistent_punches')
    t.is(getMetricValue(lines, 'dht_random_punches'), 0, 'dht_random_punches')
    t.is(getMetricValue(lines, 'dht_open_punches'), 0, 'dht_open_punches')
    t.is(getMetricValue(lines, 'dht_holepunch_try_later_total'), 0, 'dht_holepunch_try_later_total')
    t.is(
      getMetricValue(lines, 'dht_holepunch_try_later_relayed_handshakes_total'),
      0,
      'dht_holepunch_try_later_relayed_handshakes_total'
    )
    t.is(getMetricValue(lines, 'dht_relay_attempts'), 0, 'dht_relay_attempts')
    t.is(getMetricValue(lines, 'dht_relay_successes'), 0, 'dht_relay_successes')
    t.is(getMetricValue(lines, 'dht_relay_aborts'), 0, 'dht_relay_aborts')
    t.is(getMetricValue(lines, 'dht_active_queries'), 0, 'dht_active_queries')
    t.is(getMetricValue(lines, 'dht_total_queries'), 0, 'dht_total_queries')
    t.is(getMetricValue(lines, 'dht_total_requests'), 0, 'init dht_total_requests')
    t.is(getMetricValue(lines, 'dht_active_requests'), 0, 'init dht_active_requests')
    t.is(getMetricValue(lines, 'dht_socket_pool_sockets_added'), 0, 'dht_socket_pool_sockets_added')
    t.is(
      getMetricValue(lines, 'dht_socket_pool_sockets_removed'),
      0,
      'dht_socket_pool_sockets_removed'
    )
    t.is(getMetricValue(lines, 'udx_total_bytes_transmitted'), 0, 'udx_total_bytes_transmitted')
    t.is(getMetricValue(lines, 'udx_total_packets_transmitted'), 0, 'udx_total_packets_transmitted')
    t.is(getMetricValue(lines, 'udx_total_bytes_received'), 0, 'udx_total_bytes_received')
    t.is(getMetricValue(lines, 'udx_total_packets_received'), 0, 'udx_total_packets_received')
    t.is(getMetricValue(lines, 'udx_packets_dropped_total'), 0, 'udx_packets_dropped_total') // Note: only true for Linux, this stat is not defined on mac/windows
    t.is(getMetricValue(lines, 'dht_streams'), 0, 'dht_streams')
    t.is(getMetricValue(lines, 'dht_pending_writes'), 0, 'dht_pending_writes')
    t.is(
      getMetricValue(lines, 'dht_client_socket_bytes_transmitted'),
      0,
      'dht_client_socket_bytes_transmitted'
    )
    t.is(
      getMetricValue(lines, 'dht_client_socket_packets_transmitted'),
      0,
      'dht_client_socket_packets_transmitted'
    )
    t.is(
      getMetricValue(lines, 'dht_client_socket_bytes_received'),
      0,
      'dht_client_socket_bytes_received'
    )
    t.is(
      getMetricValue(lines, 'dht_client_socket_packets_received'),
      0,
      'dht_client_socket_packets_received'
    )
    t.is(
      getMetricValue(lines, 'dht_server_socket_bytes_transmitted'),
      0,
      'dht_server_socket_bytes_transmitted'
    )
    t.is(
      getMetricValue(lines, 'dht_server_socket_packets_transmitted'),
      0,
      'dht_server_socket_packets_transmitted'
    )
    t.is(
      getMetricValue(lines, 'dht_server_socket_bytes_received'),
      0,
      'dht_server_socket_bytes_received'
    )
    t.is(
      getMetricValue(lines, 'dht_server_socket_packets_received'),
      0,
      'dht_server_socket_packets_received'
    )
    t.is(getMetricValue(lines, 'dht_nr_nodes'), 0, 'dht_nr_nodes received')
    t.is(getMetricValue(lines, 'dht_nr_unique_node_ips'), 0, 'dht_nr_unique_node_ips')
    t.is(getMetricValue(lines, 'dht_is_firewalled'), 0, 'dht_is_firewalled')
    t.is(getMetricValue(lines, 'dht_ping_received'), 0, 'dht_ping_received')
    t.is(getMetricValue(lines, 'dht_ping_transmitted'), 0, 'dht_ping_transmitted')
    t.is(getMetricValue(lines, 'dht_ping_nat_received'), 0, 'dht_ping_nat_received')
    t.is(getMetricValue(lines, 'dht_ping_nat_transmitted'), 0, 'dht_ping_nat_transmitted')
    t.is(getMetricValue(lines, 'dht_find_node_received'), 0, 'dht_find_node_received')
    t.is(getMetricValue(lines, 'dht_find_node_transmitted'), 0, 'dht_find_node_transmitted')
    t.is(getMetricValue(lines, 'dht_down_hint_received'), 0, 'dht_down_hint_received')
    t.is(getMetricValue(lines, 'dht_down_hint_transmitted'), 0, 'dht_down_hint_transmitted')

    // Flow where it is persistent is a bit harder to test,
    // so that path is untested for now
    t.is(
      getMetricValue(lines, 'dht_nr_records', { errOnNoMatch: false }),
      null,
      'dht_nr_records not exported when not persistent'
    )
  }

  await dht.fullyBootstrapped()

  {
    const { host, port } = dht.remoteAddress()
    const remoteAddress = `${host}:${port}`

    const metrics = await promClient.register.metrics()
    const lines = metrics.split('\n')
    const nameWithLabel = `dht_remote_address{address="${remoteAddress}"}`
    t.is(getMetricValue(lines, nameWithLabel), 1, 'Returns correct remote address when available')
  }

  {
    const nrConnections = 2
    const clients = []
    t.teardown(async () => {
      await Promise.all(clients.map((c) => c.destroy()))
    })

    const server = dht.createServer((socket) => socket.on('error', () => {}))
    await server.listen()

    // The socket pool is only used while holepunching, so the peers
    // connecting to us must be firewalled (the default)
    for (let i = 0; i < nrConnections; i++) {
      const client = new Hyperdht({ bootstrap })
      clients.push(client)

      const socket = client.connect(server.publicKey)
      socket.on('error', () => {})
      await new Promise((resolve) => socket.on('open', resolve))
      socket.destroy()
    }

    // Sockets leave the pool a bit after their stream closes
    while (stats.socketPool.socketsRemoved !== nrConnections) {
      await new Promise((resolve) => setTimeout(resolve, 20))
    }

    const metrics = await promClient.register.metrics()
    const lines = metrics.split('\n')

    t.is(
      getMetricValue(lines, 'dht_socket_pool_sockets_added'),
      nrConnections,
      'dht_socket_pool_sockets_added'
    )
    t.is(
      getMetricValue(lines, 'dht_socket_pool_sockets_removed'),
      nrConnections,
      'dht_socket_pool_sockets_removed'
    )
  }
})

test('dht_holepunch_try_later_total counts peers we throttled', async (t) => {
  const testnet = await createTestnet()
  const bootstrap = testnet.bootstrap

  // A server only answers TRY_LATER when a RANDOM firewall is involved, and
  // localhost nodes never analyse as RANDOM, so force it for the client alone
  // (forcing both sides instead makes the client abort on double-random NATs)
  const updateFirewall = Nat.prototype._updateFirewall
  let randomNode = null
  Nat.prototype._updateFirewall = function () {
    updateFirewall.call(this)
    if (this.dht === randomNode && this.sampled >= 3) this.firewall = FIREWALL.RANDOM
  }

  const dht = new Hyperdht({ bootstrap })
  const client = new Hyperdht({ bootstrap })
  randomNode = client

  const stats = new HyperDhtStats(dht)
  stats.registerPrometheusMetrics(promClient)

  t.teardown(async () => {
    Nat.prototype._updateFirewall = updateFirewall
    promClient.register.clear()
    await client.destroy()
    await dht.destroy()
    await testnet.destroy()
  })

  const server = dht.createServer((socket) => socket.on('error', () => {}))
  await server.listen()

  // The other half of the condition: make the random-punch throttle bite
  dht._lastRandomPunch = Date.now()

  const socket = client.connect(server.publicKey)
  socket.on('error', () => {})
  t.teardown(() => socket.destroy())

  // The client backs off for 10s+ once told to wait, so watch the stat itself
  const deadline = Date.now() + 20000
  while (stats.punches.tryLater === 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  const lines = (await promClient.register.metrics()).split('\n')
  t.ok(getMetricValue(lines, 'dht_holepunch_try_later_total') > 0, 'dht_holepunch_try_later_total')
  t.is(
    getMetricValue(lines, 'dht_holepunch_try_later_relayed_handshakes_total'),
    0,
    'relayed handshakes not counted, this handshake had no relay to fall back on'
  )
})

test('dht_holepunch_try_later_relayed_handshakes_total counts relayed handshakes', async (t) => {
  const testnet = await createTestnet()
  const bootstrap = testnet.bootstrap

  const updateFirewall = Nat.prototype._updateFirewall
  let randomNode = null
  Nat.prototype._updateFirewall = function () {
    updateFirewall.call(this)
    if (this.dht === randomNode && this.sampled >= 3) this.firewall = FIREWALL.RANDOM
  }

  const dht = new Hyperdht({ bootstrap })
  const client = new Hyperdht({ bootstrap })
  const relayNode = new Hyperdht({ bootstrap })
  randomNode = client

  const stats = new HyperDhtStats(dht)
  stats.registerPrometheusMetrics(promClient)

  const relay = new RelayServer({
    createStream(opts) {
      return relayNode.createRawStream({ ...opts, framed: true })
    }
  })

  t.teardown(async () => {
    Nat.prototype._updateFirewall = updateFirewall
    promClient.register.clear()
    relay.close()
    await client.destroy()
    await dht.destroy()
    await relayNode.destroy()
    await testnet.destroy()
  })

  const relayServer = relayNode.createServer((socket) => {
    relay.accept(socket, { id: socket.remotePublicKey }).on('error', () => {})
  })
  await relayServer.listen()

  // A handshake is only counted as relayed when the server has somewhere to
  // fall back to, which is what gives the handshake its relay token
  const server = dht.createServer({ relayThrough: relayServer.publicKey }, (socket) =>
    socket.on('error', () => {})
  )
  await server.listen()

  // The other half of the condition: make the random-punch throttle bite
  dht._lastRandomPunch = Date.now()

  const socket = client.connect(server.publicKey)
  socket.on('error', () => {})
  t.teardown(() => socket.destroy())

  // The client backs off for 10s+ once told to wait, so watch the stat itself
  const deadline = Date.now() + 20000
  while (stats.punches.tryLater === 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  const lines = (await promClient.register.metrics()).split('\n')
  t.ok(getMetricValue(lines, 'dht_holepunch_try_later_total') > 0, 'dht_holepunch_try_later_total')
  t.is(
    getMetricValue(lines, 'dht_holepunch_try_later_relayed_handshakes_total'),
    1,
    'dht_holepunch_try_later_relayed_handshakes_total'
  )
})

test('toString', async (t) => {
  const testnet = await createTestnet()
  const bootstrap = testnet.bootstrap

  const dht = new Hyperdht({ bootstrap, firewalled: false })

  t.teardown(async () => {
    await dht.destroy()
    await testnet.destroy()
  })

  const stats = new HyperDhtStats(dht)
  const str = stats.toString()
  t.ok(str.includes('UDX Stats', 'toString includes udx stats'))
  t.ok(str.includes('DHT Stats', 'toString includes DHT stats'))
})

test('toJson', async (t) => {
  const testnet = await createTestnet()
  const bootstrap = testnet.bootstrap

  const dht = new Hyperdht({ bootstrap, firewalled: false })
  const stats = new HyperDhtStats(dht)
  stats.registerPrometheusMetrics(promClient)

  t.teardown(async () => {
    promClient.register.clear()
    await dht.destroy()
    await testnet.destroy()
  })

  const nrStrStats = stats.toString().split('\n').length - 2 // 2 headers, all other lines are stats
  const nrPromStats = (await promClient.register.metrics()).split('\n\n').length

  const jsonStats = stats.toJson()
  let nrJsonStats = 0
  for (const value of Object.values(jsonStats)) {
    // Some stats are nested for JSON, so we want to count all the nested stats
    nrJsonStats += value !== null && typeof value === 'object' ? [...Object.keys(value)].length : 1
  }

  t.is(nrStrStats, 46, 'expected nr of stats')
  t.is(nrJsonStats, nrStrStats)
  t.is(nrPromStats + 1, nrStrStats, 'equal prometheus and JSON stats') // dht_nr_records not set since not yet persisted
})

function getMetricValue(lines, name, { errOnNoMatch = true } = {}) {
  const match = lines.find((l) => l.startsWith(`${name} `))
  if (!match) {
    if (errOnNoMatch) throw new Error(`No match for ${name}`)
    return null
  }

  const value = parseInt(match.split(' ')[1])
  if (DEBUG) console.log(name, '->', value)

  return value
}
