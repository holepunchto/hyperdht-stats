class HyperDhtStats {
  constructor (dht) {
    this.dht = dht
  }

  get punches () {
    return this.dht.stats.punches
  }

  get dhtQueries () {
    return this.dht.stats.queries
  }

  get dhtClientSocketBytesTransmitted () {
    return this.dht.io.clientSocket?.bytesTransmitted || 0
  }

  get dhtClientSocketPacketsTransmitted () {
    return this.dht.io.clientSocket?.packetsTransmitted || 0
  }

  get dhtClientSocketBytesReceived () {
    return this.dht.io.clientSocket?.bytesReceived || 0
  }

  get dhtClientSocketPacketsReceived () {
    return this.dht.io.clientSocket?.packetsReceived || 0
  }

  get dhtServerSocketBytesTransmitted () {
    return this.dht.io.serverSocket?.bytesTransmitted || 0
  }

  get dhtServerSocketPacketsTransmitted () {
    return this.dht.io.serverSocket?.packetsTransmitted || 0
  }

  get dhtServerSocketBytesReceived () {
    return this.dht.io.serverSocket?.bytesReceived || 0
  }

  get dhtServerSocketPacketsReceived () {
    return this.dht.io.serverSocket?.packetsReceived || 0
  }

  get udxBytesTransmitted () {
    return this.dht.udx.bytesTransmitted
  }

  get udxPacketsTransmitted () {
    return this.dht.udx.packetsTransmitted
  }

  get udxBytesReceived () {
    return this.dht.udx.bytesReceived
  }

  get udxPacketsReceived () {
    return this.dht.udx.packetsReceived
  }

  // TODO
  // get nrDhtEntries () {}

  registerPrometheusMetrics (promClient) {
    const self = this
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_consistent_punches',
      help: 'Total number of consistent holepunches performed by the hyperdht instance',
      collect () {
        this.set(self.punches.consistent)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_random_punches',
      help: 'Total number of random holepunches performed by the hyperdht instance',
      collect () {
        this.set(self.punches.random)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_open_punches',
      help: 'Total number of open holepunches performed by the hyperdht instance',
      collect () {
        this.set(self.punches.open)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_active_queries',
      help: 'Number of currently active queries in the dht-rpc instance',
      collect () {
        this.set(self.dhtQueries.active)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_total_queries',
      help: 'Total number of queries in the dht-rpc instance',
      collect () {
        this.set(self.dhtQueries.total)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'udx_total_bytes_transmitted',
      help: 'Total bytes transmitted by the hyperswarm and the DHT',
      collect () {
        this.set(self.udxBytesTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'udx_total_packets_transmitted',
      help: 'Total packets transmitted by the hyperswarm and the DHT',
      collect () {
        this.set(self.udxPacketsTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'udx_total_bytes_received',
      help: 'Total bytes received by the hyperswarm and the DHT',
      collect () {
        this.set(self.udxBytesReceived)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'udx_total_packets_received',
      help: 'Total packets received by the hyperswarm and the DHT',
      collect () {
        this.set(self.udxPacketsReceived)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_client_socket_bytes_transmitted',
      help: 'Total bytes transmitted by the client socket of the DHT',
      collect () {
        this.set(self.dhtClientSocketBytesTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_client_socket_packets_transmitted',
      help: 'Total packets transmitted by the client socket of the DHT',
      collect () {
        this.set(self.dhtClientSocketPacketsTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_client_socket_bytes_received',
      help: 'Total bytes received by the client socket of the DHT',
      collect () {
        this.set(self.dhtClientSocketBytesReceived)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_client_socket_packets_received',
      help: 'Total packets received by the client socket of the DHT',
      collect () {
        this.set(self.dhtClientSocketPacketsReceived)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_server_socket_bytes_transmitted',
      help: 'Total bytes transmitted by the server socket of the DHT',
      collect () {
        this.set(self.dhtServerSocketBytesTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_server_socket_packets_transmitted',
      help: 'Total packets transmitted by the server socket of the DHT',
      collect () {
        this.set(self.dhtServerSocketPacketsTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_server_socket_bytes_received',
      help: 'Total bytes received by the server socket of the DHT',
      collect () {
        this.set(self.dhtServerSocketBytesReceived)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_server_socket_packets_received',
      help: 'Total packets received by the server socket of the DHT',
      collect () {
        this.set(self.dhtServerSocketPacketsReceived)
      }
    })
  }
}

module.exports = HyperDhtStats
