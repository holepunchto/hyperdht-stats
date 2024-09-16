const test = require('brittle')
const promClient = require('prom-client')
const Hyperdht = require('hyperdht')
const createTestnet = require('hyperdht/testnet')
const HyperDhtStats = require('.')

const DEBUG = true

test(async (t) => {
  const testnet = await createTestnet()
  const bootstrap = testnet.bootstrap

  const dht = new Hyperdht({ bootstrap })

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
    t.is(getMetricValue(lines, 'dht_client_socket_bytes_transmitted'), 0, 'dht_client_socket_bytes_transmitted')
    t.is(getMetricValue(lines, 'dht_client_socket_packets_transmitted'), 0, 'dht_client_socket_packets_transmitted')
    t.is(getMetricValue(lines, 'dht_client_socket_bytes_received'), 0, 'dht_client_socket_bytes_received')
    t.is(getMetricValue(lines, 'dht_client_socket_packets_received'), 0, 'dht_client_socket_packets_received')
    t.is(getMetricValue(lines, 'dht_server_socket_bytes_transmitted'), 0, 'dht_server_socket_bytes_transmitted')
    t.is(getMetricValue(lines, 'dht_server_socket_packets_transmitted'), 0, 'dht_server_socket_packets_transmitted')
    t.is(getMetricValue(lines, 'dht_server_socket_bytes_received'), 0, 'dht_server_socket_bytes_received')
    t.is(getMetricValue(lines, 'dht_server_socket_packets_received'), 0, 'dht_server_socket_packets_received')
  }
})

function getMetricValue (lines, name) {
  const match = lines.find((l) => l.startsWith(`${name} `))
  if (!match) throw new Error(`No match for ${name}`)

  const value = parseInt(match.split(' ')[1])
  if (DEBUG) console.log(name, '->', value)

  return value
}
