import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Space } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;

/**
 * Login Page Component
 * Displays Google OAuth login button
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Check for OAuth error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      // Handle error (could show error message to user)
      console.error('OAuth error:', error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Text>Loading...</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <Space direction="vertical" size="large" className="w-full text-center">
          <div>
            <Title level={2}>Calendar Statistics Dashboard</Title>
            <Text type="secondary">
              Connect your Google Calendar to view insightful statistics
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={login}
            className="w-full"
            style={{ height: '48px', fontSize: '16px' }}
          >
            Sign in with Google
          </Button>

          <Text type="secondary" className="text-xs">
            By signing in, you grant access to read your calendar events.
            Your data is processed securely and never stored permanently.
          </Text>
        </Space>
      </Card>
    </div>
  );
}


