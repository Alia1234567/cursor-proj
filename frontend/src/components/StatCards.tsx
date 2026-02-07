import { Card, Statistic, Row, Col } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
import { Pie, Column } from '@ant-design/plots';
import type { CalendarStats } from '../services/api';

interface StatCardsProps {
  stats: CalendarStats;
  loading?: boolean;
}

/**
 * Stat Cards Component
 * Displays calendar statistics in cards and charts
 */
export default function StatCards({ stats, loading = false }: StatCardsProps) {
  // Prepare data for solo vs guest pie chart
  const soloGuestData = [
    {
      type: 'Solo Meetings',
      value: stats.soloMeetings,
    },
    {
      type: 'Guest Meetings',
      value: stats.guestMeetings,
    },
  ];

  // Prepare data for busiest day chart
  // We'll create a simple visualization showing the busiest day
  const busiestDayData = [
    {
      day: stats.busiestDay.day,
      count: stats.busiestDay.count,
    },
  ];

  // Pie chart config for solo vs guest
  const pieConfig = {
    data: soloGuestData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {value}',
    },
    interactions: [{ type: 'element-active' }],
  };

  // Column chart config for busiest day (simplified - showing single day)
  const columnConfig = {
    data: busiestDayData,
    xField: 'day',
    yField: 'count',
    color: '#1890ff',
    columnWidthRatio: 0.5,
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Events"
              value={stats.totalEvents}
              prefix={<CalendarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Duration"
              value={stats.averageDurationFormatted}
              prefix={<ClockCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Solo Meetings"
              value={stats.soloMeetings}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Guest Meetings"
              value={stats.guestMeetings}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Solo vs Guest Meetings" className="h-full">
            {stats.totalEvents > 0 ? (
              <Pie {...pieConfig} />
            ) : (
              <div className="text-center text-gray-400 py-8">
                No data to display
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Busiest Day of the Week" className="h-full">
            <div className="space-y-4">
              <div className="text-center">
                <Statistic
                  title="Day"
                  value={stats.busiestDay.day}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                />
                <Statistic
                  title="Number of Events"
                  value={stats.busiestDay.count}
                  valueStyle={{ fontSize: '20px' }}
                  className="mt-2"
                />
              </div>
              {stats.totalEvents > 0 && (
                <div style={{ height: '200px' }}>
                  <Column {...columnConfig} />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}


