import { useState, useEffect } from 'react';
import { Alert, Spin, Typography, Button, Space } from 'antd';
import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
import DateRangeSelector, { DateRange } from './DateRangeSelector';
import StatCards from './StatCards';
import { calendarAPI, CalendarStats } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { Title } = Typography;

/**
 * Dashboard Component
 * Main component for displaying calendar statistics
 */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch calendar statistics for the selected date range
   */
  const fetchStats = async (range: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      const response = await calendarAPI.getStats(range.startDate, range.endDate);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch calendar statistics');
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch calendar statistics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    fetchStats(range);
  };

  /**
   * Handle refresh button click
   */
  const handleRefresh = () => {
    if (dateRange) {
      fetchStats(dateRange);
    }
  };

  // Initial load with default date range (7 days)
  useEffect(() => {
    const defaultRange: DateRange = {
      startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z',
      endDate: new Date().toISOString().split('T')[0] + 'T23:59:59Z',
    };
    setDateRange(defaultRange);
    fetchStats(defaultRange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Title level={2}>Calendar Statistics Dashboard</Title>
            {user && (
              <p className="text-gray-600">Welcome, {user.email}</p>
            )}
          </div>
          <Button
            icon={<LogoutOutlined />}
            onClick={logout}
            danger
          >
            Logout
          </Button>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6">
          <Space direction="vertical" size="middle" className="w-full">
            <Title level={4}>Select Date Range</Title>
            <DateRangeSelector onChange={handleDateRangeChange} />
            {dateRange && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh Data
              </Button>
            )}
          </Space>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {loading && !stats && (
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading calendar statistics...</p>
          </div>
        )}

        {/* Statistics Cards and Charts */}
        {stats && (
          <StatCards stats={stats} loading={loading} />
        )}

        {/* Empty State */}
        {!loading && !error && stats && stats.totalEvents === 0 && (
          <Alert
            message="No Events Found"
            description="No calendar events found for the selected date range. Try selecting a different date range."
            type="info"
            showIcon
            className="mt-6"
          />
        )}
      </div>
    </div>
  );
}

