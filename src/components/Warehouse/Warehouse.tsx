import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { WarehouseType, FetchWarehouseApiResponse } from '../../types/warehouse.types';
import CreateWarehouseModal from './CreateWarehouseModal.tsx';

const { Title } = Typography;

const Warehouse: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalWarehouses, setTotalWarehouses] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseType | null>(null);

  useEffect(() => {
    fetchWarehouses(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleDelete = async (warehouseId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/warehouses/${warehouseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete warehouse');
      }

      message.success('Warehouse deleted successfully!');
      fetchWarehouses(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      message.error('Failed to delete warehouse. Please try again.');
    }
  };

  const fetchWarehouses = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/warehouses?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse: FetchWarehouseApiResponse = await response.json();
      setWarehouses(apiResponse.data);
      setTotalWarehouses(apiResponse.total);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error('Failed to load warehouses. Please check your connection.');
      setWarehouses([]);
      setTotalWarehouses(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Warehouse ID',
      dataIndex: 'warehouseId',
      key: 'warehouseId',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 200,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record: WarehouseType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingWarehouse(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this warehouse?"
            onConfirm={() => handleDelete(record.warehouseId)}
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
        <Title level={2}>Warehouse Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Add Warehouse
        </Button>
      </div>
      
      <AntdTableWrapper
        columns={columns}
        dataSource={warehouses}
        loading={loading}
        rowKey="warehouseId"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalWarehouses,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} warehouses`,
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
      
      <CreateWarehouseModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingWarehouse(null);
        }}
        onSuccess={(warehouse) => {
          if (editingWarehouse) {
            // Update existing warehouse in the list
            setWarehouses(prev => prev.map(w => 
              w.warehouseId === warehouse.warehouseId ? warehouse : w
            ));
            setEditingWarehouse(null);
          } else {
            // Add new warehouse to the list
            setWarehouses(prev => [warehouse, ...(prev || [])]);
            setTotalWarehouses(prev => (prev || 0) + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingWarehouse}
        warehouseData={editingWarehouse}
      />
    </Card>
  );
};

export default Warehouse;
