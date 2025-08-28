import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { CustomerType } from '../../types/customer.types';

interface CreateCustomerModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (customer: CustomerType) => void;
  editMode?: boolean;
  customerData?: CustomerType | null;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  customerData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && customerData) {
      form.setFieldsValue(customerData);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, customerData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editMode && customerData 
        ? `http://localhost:8000/customers/${customerData.customer_id}`
        : 'http://localhost:8000/customers';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editMode ? 'update' : 'create'} customer`);
      }

      const customer: CustomerType = await response.json();
      message.success(`Customer ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(customer);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} customer:`, error);
      message.error(`Failed to ${editMode ? 'update' : 'create'} customer. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Customer" : "Create New Customer"}
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
          rules={[{ required: true, message: 'Please enter customer name' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter customer name" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: 'Please enter phone number' },
            { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' }
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please enter address' }]}
        >
          <Input.TextArea rows={3} placeholder="Enter address" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCustomerModal;
