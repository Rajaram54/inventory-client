import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { BrandType } from '../../types/brand.types';

interface CreateBrandModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (brand: BrandType) => void;
  editMode?: boolean;
  brandData?: BrandType | null;
}

const CreateBrandModal: React.FC<CreateBrandModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  brandData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && brandData) {
      form.setFieldsValue(brandData);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, brandData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editMode && brandData 
        ? `http://localhost:8000/brands/${brandData.brandId}`
        : 'http://localhost:8000/brands';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${editMode ? 'update' : 'create'} brand`;
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

      const brand: BrandType = await response.json();
      message.success(`Brand ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(brand);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} brand:`, error);
      message.error(error.message || `Failed to ${editMode ? 'update' : 'create'} brand. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Brand" : "Create New Brand"}
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
          label="Brand Name"
          name="brandName"
          rules={[
            { required: true, message: 'Please enter brand name' },
            { max: 100, message: 'Brand name must be shorter than or equal to 100 characters' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter brand name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter brand description' }]}
        >
          <Input.TextArea rows={3} placeholder="Enter brand description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateBrandModal;
