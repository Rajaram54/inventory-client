import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Input, Card, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Provider } from 'react-redux';
import { store } from './store/index.ts';
import Sidebar from './components/Navigation/Sidebar.tsx';
import Dashboard from './components/Dashboard/Dashboard.tsx';
import Customer from './components/Customer/Customer.tsx';
import Inventory from './components/Inventory/Inventory.tsx';
import Category from './components/Category/Category.tsx';
import Brand from './components/Brand/Brand.tsx';
import Product from './components/Product/Product.tsx';
import Supplier from './components/Supplier/Supplier.tsx';
import Warehouse from './components/Warehouse/Warehouse.tsx';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

interface SearchResult {
  id: number;
  text: string;
}

const AppContent: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    console.log('Searching for:', value);
    setSearchResults([
      { id: 1, text: `Result 1 for "${value}"` },
      { id: 2, text: `Result 2 for "${value}"` },
      { id: 3, text: `Result 3 for "${value}"` }
    ]);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/${tab}`);
    }
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/customer') return 'customer';
    if (path === '/inventory') return 'inventory';
    if (path === '/category') return 'category';
    if (path === '/brand') return 'brand';
    if (path === '/supplier') return 'supplier';
    if (path === '/warehouse') return 'warehouse';
    if (path === '/product') return 'product';
    return 'dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Title level={3} style={{ margin: 0, marginRight: 'auto', color: '#1890ff' }}>
          Qwerty Pro
        </Title>
        <Search
          placeholder="Search..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ width: 300 }}
          onSearch={handleSearch}
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
        />
      </Header>
      
      <Layout>
        <Sidebar activeTab={getActiveTab()} onTabChange={handleTabChange} />
        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/category" element={<Category />} />
              <Route path="/warehouse" element={<Warehouse />} />
              <Route path="/brand" element={<Brand />} />
              <Route path="/supplier" element={<Supplier />} />
              <Route path="/product" element={<Product />} />
            </Routes>
            
            {searchResults.length > 0 && (
              <Card title="Search Results" style={{ marginTop: 24 }}>
                {searchResults.map((result) => (
                  <div key={result.id}>{result.text}</div>
                ))}
              </Card>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;
