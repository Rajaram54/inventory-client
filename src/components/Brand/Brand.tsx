import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { BrandType, FetchBrandApiResponse } from '../../types/brand.types';
import CreateBrandModal from './CreateBrandModal.tsx';

const { Title } = Typography;

const Brand: React.FC = () => {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBrands, setTotalBrands] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandType | null>(null);

  useEffect(() => {
    fetchBrands(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleDelete = async (brandId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/brands/${brandId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      message.success('Brand deleted successfully!');
      fetchBrands(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting brand:', error);
      message.error('Failed to delete brand. Please try again.');
    }
  };

  const fetchBrands = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/brands?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse: FetchBrandApiResponse = await response.json();
      setBrands(apiResponse.data);
      setTotalBrands(apiResponse.total);
    } catch (error) {
      console.error('Error fetching brands:', error);
      message.error('Failed to load brands. Please check your connection.');
      setBrands([]);
      setTotalBrands(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'brandId',
      key: 'brandId',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'brandName',
      key: 'brandName',
      width: 150,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record: BrandType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingBrand(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this brand?"
            onConfirm={() => handleDelete(record.brandId)}
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
        <Title level={2}>Brand Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Add Brand
        </Button>
      </div>
      
      <AntdTableWrapper
        columns={columns}
        dataSource={brands}
        loading={loading}
        rowKey="brandId"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalBrands,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} brands`,
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
      
      <CreateBrandModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingBrand(null);
        }}
        onSuccess={(brand) => {
          if (editingBrand) {
            // Update existing brand in the list
            setBrands(prev => prev.map(b => 
              b.brandId === brand.brandId ? brand : b
            ));
            setEditingBrand(null);
          } else {
            // Add new brand to the list
            setBrands(prev => [brand, ...(prev || [])]);
            setTotalBrands(prev => (prev || 0) + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingBrand}
        brandData={editingBrand}
      />
    </Card>
  );
};

export default Brand;
