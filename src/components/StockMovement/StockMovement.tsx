import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { StockMovementType, FetchStockMovementApiResponse } from '../../types/stockMovement.types';
import CreateStockMovementModal from './CreateStockMovementModal.tsx';

const { Title } = Typography;

const StockMovement: React.FC = () => {
  const [stockMovements, setStockMovements] = useState<StockMovementType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalStockMovements, setTotalStockMovements] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingStockMovement, setEditingStockMovement] = useState<StockMovementType | null>(null);

  useEffect(() => {
    fetchStockMovements(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleDelete = async (movementId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/stock-movements/${movementId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete stock movement');
      }

      message.success('Stock movement deleted successfully!');
      fetchStockMovements(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting stock movement:', error);
      message.error('Failed to delete stock movement. Please try again.');
    }
  };

  const fetchStockMovements = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/stock-movements?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse: FetchStockMovementApiResponse = await response.json();

      setStockMovements(apiResponse.data);
      setTotalStockMovements(apiResponse.total);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      message.error('Failed to load stock movements. Please check your connection.');
      setStockMovements([]);
      setTotalStockMovements(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'movement_id',
      key: 'movement_id',
      width: 80,
    },
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 100,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Movement Type',
      dataIndex: 'movement_type',
      key: 'movement_type',
      width: 120,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 150,
    },
    {
      title: 'Warehouse ID',
      dataIndex: 'warehouse_id',
      key: 'warehouse_id',
      width: 120,
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
      render: (_, record: StockMovementType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingStockMovement(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this stock movement?"
            onConfirm={() => handleDelete(record.movement_id)}
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
        <Title level={2}>Stock Movement Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Add Stock Movement
        </Button>
      </div>

      <AntdTableWrapper
        columns={columns}
        dataSource={stockMovements}
        loading={loading}
        rowKey="movement_id"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalStockMovements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} stock movements`,
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

      <CreateStockMovementModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingStockMovement(null);
        }}
        onSuccess={(stockMovement) => {
          if (editingStockMovement) {
            // Update existing stock movement in the list
            setStockMovements(prev => prev.map(sm =>
              sm.movement_id === stockMovement.movement_id ? stockMovement : sm
            ));
            setEditingStockMovement(null);
          } else {
            // Add new stock movement to the list
            setStockMovements(prev => [stockMovement, ...prev]);
            setTotalStockMovements(prev => prev + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingStockMovement}
        stockMovementData={editingStockMovement}
      />
    </Card>
  );
};

export default StockMovement;
