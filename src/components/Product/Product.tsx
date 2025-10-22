import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { ProductType } from '../../types/product.types';
import CreateProductModal from './CreateProductModal.tsx';

const { Title } = Typography;

const Product: React.FC = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalProducts, setTotalProducts] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);

  useEffect(() => {
    fetchProducts(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleDelete = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      message.success('Product deleted successfully!');
      fetchProducts(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product. Please try again.');
    }
  };

  const fetchProducts = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/products?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json();
      setProducts(apiResponse.data);
      setTotalProducts(apiResponse.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to load products. Please check your connection.');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Category',
      dataIndex: ['category', 'category_name'],
      key: 'category',
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record: ProductType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingProduct(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.productId )}
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
        <Title level={2}>Product Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Add Product
        </Button>
      </div>
      
      <AntdTableWrapper
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="productId"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalProducts,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} products`,
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
      
      <CreateProductModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingProduct(null);
        }}
        onSuccess={(product) => {
          if (editingProduct) {
            // Update existing product in the list
            setProducts(prev => prev.map(p => 
              p.productId  === product.productId  ? product : p
            ));
            setEditingProduct(null);
          } else {
            // Add new product to the list
            setProducts(prev => [product, ...(prev || [])]);
            setTotalProducts(prev => (prev || 0) + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingProduct}
        productData={editingProduct}
      />
    </Card>
  );
};

export default Product;
