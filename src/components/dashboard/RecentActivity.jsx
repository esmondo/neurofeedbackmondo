import React from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ActivityCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ActivityList = styled.div`
  margin: 1rem 0;
`;

const ActivityItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f9fafb;
  }
  
  .activity-name {
    font-weight: 500;
  }
  
  .activity-date {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .activity-details {
    display: flex;
    flex-direction: column;
  }
  
  .activity-metrics {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
  }
  
  .metric {
    color: #4b5563;
  }
  
  .metric-value {
    font-weight: 500;
  }
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
`;

const InfoTooltip = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 0.5rem;
  
  .tooltip-icon {
    color: #9ca3af;
    cursor: help;
    transition: color 0.2s;
  }
  
  &:hover .tooltip-icon {
    color: #2563eb;
  }
  
  .tooltip-text {
    visibility: hidden;
    width: 200px;
    background-color: #1f2937;
    color: white;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.75rem;
    font-weight: normal;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }
  
  .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #1f2937 transparent transparent transparent;
  }
  
  &:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`;

// Sample data - in a real app, this would come from a database
const sampleActivities = [
  {
    id: 1,
    name: 'Meditation Session',
    date: '2023-03-23',
    time: '15:30',
    duration: 300,
    metrics: {
      focus: 0.76,
      relaxation: 0.82
    }
  },
  {
    id: 2,
    name: 'Focus Training',
    date: '2023-03-22',
    time: '09:45',
    duration: 600,
    metrics: {
      focus: 0.68,
      relaxation: 0.55
    }
  },
  {
    id: 3,
    name: 'Baseline Recording',
    date: '2023-03-21',
    time: '18:15',
    duration: 180,
    metrics: {
      focus: 0.62,
      relaxation: 0.70
    }
  }
];

// Sample progress data for the chart
const progressData = {
  labels: ['5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
  datasets: [
    {
      label: 'Focus',
      data: [0.58, 0.62, 0.65, 0.68, 0.71, 0.76],
      borderColor: '#805AD5',
      backgroundColor: 'rgba(128, 90, 213, 0.1)',
      tension: 0.3,
    },
    {
      label: 'Relaxation',
      data: [0.65, 0.7, 0.6, 0.72, 0.75, 0.82],
      borderColor: '#4299E1',
      backgroundColor: 'rgba(66, 153, 225, 0.1)',
      tension: 0.3,
    }
  ]
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += Math.round(context.parsed.y * 100) + '%';
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 1,
      ticks: {
        callback: function(value) {
          return Math.round(value * 100) + '%';
        }
      }
    }
  },
  maintainAspectRatio: false
};

const RecentActivity = () => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };
  
  const formatMetric = (value) => {
    return `${Math.round(value * 100)}%`;
  };
  
  return (
    <ActivityCard>
      <ActivityHeader>
        <h2>
          Recent Activity
          <InfoTooltip>
            <span className="tooltip-icon">ⓘ</span>
            <span className="tooltip-text">View your recent neurofeedback sessions and track your progress over time.</span>
          </InfoTooltip>
        </h2>
      </ActivityHeader>
      
      <div style={{ height: '180px', marginBottom: '1rem' }}>
        <Line data={progressData} options={chartOptions} />
      </div>
      
      <ActivityList>
        {sampleActivities.length > 0 ? (
          sampleActivities.map(activity => (
            <ActivityItem key={activity.id}>
              <div className="activity-details">
                <div className="activity-name">{activity.name}</div>
                <div className="activity-date">{activity.date} at {activity.time} ({formatDuration(activity.duration)})</div>
              </div>
              <div className="activity-metrics">
                <div className="metric">
                  Focus: <span className="metric-value">{formatMetric(activity.metrics.focus)}</span>
                </div>
                <div className="metric">
                  Relaxation: <span className="metric-value">{formatMetric(activity.metrics.relaxation)}</span>
                </div>
              </div>
            </ActivityItem>
          ))
        ) : (
          <EmptyState>
            No recent activity. Start a session to see your progress!
          </EmptyState>
        )}
      </ActivityList>
    </ActivityCard>
  );
};

export default RecentActivity; 