import React, { useState, useEffect } from 'react';
import { Users, Monitor, User, MapPin, Clock, Shield, AlertTriangle, TrendingUp, Activity, Search, Filter } from 'lucide-react';
import './UserBehaviour.css';

const UserBehaviour = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false to show content immediately
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIP, setSelectedIP] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [ipDetails, setIPDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initialize with dummy data immediately
    setOverview(generateDummyOverview());
    // Then try to fetch real data
    fetchOverview();
  }, []);

  const generateDummyOverview = () => {
    const users = ["john.doe", "jane.smith", "mike.johnson", "sarah.wilson", "chris.brown", "lisa.davis", "alex.taylor", "emma.davis"];
    const ips = ["10.0.1.100", "10.0.1.101", "10.0.1.102", "192.168.1.50", "192.168.1.51", "172.16.0.10", "10.0.2.25", "192.168.2.100"];
    const locations = ["New York, US", "London, UK", "Sydney, AU", "Tokyo, JP", "Internal Network", "VPN Pool", "Seattle, US", "Toronto, CA"];
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        total_active_users: users.length,
        total_unique_ips: ips.length,
        total_sessions_today: Math.round(Math.random() * 150 + 150),
        average_session_duration_minutes: Math.round(Math.random() * 45 + 15),
        suspicious_activities: Math.round(Math.random() * 5)
      },
      top_users: users.map(user => ({
        username: user,
        sessions_today: Math.round(Math.random() * 20 + 5),
        last_activity: new Date(Date.now() - Math.random() * 480 * 60000).toISOString(),
        risk_score: Math.round(Math.random() * 100),
        locations: Math.round(Math.random() * 3 + 1)
      })),
      top_ips: ips.map((ip, index) => ({
        ip_address: ip,
        sessions_today: Math.round(Math.random() * 17 + 3),
        unique_users: Math.round(Math.random() * 3 + 1),
        last_activity: new Date(Date.now() - Math.random() * 600 * 60000).toISOString(),
        geolocation: locations[index] || "Unknown",
        risk_score: Math.round(Math.random() * 100)
      }))
    };
  };

  const generateDummyUserDetails = (username) => {
    const activities = [
      "Logged into system", "Accessed document", "Downloaded file", 
      "Changed password", "Failed login attempt", "Accessed admin panel", 
      "Updated profile", "Viewed report", "Uploaded file"
    ];
    
    return {
      username: username,
      timestamp: new Date().toISOString(),
      profile: {
        first_seen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_seen: new Date(Date.now() - Math.random() * 120 * 60000).toISOString(),
        total_sessions: Math.round(Math.random() * 900 + 100),
        average_session_duration: `${Math.round(Math.random() * 60 + 20)} minutes`,
        risk_level: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        department: ["IT", "Finance", "HR", "Sales", "Marketing"][Math.floor(Math.random() * 5)]
      },
      today_activity: {
        sessions_count: Math.round(Math.random() * 12 + 3),
        total_duration_minutes: Math.round(Math.random() * 360 + 120),
        applications_accessed: Math.round(Math.random() * 15 + 5),
        files_accessed: Math.round(Math.random() * 40 + 10),
        failed_login_attempts: Math.round(Math.random() * 3),
        unusual_activities: Math.round(Math.random() * 2)
      },
      connection_patterns: {
        usual_login_times: ["08:30-09:00", "13:00-14:00"],
        common_locations: ["Office Network", "VPN Home"],
        common_devices: ["Windows Laptop", "Mobile Phone"],
        recent_ips: [`10.0.1.${Math.round(Math.random() * 99 + 100)}`, `10.0.1.${Math.round(Math.random() * 99 + 100)}`]
      },
      recent_activities: Array.from({length: 10}, () => ({
        timestamp: new Date(Date.now() - Math.random() * 480 * 60000).toISOString(),
        activity: activities[Math.floor(Math.random() * activities.length)],
        ip_address: `10.0.1.${Math.round(Math.random() * 99 + 100)}`,
        device: ["Windows Laptop", "Mobile Phone", "Tablet"][Math.floor(Math.random() * 3)],
        status: ["Success", "Failed", "Warning"][Math.floor(Math.random() * 3)]
      })),
      time_based_analysis: {
        peak_hours: ["09:00-10:00", "14:00-15:00", "16:00-17:00"],
        off_hours_activity: Math.round(Math.random() * 5),
        weekend_activity: Math.round(Math.random() * 3),
        unusual_timing_score: Math.round(Math.random() * 100),
        activity_by_hour: Object.fromEntries(Array.from({length: 24}, (_, i) => [`${i.toString().padStart(2, '0')}:00`, Math.round(Math.random() * 20)])),
        activity_by_day: {
          "Monday": Math.round(Math.random() * 30 + 20),
          "Tuesday": Math.round(Math.random() * 30 + 25),
          "Wednesday": Math.round(Math.random() * 25 + 20),
          "Thursday": Math.round(Math.random() * 30 + 30),
          "Friday": Math.round(Math.random() * 25 + 15),
          "Saturday": Math.round(Math.random() * 10),
          "Sunday": Math.round(Math.random() * 5)
        }
      },
      device_fingerprinting: {
        known_devices: Array.from({length: Math.round(Math.random() * 3 + 1)}, (_, i) => ({
          device_id: `DEV-${Math.round(Math.random() * 8999 + 1000)}`,
          device_name: ["Windows Laptop", "MacBook Pro", "iPhone 13", "Android Phone"][Math.floor(Math.random() * 4)],
          os: ["Windows 11", "macOS Monterey", "iOS 15", "Android 12"][Math.floor(Math.random() * 4)],
          browser: ["Chrome 98", "Safari 15", "Firefox 97", "Edge 98"][Math.floor(Math.random() * 4)],
          screen_resolution: ["1920x1080", "2560x1440", "3840x2160", "1366x768"][Math.floor(Math.random() * 4)],
          timezone: ["America/New_York", "Europe/London", "Asia/Tokyo"][Math.floor(Math.random() * 3)],
          language: ["en-US", "en-GB", "ja-JP", "fr-FR"][Math.floor(Math.random() * 4)],
          first_seen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date(Date.now() - Math.random() * 480 * 60000).toISOString(),
          trust_score: Math.round(Math.random() * 40 + 60)
        })),
        suspicious_devices: Math.round(Math.random() * 2),
        device_changes_last_30_days: Math.round(Math.random() * 5)
      },
      risk_scoring: {
        overall_score: Math.round(Math.random() * 100),
        factors: {
          login_pattern_anomaly: Math.round(Math.random() * 30),
          geographic_anomaly: Math.round(Math.random() * 25),
          device_anomaly: Math.round(Math.random() * 20),
          time_anomaly: Math.round(Math.random() * 15),
          privilege_escalation: Math.round(Math.random() * 10)
        },
        risk_level: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
        recommendation: [
          "Monitor user activity",
          "Require additional authentication",
          "Review user permissions",
          "Investigate suspicious behavior"
        ][Math.floor(Math.random() * 4)]
      },
      alerts: [
        {
          severity: "medium",
          message: "Login from new location detected",
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  };

  const generateDummyIPDetails = (ip) => {
    return {
      ip_address: ip,
      timestamp: new Date().toISOString(),
      profile: {
        first_seen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        last_seen: new Date(Date.now() - Math.random() * 120 * 60000).toISOString(),
        total_connections: Math.round(Math.random() * 450 + 50),
        unique_users: Math.round(Math.random() * 9 + 1),
        geolocation: {
          city: ["New York", "London", "Sydney", "Tokyo", "Seattle", "Toronto"][Math.floor(Math.random() * 6)],
          country: ["United States", "United Kingdom", "Australia", "Japan", "Canada"][Math.floor(Math.random() * 5)],
          country_code: ["US", "GB", "AU", "JP", "CA"][Math.floor(Math.random() * 5)],
          coordinates: {
            latitude: Math.round(Math.random() * 180 - 90),
            longitude: Math.round(Math.random() * 360 - 180)
          },
          timezone: ["UTC-5", "UTC+0", "UTC+10", "UTC+9", "UTC-8"][Math.floor(Math.random() * 5)],
          isp: ["Comcast", "AT&T", "Verizon", "BT Group", "Telstra", "Rogers"][Math.floor(Math.random() * 6)],
          asn: `AS${Math.round(Math.random() * 8999 + 1000)}`,
          is_vpn: Math.random() > 0.7,
          is_proxy: Math.random() > 0.8,
          is_datacenter: Math.random() > 0.6
        },
        threat_intelligence: {
          reputation: ["Clean", "Suspicious", "Malicious"][Math.floor(Math.random() * 3)],
          blacklist_status: ["Not Listed", "Warning", "Blocked"][Math.floor(Math.random() * 3)],
          vpn_detected: Math.random() > 0.7,
          tor_detected: Math.random() > 0.9
        }
      },
      today_activity: {
        connections_count: Math.round(Math.random() * 45 + 5),
        unique_users: Math.round(Math.random() * 4 + 1),
        total_duration_minutes: Math.round(Math.random() * 240 + 60),
        failed_authentications: Math.round(Math.random() * 5),
        successful_logins: Math.round(Math.random() * 22 + 3),
        data_transferred_mb: Math.round(Math.random() * 490 + 10)
      },
      users_from_ip: Array.from({length: Math.round(Math.random() * 4 + 1)}, (_, i) => ({
        username: `user${i + 1}`,
        sessions_today: Math.round(Math.random() * 7 + 1),
        last_activity: new Date(Date.now() - Math.random() * 240 * 60000).toISOString(),
        authentication_status: ["Success", "Failed", "Locked"][Math.floor(Math.random() * 3)]
      })),
      recent_activities: Array.from({length: 15}, () => ({
        timestamp: new Date(Date.now() - Math.random() * 480 * 60000).toISOString(),
        user: `user${Math.round(Math.random() * 9 + 1)}`,
        activity: ["Login attempt", "File download", "API access", "Database query", "Admin access"][Math.floor(Math.random() * 5)],
        status: ["Success", "Failed", "Blocked"][Math.floor(Math.random() * 3)],
        port: ["80", "443", "22", "3389"][Math.floor(Math.random() * 4)],
        bytes_transferred: Math.round(Math.random() * 1048576 + 1024)
      })),
      security_alerts: [
        {
          severity: "high",
          message: "Multiple failed login attempts detected",
          timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  };

  const fetchOverview = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/user-behaviour/overview');
      const data = await response.json();
      if (data.success) {
        setOverview(data.data);
      } else {
        setOverview(generateDummyOverview());
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user behaviour overview, using dummy data:', error);
      setOverview(generateDummyOverview());
      setLoading(false);
    }
  };

  const fetchUserDetails = async (username) => {
    try {
      const response = await fetch(`http://localhost:8000/api/user-behaviour/user/${username}`);
      const data = await response.json();
      if (data.success) {
        setUserDetails(data.data);
      } else {
        setUserDetails(generateDummyUserDetails(username));
      }
      setSelectedUser(username);
      setActiveTab('user-detail');
    } catch (error) {
      console.error('Error fetching user details, using dummy data:', error);
      setUserDetails(generateDummyUserDetails(username));
      setSelectedUser(username);
      setActiveTab('user-detail');
    }
  };

  const fetchIPDetails = async (ip) => {
    try {
      const response = await fetch(`http://localhost:8000/api/user-behaviour/ip/${ip}`);
      const data = await response.json();
      if (data.success) {
        setIPDetails(data.data);
      } else {
        setIPDetails(generateDummyIPDetails(ip));
      }
      setSelectedIP(ip);
      setActiveTab('ip-detail');
    } catch (error) {
      console.error('Error fetching IP details, using dummy data:', error);
      setIPDetails(generateDummyIPDetails(ip));
      setSelectedIP(ip);
      setActiveTab('ip-detail');
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore < 30) return '#10b981';
    if (riskScore < 70) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskLevel = (riskScore) => {
    if (riskScore < 30) return 'Low';
    if (riskScore < 70) return 'Medium';
    return 'High';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredUsers = overview?.top_users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredIPs = overview?.top_ips.filter(ip => 
    ip.ip_address.includes(searchTerm) || 
    ip.geolocation.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="user-behaviour-page">
        <div className="page-header">
          <h1><Users size={28} /> User Behaviour Analytics</h1>
          <p>Monitor user and IP activity patterns</p>
        </div>
        <div className="loading">Loading behaviour analytics...</div>
      </div>
    );
  }

  return (
    <div className="user-behaviour-page">
      <div className="page-header">
        <h1><Users size={28} /> User Behaviour Analytics</h1>
        <p>Comprehensive user activity monitoring and behavioral analysis</p>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search users or IPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={fetchOverview}>
            <Activity size={16} />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={16} />
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <User size={16} />
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'ips' ? 'active' : ''}`}
          onClick={() => setActiveTab('ips')}
        >
          <Monitor size={16} />
          IP Addresses
        </button>
        {userDetails && (
          <button 
            className={`tab-button ${activeTab === 'user-detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-detail')}
          >
            <User size={16} />
            {selectedUser}
          </button>
        )}
        {ipDetails && (
          <button 
            className={`tab-button ${activeTab === 'ip-detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('ip-detail')}
          >
            <Monitor size={16} />
            {selectedIP}
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="tab-content">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">
                <Users size={24} />
              </div>
              <div className="summary-content">
                <h3>Active Users</h3>
                <div className="summary-value">{overview.summary.total_active_users}</div>
                <div className="summary-label">Today</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <Monitor size={24} />
              </div>
              <div className="summary-content">
                <h3>Unique IPs</h3>
                <div className="summary-value">{overview.summary.total_unique_ips}</div>
                <div className="summary-label">Active</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <Activity size={24} />
              </div>
              <div className="summary-content">
                <h3>Sessions</h3>
                <div className="summary-value">{overview.summary.total_sessions_today}</div>
                <div className="summary-label">Today</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <Clock size={24} />
              </div>
              <div className="summary-content">
                <h3>Avg Session</h3>
                <div className="summary-value">{overview.summary.average_session_duration_minutes}</div>
                <div className="summary-label">Minutes</div>
              </div>
            </div>

            <div className="summary-card alert">
              <div className="summary-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="summary-content">
                <h3>Suspicious Activities</h3>
                <div className="summary-value">{overview.summary.suspicious_activities}</div>
                <div className="summary-label">Detected</div>
              </div>
            </div>
          </div>

          <div className="overview-sections">
            <div className="overview-section">
              <h3>Top Active Users</h3>
              <div className="user-list">
                {overview.top_users.slice(0, 5).map((user, index) => (
                  <div key={index} className="user-item" onClick={() => fetchUserDetails(user.username)}>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-meta">
                        {user.sessions_today} sessions • {user.locations} locations
                      </div>
                    </div>
                    <div className="user-stats">
                      <div 
                        className="risk-badge" 
                        style={{backgroundColor: getRiskColor(user.risk_score)}}
                      >
                        {getRiskLevel(user.risk_score)} Risk
                      </div>
                      <div className="last-seen">
                        <Clock size={12} />
                        {new Date(user.last_activity).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-section">
              <h3>Top IP Addresses</h3>
              <div className="ip-list">
                {overview.top_ips.slice(0, 5).map((ip, index) => (
                  <div key={index} className="ip-item" onClick={() => fetchIPDetails(ip.ip_address)}>
                    <div className="ip-info">
                      <div className="ip-address">{ip.ip_address}</div>
                      <div className="ip-location">
                        <MapPin size={12} />
                        {ip.geolocation}
                      </div>
                    </div>
                    <div className="ip-stats">
                      <div className="ip-meta">
                        {ip.sessions_today} sessions • {ip.unique_users} users
                      </div>
                      <div 
                        className="risk-badge" 
                        style={{backgroundColor: getRiskColor(ip.risk_score)}}
                      >
                        {getRiskLevel(ip.risk_score)} Risk
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && overview && (
        <div className="tab-content">
          <div className="section-header">
            <h2>All Users</h2>
            <div className="section-meta">{filteredUsers.length} users found</div>
          </div>
          <div className="users-grid">
            {filteredUsers.map((user, index) => (
              <div key={index} className="user-card" onClick={() => fetchUserDetails(user.username)}>
                <div className="card-header">
                  <div className="user-avatar">
                    <User size={20} />
                  </div>
                  <div className="user-info">
                    <h3>{user.username}</h3>
                    <div className="user-meta">Last seen: {formatTime(user.last_activity)}</div>
                  </div>
                  <div 
                    className="risk-indicator"
                    style={{backgroundColor: getRiskColor(user.risk_score)}}
                  >
                    {user.risk_score}
                  </div>
                </div>
                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-label">Sessions Today</span>
                    <span className="stat-value">{user.sessions_today}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Locations</span>
                    <span className="stat-value">{user.locations}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Risk Level</span>
                    <span className="stat-value">{getRiskLevel(user.risk_score)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IPs Tab */}
      {activeTab === 'ips' && overview && (
        <div className="tab-content">
          <div className="section-header">
            <h2>IP Addresses</h2>
            <div className="section-meta">{filteredIPs.length} IPs found</div>
          </div>
          <div className="ips-grid">
            {filteredIPs.map((ip, index) => (
              <div key={index} className="ip-card" onClick={() => fetchIPDetails(ip.ip_address)}>
                <div className="card-header">
                  <div className="ip-icon">
                    <Monitor size={20} />
                  </div>
                  <div className="ip-info">
                    <h3>{ip.ip_address}</h3>
                    <div className="ip-location">
                      <MapPin size={12} />
                      {ip.geolocation}
                    </div>
                  </div>
                  <div 
                    className="risk-indicator"
                    style={{backgroundColor: getRiskColor(ip.risk_score)}}
                  >
                    {ip.risk_score}
                  </div>
                </div>
                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-label">Sessions Today</span>
                    <span className="stat-value">{ip.sessions_today}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Users</span>
                    <span className="stat-value">{ip.unique_users}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Risk Level</span>
                    <span className="stat-value">{getRiskLevel(ip.risk_score)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Detail Tab */}
      {activeTab === 'user-detail' && userDetails && (
        <div className="tab-content">
          <div className="detail-header">
            <div className="detail-title">
              <User size={32} />
              <div>
                <h2>{userDetails.username}</h2>
                <div className="detail-meta">
                  {userDetails.profile.department} • Risk Level: {userDetails.profile.risk_level}
                </div>
              </div>
            </div>
            <div className="detail-stats">
              <div className="detail-stat">
                <span className="stat-label">Total Sessions</span>
                <span className="stat-value">{userDetails.profile.total_sessions}</span>
              </div>
              <div className="detail-stat">
                <span className="stat-label">Avg Session</span>
                <span className="stat-value">{userDetails.profile.average_session_duration}</span>
              </div>
            </div>
          </div>

          <div className="detail-sections">
            <div className="detail-section">
              <h3>Today's Activity</h3>
              <div className="activity-grid">
                <div className="activity-item">
                  <span className="activity-label">Sessions</span>
                  <span className="activity-value">{userDetails.today_activity.sessions_count}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Duration</span>
                  <span className="activity-value">{userDetails.today_activity.total_duration_minutes} min</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Applications</span>
                  <span className="activity-value">{userDetails.today_activity.applications_accessed}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Files Accessed</span>
                  <span className="activity-value">{userDetails.today_activity.files_accessed}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Failed Logins</span>
                  <span className="activity-value">{userDetails.today_activity.failed_login_attempts}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Unusual Activities</span>
                  <span className="activity-value">{userDetails.today_activity.unusual_activities}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Connection Patterns</h3>
              <div className="patterns-grid">
                <div className="pattern-item">
                  <span className="pattern-label">Usual Login Times</span>
                  <span className="pattern-value">{userDetails.connection_patterns.usual_login_times.join(', ')}</span>
                </div>
                <div className="pattern-item">
                  <span className="pattern-label">Common Locations</span>
                  <span className="pattern-value">{userDetails.connection_patterns.common_locations.join(', ')}</span>
                </div>
                <div className="pattern-item">
                  <span className="pattern-label">Common Devices</span>
                  <span className="pattern-value">{userDetails.connection_patterns.common_devices.join(', ')}</span>
                </div>
                <div className="pattern-item">
                  <span className="pattern-label">Recent IPs</span>
                  <span className="pattern-value">{userDetails.connection_patterns.recent_ips.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Risk Scoring */}
            <div className="detail-section">
              <h3>Risk Analysis</h3>
              <div className="risk-analysis-container">
                <div className="risk-score-overview">
                  <div className="risk-score-circle" style={{borderColor: getRiskColor(userDetails.risk_scoring.overall_score)}}>
                    <span className="risk-score-value">{userDetails.risk_scoring.overall_score}</span>
                    <span className="risk-score-label">Risk Score</span>
                  </div>
                  <div className="risk-details">
                    <div className="risk-level" style={{color: getRiskColor(userDetails.risk_scoring.overall_score)}}>
                      {userDetails.risk_scoring.risk_level} Risk
                    </div>
                    <div className="risk-recommendation">
                      {userDetails.risk_scoring.recommendation}
                    </div>
                  </div>
                </div>
                <div className="risk-factors">
                  <h4>Risk Factors Breakdown</h4>
                  {Object.entries(userDetails.risk_scoring.factors).map(([factor, score], index) => (
                    <div key={index} className="risk-factor">
                      <span className="factor-name">{factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <div className="factor-score">
                        <div className="factor-bar">
                          <div 
                            className="factor-fill" 
                            style={{
                              width: `${(score / 30) * 100}%`,
                              backgroundColor: getRiskColor(score * 3.33)
                            }}
                          ></div>
                        </div>
                        <span className="factor-value">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time-based Analysis */}
            <div className="detail-section">
              <h3>Time-based Activity Analysis</h3>
              <div className="time-analysis">
                <div className="time-stats">
                  <div className="time-stat">
                    <span className="time-label">Peak Hours</span>
                    <span className="time-value">{userDetails.time_based_analysis.peak_hours.join(', ')}</span>
                  </div>
                  <div className="time-stat">
                    <span className="time-label">Off-hours Activity</span>
                    <span className="time-value">{userDetails.time_based_analysis.off_hours_activity} sessions</span>
                  </div>
                  <div className="time-stat">
                    <span className="time-label">Weekend Activity</span>
                    <span className="time-value">{userDetails.time_based_analysis.weekend_activity} sessions</span>
                  </div>
                  <div className="time-stat">
                    <span className="time-label">Unusual Timing Score</span>
                    <span className="time-value" style={{color: getRiskColor(userDetails.time_based_analysis.unusual_timing_score)}}>
                      {userDetails.time_based_analysis.unusual_timing_score}/100
                    </span>
                  </div>
                </div>
                <div className="activity-charts">
                  <div className="activity-chart">
                    <h5>Activity by Day</h5>
                    <div className="day-activity-bars">
                      {Object.entries(userDetails.time_based_analysis.activity_by_day).map(([day, activity], index) => (
                        <div key={index} className="day-bar">
                          <div className="day-name">{day.slice(0, 3)}</div>
                          <div className="activity-bar">
                            <div 
                              className="activity-fill" 
                              style={{
                                height: `${(activity / 60) * 100}%`,
                                backgroundColor: '#3b82f6'
                              }}
                            ></div>
                          </div>
                          <div className="activity-count">{activity}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Fingerprinting */}
            <div className="detail-section">
              <h3>Device Fingerprinting</h3>
              <div className="device-fingerprinting">
                <div className="device-summary">
                  <div className="device-stat">
                    <span className="device-label">Known Devices</span>
                    <span className="device-value">{userDetails.device_fingerprinting.known_devices.length}</span>
                  </div>
                  <div className="device-stat">
                    <span className="device-label">Suspicious Devices</span>
                    <span className="device-value">{userDetails.device_fingerprinting.suspicious_devices}</span>
                  </div>
                  <div className="device-stat">
                    <span className="device-label">Device Changes (30d)</span>
                    <span className="device-value">{userDetails.device_fingerprinting.device_changes_last_30_days}</span>
                  </div>
                </div>
                <div className="device-list">
                  <h4>Known Devices</h4>
                  {userDetails.device_fingerprinting.known_devices.map((device, index) => (
                    <div key={index} className="device-item">
                      <div className="device-info">
                        <div className="device-name">{device.device_name}</div>
                        <div className="device-details">
                          {device.os} • {device.browser} • {device.screen_resolution}
                        </div>
                        <div className="device-meta">
                          First seen: {formatTime(device.first_seen)} • 
                          Last seen: {formatTime(device.last_seen)} • 
                          {device.timezone} • {device.language}
                        </div>
                      </div>
                      <div className="device-trust">
                        <div 
                          className="trust-score" 
                          style={{color: getRiskColor(100 - device.trust_score)}}
                        >
                          {device.trust_score}% Trust
                        </div>
                        <div className="device-id">{device.device_id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Recent Activities</h3>
              <div className="activities-list">
                {userDetails.recent_activities.map((activity, index) => (
                  <div key={index} className="activity-log-item">
                    <div className="activity-time">
                      <Clock size={14} />
                      {formatTime(activity.timestamp)}
                    </div>
                    <div className="activity-details">
                      <div className="activity-action">{activity.activity}</div>
                      <div className="activity-meta">
                        {activity.ip_address} • {activity.device}
                      </div>
                    </div>
                    <div className={`activity-status status-${activity.status.toLowerCase()}`}>
                      {activity.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {userDetails.alerts && userDetails.alerts.length > 0 && (
              <div className="detail-section">
                <h3>Security Alerts</h3>
                <div className="alerts-list">
                  {userDetails.alerts.map((alert, index) => (
                    <div key={index} className={`alert alert-${alert.severity}`}>
                      <AlertTriangle size={16} />
                      <div className="alert-content">
                        <div className="alert-message">{alert.message}</div>
                        <div className="alert-time">
                          <Clock size={12} />
                          {formatTime(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IP Detail Tab */}
      {activeTab === 'ip-detail' && ipDetails && (
        <div className="tab-content">
            <div className="detail-header">
              <div className="detail-title">
                <Monitor size={32} />
                <div>
                  <h2>{ipDetails.ip_address}</h2>
                  <div className="detail-meta">
                    <MapPin size={14} />
                    {typeof ipDetails.profile.geolocation === 'object' ? 
                      `${ipDetails.profile.geolocation.city}, ${ipDetails.profile.geolocation.country}` :
                      ipDetails.profile.geolocation
                    }
                  </div>
                </div>
              </div>
            <div className="detail-stats">
              <div className="detail-stat">
                <span className="stat-label">Total Connections</span>
                <span className="stat-value">{ipDetails.profile.total_connections}</span>
              </div>
              <div className="detail-stat">
                <span className="stat-label">Unique Users</span>
                <span className="stat-value">{ipDetails.profile.unique_users}</span>
              </div>
              <div className="detail-stat">
                <span className="stat-label">Reputation</span>
                <span className={`stat-value reputation-${ipDetails.profile.threat_intelligence.reputation.toLowerCase()}`}>
                  {ipDetails.profile.threat_intelligence.reputation}
                </span>
              </div>
            </div>
            </div>

          <div className="detail-sections">
            {/* Enhanced Geolocation */}
            <div className="detail-section">
              <h3>Enhanced Geolocation Intelligence</h3>
              {typeof ipDetails.profile.geolocation === 'object' && (
                <div className="geolocation-details">
                  <div className="geo-overview">
                    <div className="geo-location">
                      <h4>{ipDetails.profile.geolocation.city}, {ipDetails.profile.geolocation.country}</h4>
                      <div className="geo-coordinates">
                        📍 {ipDetails.profile.geolocation.coordinates.latitude}, {ipDetails.profile.geolocation.coordinates.longitude}
                      </div>
                      <div className="geo-timezone">
                        🕐 {ipDetails.profile.geolocation.timezone}
                      </div>
                    </div>
                    <div className="geo-network">
                      <div className="geo-detail">
                        <span className="geo-label">ISP</span>
                        <span className="geo-value">{ipDetails.profile.geolocation.isp}</span>
                      </div>
                      <div className="geo-detail">
                        <span className="geo-label">ASN</span>
                        <span className="geo-value">{ipDetails.profile.geolocation.asn}</span>
                      </div>
                      <div className="geo-detail">
                        <span className="geo-label">Country Code</span>
                        <span className="geo-value">{ipDetails.profile.geolocation.country_code}</span>
                      </div>
                    </div>
                  </div>
                  <div className="geo-flags">
                    <div className={`geo-flag ${ipDetails.profile.geolocation.is_vpn ? 'warning' : 'safe'}`}>
                      <span className="flag-icon">{ipDetails.profile.geolocation.is_vpn ? '🔒' : '✅'}</span>
                      <span className="flag-text">{ipDetails.profile.geolocation.is_vpn ? 'VPN Detected' : 'No VPN'}</span>
                    </div>
                    <div className={`geo-flag ${ipDetails.profile.geolocation.is_proxy ? 'warning' : 'safe'}`}>
                      <span className="flag-icon">{ipDetails.profile.geolocation.is_proxy ? '🛡️' : '✅'}</span>
                      <span className="flag-text">{ipDetails.profile.geolocation.is_proxy ? 'Proxy Detected' : 'No Proxy'}</span>
                    </div>
                    <div className={`geo-flag ${ipDetails.profile.geolocation.is_datacenter ? 'info' : 'safe'}`}>
                      <span className="flag-icon">{ipDetails.profile.geolocation.is_datacenter ? '🏢' : '🏠'}</span>
                      <span className="flag-text">{ipDetails.profile.geolocation.is_datacenter ? 'Datacenter' : 'Residential'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Today's Activity</h3>
              <div className="activity-grid">
                <div className="activity-item">
                  <span className="activity-label">Connections</span>
                  <span className="activity-value">{ipDetails.today_activity.connections_count}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Unique Users</span>
                  <span className="activity-value">{ipDetails.today_activity.unique_users}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Duration</span>
                  <span className="activity-value">{ipDetails.today_activity.total_duration_minutes} min</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Failed Auth</span>
                  <span className="activity-value">{ipDetails.today_activity.failed_authentications}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Successful Logins</span>
                  <span className="activity-value">{ipDetails.today_activity.successful_logins}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Data Transferred</span>
                  <span className="activity-value">{ipDetails.today_activity.data_transferred_mb} MB</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Threat Intelligence</h3>
              <div className="threat-grid">
                <div className="threat-item">
                  <span className="threat-label">Reputation</span>
                  <span className={`threat-value reputation-${ipDetails.profile.threat_intelligence.reputation.toLowerCase()}`}>
                    {ipDetails.profile.threat_intelligence.reputation}
                  </span>
                </div>
                <div className="threat-item">
                  <span className="threat-label">Blacklist Status</span>
                  <span className="threat-value">{ipDetails.profile.threat_intelligence.blacklist_status}</span>
                </div>
                <div className="threat-item">
                  <span className="threat-label">VPN Detected</span>
                  <span className="threat-value">{ipDetails.profile.threat_intelligence.vpn_detected ? 'Yes' : 'No'}</span>
                </div>
                <div className="threat-item">
                  <span className="threat-label">Tor Detected</span>
                  <span className="threat-value">{ipDetails.profile.threat_intelligence.tor_detected ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Users from this IP</h3>
              <div className="users-from-ip">
                {ipDetails.users_from_ip.map((user, index) => (
                  <div key={index} className="user-from-ip-item">
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      <span className="user-meta">
                        {user.sessions_today} sessions • Last: {formatTime(user.last_activity)}
                      </span>
                    </div>
                    <div className={`auth-status status-${user.authentication_status.toLowerCase()}`}>
                      {user.authentication_status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h3>Recent Activities</h3>
              <div className="activities-list">
                {ipDetails.recent_activities.map((activity, index) => (
                  <div key={index} className="activity-log-item">
                    <div className="activity-time">
                      <Clock size={14} />
                      {formatTime(activity.timestamp)}
                    </div>
                    <div className="activity-details">
                      <div className="activity-action">{activity.activity}</div>
                      <div className="activity-meta">
                        User: {activity.user} • Port: {activity.port} • {(activity.bytes_transferred / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <div className={`activity-status status-${activity.status.toLowerCase()}`}>
                      {activity.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {ipDetails.security_alerts && ipDetails.security_alerts.length > 0 && (
              <div className="detail-section">
                <h3>Security Alerts</h3>
                <div className="alerts-list">
                  {ipDetails.security_alerts.map((alert, index) => (
                    <div key={index} className={`alert alert-${alert.severity}`}>
                      <AlertTriangle size={16} />
                      <div className="alert-content">
                        <div className="alert-message">{alert.message}</div>
                        <div className="alert-time">
                          <Clock size={12} />
                          {formatTime(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBehaviour;
