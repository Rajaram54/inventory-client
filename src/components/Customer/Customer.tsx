import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { CustomerType, FetchCustomerApiResponse } from '../../types/customer.types';
import CreateCustomerModal from './CreateCustomerModal.tsx';

const { Title } = Typography;

const Customer: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerType | null>(null);

  useEffect(() => {
    fetchCustomers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleDelete = async (customerId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      message.success('Customer deleted successfully!');
      fetchCustomers(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error('Failed to delete customer. Please try again.');
    }
  };

  const fetchCustomers = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/customers?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse: FetchCustomerApiResponse = await response.json();
      
      setCustomers(apiResponse.data);
      setTotalCustomers(apiResponse.total);
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Failed to load customers. Please check your connection.');
      setCustomers([]);
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'customer_id',
      key: 'customer_id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 250,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record: CustomerType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingCustomer(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this customer?"
            onConfirm={() => handleDelete(record.customer_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Customer Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Add Customer
        </Button>
      </div>
      
      <AntdTableWrapper
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="customerId"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCustomers,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} customers`,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
          onShowSizeChange: (current, size) => {
            setCurrentPage(1);
            setPageSize(size);
          },
        }}
      />
      
      <CreateCustomerModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingCustomer(null);
        }}
        onSuccess={(customer) => {
          if (editingCustomer) {
            // Update existing customer in the list
            setCustomers(prev => prev.map(c => 
              c.customer_id === customer.customer_id ? customer : c
            ));
            setEditingCustomer(null);
          } else {
            // Add new customer to the list
            setCustomers(prev => [customer, ...prev]);
            setTotalCustomers(prev => prev + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingCustomer}
        customerData={editingCustomer}
      />
    </Card>
  );
};

export default Customer;
