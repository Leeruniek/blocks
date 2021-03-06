const debug = require("debug")("Blocks:PrometheusPlugin")

import Prometheus from "prom-client"

export default {
  depend: ["Config"],

  create: () => Config => {
    if (Config.get("METRICS_WITH_DEFAULT") === true) {
      Prometheus.collectDefaultMetrics()
    }
    const RequestSummary = new Prometheus.Summary({
      name: `${Config.get("NAME")}__request_duration_milliseconds`,
      help: "request duration in milliseconds",
      labelNames: ["method", "route", "status"],
    })

    const DurationHistogram = new Prometheus.Histogram({
      name: `${Config.get("NAME")}__request_buckets_milliseconds`,
      help: "request duration buckets in milliseconds",
      labelNames: ["method", "route", "status"],
      buckets: [20, 40, 60, 100, 160, 260, 420],
    })

    return {
      push: ({ method, route, status, duration }) => {
        RequestSummary.labels(method, route, status).observe(duration)
        DurationHistogram.labels(method, route, status).observe(duration)
      },

      getMetrics: () => Prometheus.register.metrics(),
    }
  },
}
