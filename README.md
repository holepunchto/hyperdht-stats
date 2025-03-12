# HyperDHT Stats

[HyperDHT](https://github.com/holepunchto/hyperdht) stats, with Prometheus support.

## Install

```
npm i hyperdht-stats
```

## Example

To use with Prometheus:

```
const Hyperdht = require('Hyperdht')
const DhtStats = require('hyperdht-stats')
const promClient = require('prom-client')

const dht = new Hyperdht()
const stats = new DhtStats(swarm)

stats.registerPrometheusMetrics(promClient)

// In practice metrics are exposed to a metrics scraper
// over a server, but to illustrate we just print them
const metrics = await promClient.register.metrics()
console.log(metrics)
```

## Usage Without Prometheus

`dhtStats.toString()` returns a string overview of all stats.
