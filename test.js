const test = require('brittle')
const promClient = require('prom-client')
const Hyperdht = require('hyperdht')
const createTestnet = require('hyperdht/testnet')
const HyperDhtStats = require('.')

const DEBUG = true

test(async (t) => {
  const testnet = await createTestnet()
  const bootstrap = testnet.bootstrap

  const dht = new Hyperdht({ bootstrap, firewalled: false })

  t.teardown(async () => {
    await dht.destroy()
    await testnet.destroy()
  })

  const stats = new HyperDhtStats(dht)
  stats.registerPrometheusMetrics(promClient)

  {
    const metrics = await promClient.register.metrics()
    const lines = metrics.split('\n')

    if (DEBUG) console.log(metrics)

    t.is(getMetricValue(lines, 'dht_total_queries'), 0, 'init dht_total_queries')
    t.is(getMetricValue(lines, 'dht_consistent_punches'), 0, 'dht_consistent_punches')
    t.is(getMetricValue(lines, 'dht_random_punches'), 0, 'dht_random_punches')
    t.is(getMetricValue(lines, 'dht_open_punches'), 0, 'dht_open_punches')
    t.is(getMetricValue(lines, 'dht_active_queries'), 0, 'dht_active_queries')
    t.is(getMetricValue(lines, 'dht_total_queries'), 0, 'dht_total_queries')
    t.is(getMetricValue(lines, 'udx_total_bytes_transmitted'), 0, 'udx_total_bytes_transmitted')
    t.is(getMetricValue(lines, 'udx_total_packets_transmitted'), 0, 'udx_total_packets_transmitted')
    t.is(getMetricValue(lines, 'udx_total_bytes_received'), 0, 'udx_total_bytes_received')
    t.is(getMetricValue(lines, 'udx_total_packets_received'), 0, 'udx_total_packets_received')
    t.is(getMetricValue(lines, 'udx_packets_dropped_total'), 0, 'udx_packets_dropped_total') // Note: only true for Linux, this stat is not defined on mac/windows
    t.is(getMetricValue(lines, 'dht_client_socket_bytes_transmitted'), 0, 'dht_client_socket_bytes_transmitted')
    t.is(getMetricValue(lines, 'dht_client_socket_packets_transmitted'), 0, 'dht_client_socket_packets_transmitted')
    t.is(getMetricValue(lines, 'dht_client_socket_bytes_received'), 0, 'dht_client_socket_bytes_received')
    t.is(getMetricValue(lines, 'dht_client_socket_packets_received'), 0, 'dht_client_socket_packets_received')
    t.is(getMetricValue(lines, 'dht_server_socket_bytes_transmitted'), 0, 'dht_server_socket_bytes_transmitted')
    t.is(getMetricValue(lines, 'dht_server_socket_packets_transmitted'), 0, 'dht_server_socket_packets_transmitted')
    t.is(getMetricValue(lines, 'dht_server_socket_bytes_received'), 0, 'dht_server_socket_bytes_received')
    t.is(getMetricValue(lines, 'dht_server_socket_packets_received'), 0, 'dht_server_socket_packets_received')
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
    t.is(getMetricValue(lines, 'dht_nr_records', { errOnNoMatch: false }), null, 'dht_nr_records not exported when not persistent')
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
})

function getMetricValue (lines, name, { errOnNoMatch = true } = {}) {
  const match = lines.find((l) => l.startsWith(`${name} `))
  if (!match) {
    if (errOnNoMatch) throw new Error(`No match for ${name}`)
    return null
  }

  const value = parseInt(match.split(' ')[1])
  if (DEBUG) console.log(name, '->', value)

  return value
}
