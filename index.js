class HyperDhtStats {
  constructor (dht) {
    this.dht = dht
  }

  get punches () {
    return this.dht.stats.punches
  }

  get queries () {
    return this.dht.stats.queries
  }

  get clientSocketBytesTransmitted () {
    return this.dht.io.clientSocket?.bytesTransmitted || 0
  }

  get clientSocketPacketsTransmitted () {
    return this.dht.io.clientSocket?.packetsTransmitted || 0
  }

  get clientSocketBytesReceived () {
    return this.dht.io.clientSocket?.bytesReceived || 0
  }

  get clientSocketPacketsReceived () {
    return this.dht.io.clientSocket?.packetsReceived || 0
  }

  get serverSocketBytesTransmitted () {
    return this.dht.io.serverSocket?.bytesTransmitted || 0
  }

  get serverSocketPacketsTransmitted () {
    return this.dht.io.serverSocket?.packetsTransmitted || 0
  }

  get serverSocketBytesReceived () {
    return this.dht.io.serverSocket?.bytesReceived || 0
  }

  get serverSocketPacketsReceived () {
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

  get nrNodes () {
    return this.dht.nodes.length
  }

  // Linear I.F.O. nodes length (could be constant by
  // listening to dht-rpc's node-added and node-removed events
  // and managing the state here)
  get nrUniqueNodeIPs () {
    const ips = new Set()
    for (const node of this.dht.nodes.toArray()) {
      ips.add(node.host)
    }
    return ips.size
  }

  get nrRecords () {
    // TODO: use a public API
    return this.dht._persistent?.records.size || null
  }
  // TODO: nrMutables, nrImmutables

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
        this.set(self.queries.active)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_total_queries',
      help: 'Total number of queries in the dht-rpc instance',
      collect () {
        this.set(self.queries.total)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'udx_total_bytes_transmitted',
      help: 'Total bytes transmitted overall (by the UDX instance of the DHT)',
      collect () {
        this.set(self.udxBytesTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'udx_total_packets_transmitted',
      help: 'Total packets transmitted overall (by the UDX instance of the DHT)',
      collect () {
        this.set(self.udxPacketsTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'udx_total_bytes_received',
      help: 'Total bytes received overall (by the UDX instance of the DHT)',
      collect () {
        this.set(self.udxBytesReceived)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'udx_total_packets_received',
      help: 'Total packets received overall (by the UDX instance of the DHT)',
      collect () {
        this.set(self.udxPacketsReceived)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_client_socket_bytes_transmitted',
      help: 'Total bytes transmitted by the client socket of the DHT',
      collect () {
        this.set(self.clientSocketBytesTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_client_socket_packets_transmitted',
      help: 'Total packets transmitted by the client socket of the DHT',
      collect () {
        this.set(self.clientSocketPacketsTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_client_socket_bytes_received',
      help: 'Total bytes received by the client socket of the DHT',
      collect () {
        this.set(self.clientSocketBytesReceived)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_client_socket_packets_received',
      help: 'Total packets received by the client socket of the DHT',
      collect () {
        this.set(self.clientSocketPacketsReceived)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_server_socket_bytes_transmitted',
      help: 'Total bytes transmitted by the server socket of the DHT',
      collect () {
        this.set(self.serverSocketBytesTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_server_socket_packets_transmitted',
      help: 'Total packets transmitted by the server socket of the DHT',
      collect () {
        this.set(self.serverSocketPacketsTransmitted)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_server_socket_bytes_received',
      help: 'Total bytes received by the server socket of the DHT',
      collect () {
        this.set(self.serverSocketBytesReceived)
      }
    })
    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_server_socket_packets_received',
      help: 'Total packets received by the server socket of the DHT',
      collect () {
        this.set(self.serverSocketPacketsReceived)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_nr_nodes',
      help: 'Total nodes in the Kademlia DHT table of this node',
      collect () {
        this.set(self.nrNodes)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_nr_unique_node_ips',
      help: 'Total unique ip addresses in the Kademlia DHT table of this node',
      collect () {
        this.set(self.nrUniqueNodeIPs)
      }
    })

    // Only if the DHT is persistent (returns 0 values if it was
    // persistent for a while but now no longer)
    self.dht.once('persistent', () => {
      new promClient.Gauge({ // eslint-disable-line no-new
        name: 'dht_nr_records',
        help: 'Total nr of records stored by this (persistent) node',
        collect () {
          this.set(self.nrRecords || 0)
        }
      })
    })
  }
}

module.exports = HyperDhtStats
