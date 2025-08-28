import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

const { Title, Paragraph, Text } = Typography;

const Dashboard: React.FC = () => {
  return (
    <Card>
      <Title level={2}>Dashboard</Title>
      <Paragraph>
        Welcome to your dashboard. Here you can view key metrics and insights.
      </Paragraph>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Title level={4}>Total Users</Title>
            <Text style={{ fontSize: 24 }}>1,234</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Title level={4}>Revenue</Title>
            <Text style={{ fontSize: 24 }}>$12,345</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Title level={4}>Orders</Title>
            <Text style={{ fontSize: 24 }}>567</Text>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default Dashboard;
