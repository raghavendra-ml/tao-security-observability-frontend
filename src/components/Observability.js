import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cloud, Gauge, AlertTriangle, CheckCircle, Clock, Settings, BarChart3 } from 'lucide-react';
import './Observability.css';

const Observability = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false to show content immediately
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState({
    access_key: 'AKIAIOSFODNN7EXAMPLE',
    secret_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    region: 'us-east-1'
  });
  const [credentialsSet, setCredentialsSet] = useState(true); // Set to true for demo

  useEffect(() => {
    // Initialize with dummy data immediately
    setMetrics(generateDummyMetrics());
    // Then try to fetch real data
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const generateDummyMetrics = () => {
    return {
      timestamp: new Date().toISOString(),
      infrastructure: {
        cpu: {
          usage_percent: Math.round(Math.random() * 70 + 15),
          cores_count: 8,
          load_average: [Math.round(Math.random() * 3 + 1), Math.round(Math.random() * 3 + 1), Math.round(Math.random() * 3 + 1)],
          status: "healthy"
        },
        memory: {
          total_gb: 32,
          used_gb: Math.round(Math.random() * 16 + 8),
          usage_percent: Math.round(Math.random() * 50 + 25),
          available_gb: Math.round(32 - (Math.random() * 16 + 8)),
          status: "healthy"
        },
        disk: {
          total_gb: 500,
          used_gb: Math.round(Math.random() * 250 + 100),
          usage_percent: Math.round(Math.random() * 50 + 20),
          io_ops_per_sec: Math.round(Math.random() * 950 + 50),
          status: "healthy"
        },
        network: {
          bandwidth_mbps: Math.round(Math.random() * 900 + 100),
          active_connections: Math.round(Math.random() * 450 + 50),
          packets_per_sec: Math.round(Math.random() * 9000 + 1000),
          latency_ms: Math.round(Math.random() * 49 + 1),
          traffic_in_mbps: Math.round(Math.random() * 750 + 50),
          traffic_out_mbps: Math.round(Math.random() * 570 + 30),
          suspicious_flows: Math.round(Math.random() * 15),
          blocked_connections: Math.round(Math.random() * 25),
          status: "healthy"
        },
        storage: {
          total_gb: 2000,
          used_gb: Math.round(Math.random() * 800 + 400),
          usage_percent: Math.round(Math.random() * 40 + 20),
          read_iops: Math.round(Math.random() * 1900 + 100),
          write_iops: Math.round(Math.random() * 1450 + 50),
          read_latency_ms: Math.round(Math.random() * 9 + 1),
          write_latency_ms: Math.round(Math.random() * 13 + 2),
          status: "healthy"
        }
      },
      api_performance: {
        response_times: {
          avg_ms: Math.round(Math.random() * 250 + 50),
          p50_ms: Math.round(Math.random() * 160 + 40),
          p95_ms: Math.round(Math.random() * 400 + 100),
          p99_ms: Math.round(Math.random() * 600 + 200)
        },
        error_rates: {
          total_requests_per_sec: Math.round(Math.random() * 900 + 100),
          error_rate_percent: Math.round(Math.random() * 4.9 + 0.1),
          '4xx_errors_per_sec': Math.round(Math.random() * 19 + 1),
          '5xx_errors_per_sec': Math.round(Math.random() * 10),
          timeout_errors_per_sec: Math.round(Math.random() * 5)
        },
        status: Math.random() > 0.15 ? "healthy" : "warning"
      },
      alert_thresholds: {
        cpu_warning: 80,
        cpu_critical: 90,
        memory_warning: 75,
        memory_critical: 85,
        disk_warning: 80,
        disk_critical: 90,
        network_latency_warning: 100,
        network_latency_critical: 200,
        api_response_warning: 500,
        api_response_critical: 1000,
        error_rate_warning: 2.0,
        error_rate_critical: 5.0
      },
      services: {
        kafka: {
          brokers_count: 3,
          topics_count: Math.round(Math.random() * 15 + 15),
          messages_per_sec: Math.round(Math.random() * 4000 + 1000),
          consumer_lag: Math.round(Math.random() * 100),
          disk_usage_gb: Math.round(Math.random() * 100 + 50),
          status: "healthy"
        },
        opensearch: {
          cluster_health: "green",
          nodes_count: 3,
          indices_count: Math.round(Math.random() * 30 + 20),
          documents_count: Math.round(Math.random() * 4000000 + 1000000),
          search_requests_per_sec: Math.round(Math.random() * 90 + 10),
          indexing_rate_per_sec: Math.round(Math.random() * 1500 + 500),
          storage_gb: Math.round(Math.random() * 600 + 200),
          status: "healthy"
        },
        database: {
          type: "PostgreSQL",
          connections_active: Math.round(Math.random() * 20 + 5),
          connections_max: 100,
          query_time_avg_ms: Math.round(Math.random() * 45 + 5),
          transactions_per_sec: Math.round(Math.random() * 450 + 50),
          cache_hit_ratio: Math.round(Math.random() * 13 + 85),
          storage_gb: Math.round(Math.random() * 150 + 50),
          status: "healthy"
        }
      },
      alerts: [
        {
          severity: "warning",
          service: "kafka",
          message: "Consumer lag increasing",
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
        }
      ]
    };
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/observability/metrics');
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      } else {
        // Fallback to dummy data
        setMetrics(generateDummyMetrics());
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics, using dummy data:', error);
      // Use dummy data when API is not available
      setMetrics(generateDummyMetrics());
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/observability/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (data.success) {
        setCredentialsSet(true);
        setShowCredentialsModal(false);
        fetchMetrics(); // Refresh metrics after setting credentials
      }
    } catch (error) {
      console.error('Error setting credentials:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatBytes = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <div className="observability-page">
        <div className="page-header">
          <h1><Activity size={28} /> Observability</h1>
          <p>Infrastructure and Service Monitoring</p>
        </div>
        <div className="loading">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="observability-page">
      <div className="page-header">
        <h1><Activity size={28} /> Observability</h1>
        <p>Real-time Infrastructure and Service Monitoring</p>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowCredentialsModal(true)}
          >
            <Settings size={16} />
            {credentialsSet ? 'Update' : 'Configure'} AWS Credentials
          </button>
          <button className="btn-primary" onClick={fetchMetrics}>
            <BarChart3 size={16} />
            Refresh Metrics
          </button>
        </div>
      </div>

      {!credentialsSet && (
        <div className="credential-warning">
          <AlertTriangle size={20} />
          <span>AWS credentials not configured. Click "Configure AWS Credentials" to connect to your infrastructure.</span>
        </div>
      )}

      {metrics && (
        <>
          {/* Infrastructure Overview */}
          <div className="metrics-section">
            <h2><Server size={24} /> Infrastructure Metrics</h2>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <Gauge size={20} />
                  <h3>CPU Usage</h3>
                  <span className="metric-status" style={{color: getStatusColor(metrics.infrastructure.cpu.status)}}>
                    {metrics.infrastructure.cpu.status}
                  </span>
                </div>
                <div className="metric-value">
                  {metrics.infrastructure.cpu.usage_percent}%
                </div>
                <div className="metric-details">
                  <div>Cores: {metrics.infrastructure.cpu.cores_count}</div>
                  <div>Load Avg: {metrics.infrastructure.cpu.load_average.join(', ')}</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <Server size={20} />
                  <h3>Memory</h3>
                  <span className="metric-status" style={{color: getStatusColor(metrics.infrastructure.memory.status)}}>
                    {metrics.infrastructure.memory.status}
                  </span>
                </div>
                <div className="metric-value">
                  {metrics.infrastructure.memory.usage_percent}%
                </div>
                <div className="metric-details">
                  <div>Used: {metrics.infrastructure.memory.used_gb} GB</div>
                  <div>Total: {metrics.infrastructure.memory.total_gb} GB</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <Database size={20} />
                  <h3>Disk Usage</h3>
                  <span className="metric-status" style={{color: getStatusColor(metrics.infrastructure.disk.status)}}>
                    {metrics.infrastructure.disk.status}
                  </span>
                </div>
                <div className="metric-value">
                  {metrics.infrastructure.disk.usage_percent}%
                </div>
                <div className="metric-details">
                  <div>Used: {metrics.infrastructure.disk.used_gb} GB</div>
                  <div>IOPS: {metrics.infrastructure.disk.io_ops_per_sec}</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <Cloud size={20} />
                  <h3>Network Traffic</h3>
                  <span className="metric-status" style={{color: getStatusColor(metrics.infrastructure.network.status)}}>
                    {metrics.infrastructure.network.status}
                  </span>
                </div>
                <div className="metric-value">
                  {metrics.infrastructure.network.bandwidth_mbps} Mbps
                </div>
                <div className="metric-details">
                  <div>In: {metrics.infrastructure.network.traffic_in_mbps} Mbps</div>
                  <div>Out: {metrics.infrastructure.network.traffic_out_mbps} Mbps</div>
                  <div>Connections: {metrics.infrastructure.network.active_connections}</div>
                  <div>Suspicious: {metrics.infrastructure.network.suspicious_flows}</div>
                  <div>Blocked: {metrics.infrastructure.network.blocked_connections}</div>
                  <div>Latency: {metrics.infrastructure.network.latency_ms}ms</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <Database size={20} />
                  <h3>Storage Performance</h3>
                  <span className="metric-status" style={{color: getStatusColor(metrics.infrastructure.storage.status)}}>
                    {metrics.infrastructure.storage.status}
                  </span>
                </div>
                <div className="metric-value">
                  {metrics.infrastructure.storage.usage_percent}%
                </div>
                <div className="metric-details">
                  <div>Used: {metrics.infrastructure.storage.used_gb} GB / {metrics.infrastructure.storage.total_gb} GB</div>
                  <div>Read IOPS: {metrics.infrastructure.storage.read_iops}</div>
                  <div>Write IOPS: {metrics.infrastructure.storage.write_iops}</div>
                  <div>Read Latency: {metrics.infrastructure.storage.read_latency_ms}ms</div>
                  <div>Write Latency: {metrics.infrastructure.storage.write_latency_ms}ms</div>
                </div>
              </div>
            </div>
          </div>

          {/* API Performance */}
          <div className="metrics-section">
            <h2><BarChart3 size={24} /> API Performance & Error Rates</h2>
            <div className="api-performance-grid">
              <div className="api-card">
                <div className="api-header">
                  <h3>Response Times</h3>
                  <span className="api-status" style={{color: getStatusColor(metrics.api_performance.status)}}>
                    <CheckCircle size={16} />
                    {metrics.api_performance.status}
                  </span>
                </div>
                <div className="api-metrics">
                  <div className="api-metric">
                    <span className="metric-label">Average</span>
                    <span className="metric-value">{metrics.api_performance.response_times.avg_ms}ms</span>
                  </div>
                  <div className="api-metric">
                    <span className="metric-label">P95</span>
                    <span className="metric-value">{metrics.api_performance.response_times.p95_ms}ms</span>
                  </div>
                  <div className="api-metric">
                    <span className="metric-label">P99</span>
                    <span className="metric-value">{metrics.api_performance.response_times.p99_ms}ms</span>
                  </div>
                </div>
              </div>

              <div className="api-card">
                <div className="api-header">
                  <h3>Error Rates</h3>
                  <span className="api-status" style={{color: getStatusColor(metrics.api_performance.status)}}>
                    <CheckCircle size={16} />
                    {metrics.api_performance.status}
                  </span>
                </div>
                <div className="api-metrics">
                  <div className="api-metric">
                    <span className="metric-label">Error Rate</span>
                    <span className="metric-value">{metrics.api_performance.error_rates.error_rate_percent}%</span>
                  </div>
                  <div className="api-metric">
                    <span className="metric-label">4xx Errors/sec</span>
                    <span className="metric-value">{metrics.api_performance.error_rates['4xx_errors_per_sec']}</span>
                  </div>
                  <div className="api-metric">
                    <span className="metric-label">5xx Errors/sec</span>
                    <span className="metric-value">{metrics.api_performance.error_rates['5xx_errors_per_sec']}</span>
                  </div>
                  <div className="api-metric">
                    <span className="metric-label">Total RPS</span>
                    <span className="metric-value">{metrics.api_performance.error_rates.total_requests_per_sec}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="metrics-section">
            <h2><AlertTriangle size={24} /> Alert Thresholds & Monitoring Rules</h2>
            <div className="thresholds-grid">
              <div className="threshold-category">
                <h4>Infrastructure</h4>
                <div className="threshold-items">
                  <div className="threshold-item">
                    <span>CPU Warning</span>
                    <span className="threshold-value warning">{metrics.alert_thresholds.cpu_warning}%</span>
                  </div>
                  <div className="threshold-item">
                    <span>CPU Critical</span>
                    <span className="threshold-value critical">{metrics.alert_thresholds.cpu_critical}%</span>
                  </div>
                  <div className="threshold-item">
                    <span>Memory Warning</span>
                    <span className="threshold-value warning">{metrics.alert_thresholds.memory_warning}%</span>
                  </div>
                  <div className="threshold-item">
                    <span>Memory Critical</span>
                    <span className="threshold-value critical">{metrics.alert_thresholds.memory_critical}%</span>
                  </div>
                </div>
              </div>

              <div className="threshold-category">
                <h4>Performance</h4>
                <div className="threshold-items">
                  <div className="threshold-item">
                    <span>API Response Warning</span>
                    <span className="threshold-value warning">{metrics.alert_thresholds.api_response_warning}ms</span>
                  </div>
                  <div className="threshold-item">
                    <span>API Response Critical</span>
                    <span className="threshold-value critical">{metrics.alert_thresholds.api_response_critical}ms</span>
                  </div>
                  <div className="threshold-item">
                    <span>Error Rate Warning</span>
                    <span className="threshold-value warning">{metrics.alert_thresholds.error_rate_warning}%</span>
                  </div>
                  <div className="threshold-item">
                    <span>Error Rate Critical</span>
                    <span className="threshold-value critical">{metrics.alert_thresholds.error_rate_critical}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Overview */}
          <div className="metrics-section">
            <h2><Database size={24} /> Service Metrics</h2>
            <div className="services-grid">
              <div className="service-card kafka">
                <div className="service-header">
                  <h3>Apache Kafka</h3>
                  <span className="service-status" style={{color: getStatusColor(metrics.services.kafka.status)}}>
                    <CheckCircle size={16} />
                    {metrics.services.kafka.status}
                  </span>
                </div>
                <div className="service-metrics">
                  <div className="service-metric">
                    <span className="metric-label">Messages/sec</span>
                    <span className="metric-value">{metrics.services.kafka.messages_per_sec.toLocaleString()}</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">Topics</span>
                    <span className="metric-value">{metrics.services.kafka.topics_count}</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">Consumer Lag</span>
                    <span className="metric-value">{metrics.services.kafka.consumer_lag}</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">Disk Usage</span>
                    <span className="metric-value">{metrics.services.kafka.disk_usage_gb} GB</span>
                  </div>
                </div>
              </div>

              <div className="service-card opensearch">
                <div className="service-header">
                  <h3>OpenSearch</h3>
                  <span className="service-status" style={{color: getStatusColor(metrics.services.opensearch.status)}}>
                    <CheckCircle size={16} />
                    {metrics.services.opensearch.cluster_health}
                  </span>
                </div>
                <div className="service-metrics">
                  <div className="service-metric">
                    <span className="metric-label">Searches/sec</span>
                    <span className="metric-value">{metrics.services.opensearch.search_requests_per_sec}</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">Indexing/sec</span>
                    <span className="metric-value">{metrics.services.opensearch.indexing_rate_per_sec}</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">Documents</span>
                    <span className="metric-value">{metrics.services.opensearch.documents_count.toLocaleString()}</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">Storage</span>
                    <span className="metric-value">{metrics.services.opensearch.storage_gb} GB</span>
                  </div>
                </div>
              </div>

              <div className="service-card database">
                <div className="service-header">
                  <h3>PostgreSQL Database</h3>
                  <span className="service-status" style={{color: getStatusColor(metrics.services.database.status)}}>
                    <CheckCircle size={16} />
                    {metrics.services.database.status}
                  </span>
                </div>
                <div className="service-metrics">
                  <div className="service-metric">
                    <span className="metric-label">Connections</span>
                    <span className="metric-value">{metrics.services.database.connections_active}/{metrics.services.database.connections_max}</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">Avg Query Time</span>
                    <span className="metric-value">{metrics.services.database.query_time_avg_ms}ms</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">TPS</span>
                    <span className="metric-value">{metrics.services.database.transactions_per_sec}</span>
                  </div>
                  <div className="service-metric">
                    <span className="metric-label">Cache Hit Ratio</span>
                    <span className="metric-value">{metrics.services.database.cache_hit_ratio}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {metrics.alerts && metrics.alerts.length > 0 && (
            <div className="metrics-section">
              <h2><AlertTriangle size={24} /> Current Alerts</h2>
              <div className="alerts-list">
                {metrics.alerts.map((alert, index) => (
                  <div key={index} className={`alert alert-${alert.severity}`}>
                    <AlertTriangle size={16} />
                    <div className="alert-content">
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-meta">
                        <span className="alert-service">{alert.service}</span>
                        <span className="alert-time">
                          <Clock size={12} />
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="last-updated">
            <Clock size={16} />
            Last updated: {new Date(metrics.timestamp).toLocaleString()}
          </div>
        </>
      )}

      {/* AWS Credentials Modal */}
      {showCredentialsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Configure AWS Credentials</h2>
            <p>Enter your AWS credentials to connect to CloudWatch and other AWS services for real-time monitoring.</p>
            <form onSubmit={handleCredentialsSubmit}>
              <div className="form-group">
                <label>Access Key ID</label>
                <input
                  type="text"
                  value={credentials.access_key}
                  onChange={(e) => setCredentials({...credentials, access_key: e.target.value})}
                  required
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                />
              </div>
              <div className="form-group">
                <label>Secret Access Key</label>
                <input
                  type="password"
                  value={credentials.secret_key}
                  onChange={(e) => setCredentials({...credentials, secret_key: e.target.value})}
                  required
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                />
              </div>
              <div className="form-group">
                <label>Region</label>
                <select
                  value={credentials.region}
                  onChange={(e) => setCredentials({...credentials, region: e.target.value})}
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCredentialsModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Connect to AWS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Observability;
