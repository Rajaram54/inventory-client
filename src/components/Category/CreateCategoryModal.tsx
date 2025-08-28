import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { CategoryType } from '../../types/category.types';

interface CreateCategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (category: CategoryType) => void;
  editMode?: boolean;
  categoryData?: CategoryType | null;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  categoryData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && categoryData) {
      form.setFieldsValue(categoryData);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, categoryData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editMode && categoryData 
        ? `http://localhost:8000/categories/${categoryData.categoryId}`
        : 'http://localhost:8000/categories';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${editMode ? 'update' : 'create'} category`;
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
        // Show the error message in alert and return early without throwing
        message.error(errorMessage);
        return;
      }

      const category: CategoryType = await response.json();
      message.success(`Category ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(category);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} category:`, error);
      message.error(error.message || `Failed to ${editMode ? 'update' : 'create'} category. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Category" : "Create New Category"}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {editMode ? 'Update' : 'Create'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Category Name"
          name="category_name"
          rules={[
            { required: true, message: 'Please enter category name' },
            { max: 100, message: 'Category name must be shorter than or equal to 100 characters' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter category name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter category description' }]}
        >
          <Input.TextArea rows={3} placeholder="Enter category description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCategoryModal;
