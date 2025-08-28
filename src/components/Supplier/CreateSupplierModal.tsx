import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { SupplierType } from '../../types/supplier.types';

interface CreateSupplierModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (supplier: SupplierType) => void;
  editMode?: boolean;
  supplierData?: SupplierType | null;
}

const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  supplierData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && supplierData) {
      form.setFieldsValue(supplierData);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, supplierData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editMode && supplierData 
        ? `http://localhost:8000/suppliers/${supplierData.supplierId}`
        : 'http://localhost:8000/suppliers';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${editMode ? 'update' : 'create'} supplier`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        message.error(errorMessage);
        return;
      }

      const supplier: SupplierType = await response.json();
      message.success(`Supplier ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(supplier);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} supplier:`, error);
      message.error(error.message || `Failed to ${editMode ? 'update' : 'create'} supplier. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Supplier" : "Create New Supplier"}
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
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter supplier name' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter supplier name" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: 'Please enter supplier phone' }]}
        >
          <Input placeholder="Enter supplier phone" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please enter supplier email' }]}
        >
          <Input placeholder="Enter supplier email" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please enter supplier address' }]}
        >
          <Input.TextArea rows={3} placeholder="Enter supplier address" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSupplierModal;
