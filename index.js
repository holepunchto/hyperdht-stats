class HyperDhtStats {
  constructor (dht) {
    this.dht = dht
  }

  get isFirewalled () {
    return this.dht.firewalled
  }

  get punches () {
    return this.dht.stats.punches
  }

  get queries () {
    return this.dht.stats.queries
  }

  get pingCmds () {
    return this.dht.stats.commands.ping
  }

  get pingNatCmds () {
    return this.dht.stats.commands.pingNat
  }

  get downHintCmds () {
    return this.dht.stats.commands.downHint
  }

  get findNodeCmds () {
    return this.dht.stats.commands.findNode
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


  summary () {
    const {
      firewalled,
      punches,
      queries,
      pingCmds,
      pingNatCmds,
      downHintCmds,
      findNodeCmds,
      clientSocketBytesTransmitted,
      clientSocketPacketsTransmitted,
      clientSocketBytesReceived,
      serverSocketPacketsTransmitted,
      serverSocketBytesTransmitted,
      serverSocketPacketsReceived,
      serverSocketBytesReceived,
      udxBytesTransmitted,
      udxPacketsTransmitted,
      udxBytesReceived,
      udxPacketsReceived,
      udxPacketsDropped,
      nrNodes,
      nrUniqueNodeIPs,
      nrRecords
    } = this

    return {
      firewalled,
      punches,
      queries,
      pingCmds,
      pingNatCmds,
      downHintCmds,
      findNodeCmds,
      clientSocketBytesTransmitted,
      clientSocketPacketsTransmitted,
      clientSocketBytesReceived,
      serverSocketPacketsTransmitted,
      serverSocketBytesTransmitted,
      serverSocketPacketsReceived,
      serverSocketBytesReceived,
      udxBytesTransmitted,
      udxPacketsTransmitted,
      udxBytesReceived,
      udxPacketsReceived,
      udxPacketsDropped,
      nrNodes,
      remoteAddress: this.getRemoteAddress(),
      nrUniqueNodeIPs,
      nrRecords
    }
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

  get udxPacketsDropped () {
    if (this.dht.udx.packetsDroppedByKernel == null) return null
    if (this.dht.udx.packetsDroppedByKernel >= 2 ** 64) return 0 // not yet initialised (2**64 value normally)
    return this.dht.udx.packetsDroppedByKernel
  }

  get nrNodes () {
    return this.dht.nodes.length
  }

  getRemoteAddress () {
    if (!this.dht.host || !this.dht.port) return
    const address = `${this.dht.host}:${this.dht.port}`
    return address
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
      name: 'dht_ping_received',
      help: 'Total number of PING commands received',
      collect () {
        this.set(self.pingCmds.rx)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_ping_transmitted',
      help: 'Total number of PING commands transmitted',
      collect () {
        this.set(self.pingCmds.tx)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_ping_nat_received',
      help: 'Total number of PING_NAT commands received',
      collect () {
        this.set(self.pingNatCmds.rx)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_ping_nat_transmitted',
      help: 'Total number of PING_NAT commands transmitted',
      collect () {
        this.set(self.pingNatCmds.tx)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_find_node_received',
      help: 'Total number of FIND_NODE commands received',
      collect () {
        this.set(self.findNodeCmds.rx)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_find_node_transmitted',
      help: 'Total number of FIND_NODE commands transmitted',
      collect () {
        this.set(self.findNodeCmds.tx)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_down_hint_received',
      help: 'Total number of DOWN_HINT commands received',
      collect () {
        this.set(self.downHintCmds.rx)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_down_hint_transmitted',
      help: 'Total number of DOWN_HINT commands transmitted',
      collect () {
        this.set(self.downHintCmds.tx)
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
      name: 'udx_packets_dropped_total',
      help: 'Total packets dropped (by the UDX instance of the DHT). Only defined on Linux.',
      collect () {
        if (self.udxPacketsDropped !== null) this.set(self.udxPacketsDropped)
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

    new promClient.Gauge({ // eslint-disable-line no-new
      name: 'dht_is_firewalled',
      help: 'Whether the DHT server thinks it is behind a firewall (1) or not (0)',
      collect () {
        this.set(self.isFirewalled ? 1 : 0)
      }
    })

    new promClient.Gauge({ // eslint-disable-line no-new
      // Gauges expect a number, so we set the address as label instead
      name: 'dht_remote_address',
      help: 'The remote address of the DHT (set only if not firewalled)',
      labelNames: ['address'],
      collect () {
        const address = self.getRemoteAddress()
        if (address) this.labels(address).set(1)
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
