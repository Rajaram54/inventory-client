import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { SupplierType, FetchSupplierApiResponse } from '../../types/supplier.types';
import CreateSupplierModal from './CreateSupplierModal.tsx';

const { Title } = Typography;

const Supplier: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierType | null>(null);

  useEffect(() => {
    fetchSuppliers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleDelete = async (supplierId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/suppliers/${supplierId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }

      message.success('Supplier deleted successfully!');
      fetchSuppliers(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting supplier:', error);
      message.error('Failed to delete supplier. Please try again.');
    }
  };

  const fetchSuppliers = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/suppliers?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse: FetchSupplierApiResponse = await response.json();
      setSuppliers(apiResponse.data);
      setTotalSuppliers(apiResponse.total);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      message.error('Failed to load suppliers. Please check your connection.');
      setSuppliers([]);
      setTotalSuppliers(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'supplierId',
      key: 'supplierId',
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
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record: SupplierType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingSupplier(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this supplier?"
            onConfirm={() => handleDelete(record.supplierId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Supplier Management</Title>
<Button type="primary" icon={<PlusOutlined />} onClick={() => {
    console.log("Add Supplier button clicked");
    setCreateModalVisible(true);
}}>
          Add Supplier
        </Button>
      </div>
      
      <AntdTableWrapper
        columns={columns}
        dataSource={suppliers}
        loading={loading}
        rowKey="supplierId"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalSuppliers,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} suppliers`,
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
      
      <CreateSupplierModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingSupplier(null);
        }}
        onSuccess={(supplier) => {
          if (editingSupplier) {
            // Update existing supplier in the list
            setSuppliers(prev => prev.map(s => 
              s.supplierId === supplier.supplierId ? supplier : s
            ));
            setEditingSupplier(null);
          } else {
            // Add new supplier to the list
            setSuppliers(prev => [supplier, ...(prev || [])]);
            setTotalSuppliers(prev => (prev || 0) + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingSupplier}
        supplierData={editingSupplier}
      />
    </Card>
  );
};

export default Supplier;
