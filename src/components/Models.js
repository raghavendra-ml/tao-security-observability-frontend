import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';

const Models = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await apiService.getModels();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
      // Mock data for demonstration
      setModels([
        {
          id: 1,
          model_name: 'AuthRejectModel',
          status: 'Disabled',
          model_type: 'Log Analysis',
          time_window: '10min',
          updated: '2025-07-29'
        },
        {
          id: 2,
          model_name: 'VPNSpikeDetector',
          status: 'Enabled',
          model_type: 'Anomaly Detection',
          time_window: '1hr',
          updated: '2025-07-29'
        },
        {
          id: 3,
          model_name: 'LockoutAlertModel',
          status: 'Disabled',
          model_type: 'Classification',
          time_window: '5min',
          updated: '2025-07-29'
        },
        {
          id: 4,
          model_name: 'PolicyChangeTracker',
          status: 'Enabled',
          model_type: 'Log Analysis',
          time_window: '1hr',
          updated: '2025-07-29'
        },
        {
          id: 5,
          model_name: 'AccountCreationWatcher',
          status: 'Enabled',
          model_type: 'Classification',
          time_window: '10min',
          updated: '2025-07-29'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.model_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || model.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    return status === 'Enabled' ? 'status-enabled' : 'status-disabled';
  };

  if (loading) {
    return <div className="loading">Loading models...</div>;
  }

  return (
    <div className="models-page">
      <div className="page-header">
        <h1>Rules/Models</h1>
      </div>

      <div className="models-controls">
        <div className="controls-left">
          <div className="dropdown-filter">
            <button className="dropdown-btn">
              Models <ChevronDown size={16} />
            </button>
          </div>
          
          <div className="status-filter">
            <span>Status: </span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="All">All</option>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>
            <ChevronDown size={16} className="dropdown-icon" />
          </div>
        </div>

        <div className="controls-right">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <Link to="/models/add" className="add-model-btn">
            Add Model
          </Link>
        </div>
      </div>

      <div className="models-table-container">
        <table className="models-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Type</th>
              <th>Window</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((model) => (
              <tr key={model.id} className="model-row">
                <td className="model-name">{model.model_name}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(model.status)}`}>
                    {model.status}
                  </span>
                </td>
                <td>{model.model_type}</td>
                <td>{model.time_window}</td>
                <td>{new Date(model.updated).toLocaleDateString()}</td>
                <td>
                  <Link 
                    to={`/models/edit/${model.model_name.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="edit-btn"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredModels.length === 0 && !loading && (
        <div className="no-models">
          <p>No models found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default Models;
