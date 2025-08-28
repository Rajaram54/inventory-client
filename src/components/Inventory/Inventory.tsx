import React from 'react';
import { Card, Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

const Inventory: React.FC = () => {
  return (
    <Card>
      <Title level={2}>Inventory Management</Title>
      <Paragraph>
        Track and manage your inventory items.
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <Title level={4}>Inventory Items</Title>
          <ul>
            <li>Product A - 100 units</li>
            <li>Product B - 50 units</li>
            <li>Product C - 75 units</li>
          </ul>
        </Card>
      </Space>
    </Card>
  );
};

export default Inventory;
