import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { WarehouseType } from '../../types/warehouse.types';

interface CreateWarehouseModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (warehouse: WarehouseType) => void;
  editMode?: boolean;
  warehouseData?: WarehouseType | null;
}

const CreateWarehouseModal: React.FC<CreateWarehouseModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  warehouseData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && warehouseData) {
      form.setFieldsValue(warehouseData);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, warehouseData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editMode && warehouseData 
        ? `http://localhost:8000/warehouses/${warehouseData.warehouseId}`
        : 'http://localhost:8000/warehouses';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${editMode ? 'update' : 'create'} warehouse`;
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

      const warehouse: WarehouseType = await response.json();
      message.success(`Warehouse ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(warehouse);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} warehouse:`, error);
      message.error(error.message || `Failed to ${editMode ? 'update' : 'create'} warehouse. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Warehouse" : "Create New Warehouse"}
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
          rules={[{ required: true, message: 'Please enter warehouse name' }]}
        >
          <Input placeholder="Enter warehouse name" />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please enter warehouse location' }]}
        >
          <Input.TextArea rows={3} placeholder="Enter warehouse location" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateWarehouseModal;
