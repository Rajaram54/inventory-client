import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select, DatePicker } from 'antd';
import { StockMovementType } from '../../types/stockMovement.types';

const { Option } = Select;

interface CreateStockMovementModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (stockMovement: StockMovementType) => void;
  editMode?: boolean;
  stockMovementData?: StockMovementType | null;
}

const CreateStockMovementModal: React.FC<CreateStockMovementModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  stockMovementData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && stockMovementData) {
      form.setFieldsValue({
        ...stockMovementData,
        date: stockMovementData.date ? new Date(stockMovementData.date) : null,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, stockMovementData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editMode && stockMovementData
        ? `http://localhost:8000/stock-movements/${stockMovementData.movement_id}`
        : 'http://localhost:8000/stock-movements';

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          date: values.date ? values.date.format('YYYY-MM-DD') : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editMode ? 'update' : 'create'} stock movement`);
      }

      const stockMovement: StockMovementType = await response.json();
      message.success(`Stock movement ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(stockMovement);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} stock movement:`, error);
      message.error(`Failed to ${editMode ? 'update' : 'create'} stock movement. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Stock Movement" : "Create New Stock Movement"}
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
          label="Product ID"
          name="product_id"
          rules={[{ required: true, message: 'Please enter product ID' }]}
        >
          <Input type="number" placeholder="Enter product ID" />
        </Form.Item>

        <Form.Item
          label="Quantity"
          name="quantity"
          rules={[{ required: true, message: 'Please enter quantity' }]}
        >
          <Input type="number" placeholder="Enter quantity" />
        </Form.Item>

        <Form.Item
          label="Movement Type"
          name="movement_type"
          rules={[{ required: true, message: 'Please select movement type' }]}
        >
          <Select placeholder="Select movement type">
            <Option value="in">In</Option>
            <Option value="out">Out</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Warehouse ID"
          name="warehouse_id"
          rules={[{ required: true, message: 'Please enter warehouse ID' }]}
        >
          <Input type="number" placeholder="Enter warehouse ID" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateStockMovementModal;
