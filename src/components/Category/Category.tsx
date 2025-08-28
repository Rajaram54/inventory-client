import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { CategoryType } from '../../types/category.types';
import CreateCategoryModal from './CreateCategoryModal.tsx';

const { Title } = Typography;

const Category: React.FC = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCategories, setTotalCategories] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);

  useEffect(() => {
    fetchCategories(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleDelete = async (categoryId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete category';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      message.success('Category deleted successfully!');
      fetchCategories(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error(error.message || 'Failed to delete category. Please try again.');
    }
  };

  const fetchCategories = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/categories?page=${page}&limit=${limit}`);
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse); // Debug log
      
      // Check if the response has the expected structure
      if (apiResponse && Array.isArray(apiResponse.data)) {
        setCategories(apiResponse.data);
        setTotalCategories(apiResponse.total || 0);
      } else if (Array.isArray(apiResponse)) {
        // Handle case where API returns array directly
        setCategories(apiResponse);
        setTotalCategories(apiResponse.length);
      } else {
        console.error('Unexpected API response structure:', apiResponse);
        setCategories([]);
        setTotalCategories(0);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error(error.message || 'Failed to load categories. Please check your connection.');
      setCategories([]);
      setTotalCategories(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'category_name',
      key: 'category_name',
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
      render: (_, record: CategoryType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingCategory(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.categoryId)}
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
        <Title level={2}>Category Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Add Category
        </Button>
      </div>
      
      <AntdTableWrapper
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey="categoryId"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCategories,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} categories`,
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
      
      <CreateCategoryModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingCategory(null);
        }}
        onSuccess={(category) => {
          if (editingCategory) {
            // Update existing category in the list
            setCategories(prev => prev.map(c => 
              c.categoryId === category.categoryId ? category : c
            ));
            setEditingCategory(null);
          } else {
            // Add new category to the list
            setCategories(prev => [category, ...(prev || [])]);
            setTotalCategories(prev => (prev || 0) + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingCategory}
        categoryData={editingCategory}
      />
    </Card>
  );
};

export default Category;
