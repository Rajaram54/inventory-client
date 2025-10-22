import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { SubcategoryType } from '../../types/subcategory.types';
import CreateSubcategoryModal from './CreateSubcategoryModal.tsx';

const { Title } = Typography;

const Subcategory: React.FC = () => {
  const [subcategories, setSubcategories] = useState<SubcategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalSubcategories, setTotalSubcategories] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryType | null>(null);

  useEffect(() => {
    fetchSubcategories(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleDelete = async (subCategoryId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/subcategories/${subCategoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete subcategory';
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

      message.success('Subcategory deleted successfully!');
      fetchSubcategories(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      message.error(error.message || 'Failed to delete subcategory. Please try again.');
    }
  };

  const fetchSubcategories = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/subcategories?page=${page}&limit=${limit}`);
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
        setSubcategories(apiResponse.data);
        setTotalSubcategories(apiResponse.total || 0);
      } else if (Array.isArray(apiResponse)) {
        // Handle case where API returns array directly
        setSubcategories(apiResponse);
        setTotalSubcategories(apiResponse.length);
      } else {
        console.error('Unexpected API response structure:', apiResponse);
        setSubcategories([]);
        setTotalSubcategories(0);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      message.error(error.message || 'Failed to load subcategories. Please check your connection.');
      setSubcategories([]);
      setTotalSubcategories(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'subCategoryId',
      key: 'subCategoryId',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Category ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 100,
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
      render: (_, record: SubcategoryType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingSubcategory(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this subcategory?"
            onConfirm={() => handleDelete(record.subCategoryId)}
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
        <Title level={2}>Subcategory Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Add Subcategory
        </Button>
      </div>
      
      <AntdTableWrapper
        columns={columns}
        dataSource={subcategories}
        loading={loading}
        rowKey="subCategoryId"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalSubcategories,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} subcategories`,
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
      
      <CreateSubcategoryModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingSubcategory(null);
        }}
        onSuccess={(subcategory) => {
          if (editingSubcategory) {
            // Update existing subcategory in the list
            setSubcategories(prev => prev.map(c => 
              c.subCategoryId === subcategory.subCategoryId ? subcategory : c
            ));
            setEditingSubcategory(null);
          } else {
            // Add new subcategory to the list
            setSubcategories(prev => [subcategory, ...(prev || [])]);
            setTotalSubcategories(prev => (prev || 0) + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingSubcategory}
        subcategoryData={editingSubcategory}
      />
    </Card>
  );
};

export default Subcategory;
