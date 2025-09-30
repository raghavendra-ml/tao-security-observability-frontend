import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const reportTiles = [
    {
      id: 'incident-summary',
      title: 'Incident Summary Report',
      description: 'Track confirmed security incidents and their resolution with MTTR metrics',
      icon: '📊',
      color: '#dc3545',
      features: [
        'Incident tracking & resolution',
        'MTTR (Mean Time to Respond)',
        'Incidents by category',
        'Incident trends over time'
      ],
      route: '/reports/incident-summary'
    },
    {
      id: 'model-performance',
      title: 'Model Performance Report',
      description: 'Evaluate the performance of machine learning and detection models',
      icon: '🤖',
      color: '#28a745',
      features: [
        'Precision, Recall, F1 Score',
        'False positives/negatives',
        'Model version tracking',
        'Anomaly generation metrics'
      ],
      route: '/reports/model-performance'
    },
    {
      id: 'executive-dashboard',
      title: 'Executive Security Dashboard',
      description: 'High-level security metrics and insights for leadership',
      icon: '👔',
      color: '#6f42c1',
      features: [
        'Key security metrics overview',
        'Top 5 risks and threats',
        'Model performance at-a-glance',
        'Response automation rate'
      ],
      route: '/reports/executive-dashboard'
    }
  ];

  const handleTileClick = (report) => {
    navigate(report.route);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Security Reports</h1>
        <p>Live report generation based on real-time security data</p>
      </div>

      <div className="report-tiles-grid">
        {reportTiles.map((report) => (
          <div 
            key={report.id}
            className="report-tile"
            onClick={() => handleTileClick(report)}
            style={{ '--tile-color': report.color }}
          >
            <div className="report-tile-header">
              <span className="report-icon">{report.icon}</span>
              <h3>{report.title}</h3>
            </div>
            
            <div className="report-tile-content">
              <p className="report-description">{report.description}</p>
              
              <ul className="report-features">
                {report.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="report-tile-footer">
              <button className="generate-report-btn">
                Generate Report
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="reports-info">
        <div className="info-card">
          <h4>📈 Live Data Sources</h4>
          <p>All reports are generated using real-time data from:</p>
          <ul>
            <li>Incidents database</li>
            <li>ML Models registry</li>
            <li>Anomaly detection logs</li>
            <li>Response automation metrics</li>
          </ul>
        </div>

        <div className="info-card">
          <h4>🔄 Auto-Refresh</h4>
          <p>Reports automatically refresh with the latest data every time you access them, ensuring you always have current security insights.</p>
        </div>

        <div className="info-card">
          <h4>👥 Target Audience</h4>
          <ul>
            <li><strong>Incident Summary:</strong> SOC analysts, Security teams</li>
            <li><strong>Model Performance:</strong> Data scientists, ML engineers</li>
            <li><strong>Executive Dashboard:</strong> CISO, IT leadership</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
