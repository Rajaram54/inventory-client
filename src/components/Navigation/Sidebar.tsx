import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TrademarkOutlined,
  ShopOutlined,
  TruckOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems: any[] = [
    {
      key: 'product',
      icon: <ShoppingCartOutlined />,
      label: 'Product',
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'master-data',
      icon: <AppstoreOutlined />,
      label: 'Master Data',
      children: [
        {
          key: 'customer',
          icon: <UserOutlined />,
          label: 'Customer',
        },
        {
          key: 'inventory',
          icon: <ShoppingOutlined />,
          label: 'Inventory',
        },
        {
          key: 'category',
          icon: <AppstoreOutlined />,
          label: 'Category',
        },
        {
          key: 'brand',
          icon: <TrademarkOutlined />,
          label: 'Brand',
        },
        {
          key: 'supplier',
          icon: <ShopOutlined />,
          label: 'Supplier',
        },
        {
          key: 'warehouse',
          icon: <TruckOutlined />,
          label: 'Warehouse',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    onTabChange(key);
  };

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ height: '100%', borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;
