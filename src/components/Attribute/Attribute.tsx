import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntdTableWrapper from '../wrappers/antdTableWrapper.tsx';
import { AttributeType, FetchAttributeApiResponse } from '../../types/attribute.types';
import { useAppSelector, useAppDispatch } from '../../store/hooks.ts';
import { fetchUOMs } from '../../store/masterDataSlice.ts';
import CreateAttributeModal from './CreateAttributeModal.tsx';

const { Title } = Typography;

const Attribute: React.FC = () => {
  const [attributes, setAttributes] = useState<AttributeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalAttributes, setTotalAttributes] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeType | null>(null);

  const dispatch = useAppDispatch();
  const uoms = useAppSelector((state) => state.masterData.uoms);

  useEffect(() => {
    // Fetch master data when component mounts
    dispatch(fetchUOMs());
    fetchAttributes(currentPage, pageSize);
  }, [dispatch, currentPage, pageSize]);

  const handleDelete = async (attributeId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/attributes/${attributeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete attribute');
      }

      message.success('Attribute deleted successfully!');
      fetchAttributes(currentPage, pageSize); // Refresh the table
    } catch (error) {
      console.error('Error deleting attribute:', error);
      message.error('Failed to delete attribute. Please try again.');
    }
  };

  const fetchAttributes = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/attributes?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse: FetchAttributeApiResponse = await response.json();
      setAttributes(apiResponse.data);
      setTotalAttributes(apiResponse.total);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      message.error('Failed to load attributes. Please check your connection.');
      setAttributes([]);
      setTotalAttributes(0);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Data Type',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
      render: (dataType: string) => dataType.charAt(0).toUpperCase() + dataType.slice(1),
    },
    {
      title: 'UOM',
      dataIndex: 'uomId',
      key: 'uomId',
      width: 100,
      render: (uomId: number) => {
        const uom = uoms.find(u => u.uomId === uomId?.toString());
        return uom ? uom.uomName : 'N/A';
      },
    },
    {
      title: 'Multi Value',
      dataIndex: 'is_multi_value',
      key: 'is_multi_value',
      width: 100,
      render: (isMultiValue: boolean) => isMultiValue ? 'Yes' : 'No',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: AttributeType) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingAttribute(record);
              setCreateModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this attribute?"
            onConfirm={() => handleDelete(record.id)}
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
        <Title level={2}>Attribute Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Add Attribute
        </Button>
      </div>

      <AntdTableWrapper
        columns={columns}
        dataSource={attributes}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalAttributes,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} attributes`,
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

      <CreateAttributeModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditingAttribute(null);
        }}
        onSuccess={(attribute: AttributeType) => {
          if (editingAttribute) {
            // Update existing attribute in the list
            setAttributes(prev => prev.map(a =>
              a.id === attribute.id ? attribute : a
            ));
            setEditingAttribute(null);
          } else {
            // Add new attribute to the list
            setAttributes(prev => [attribute, ...(prev || [])]);
            setTotalAttributes(prev => (prev || 0) + 1);
          }
          setCreateModalVisible(false);
        }}
        editMode={!!editingAttribute}
        attributeData={editingAttribute}
      />
    </Card>
  );
};

export default Attribute;
