import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select, Switch } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { AttributeType } from '../../types/attribute.types';
import { useAppSelector } from '../../store/hooks.ts';

interface CreateAttributeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (attribute: AttributeType) => void;
  editMode?: boolean;
  attributeData?: AttributeType | null;
}

const CreateAttributeModal: React.FC<CreateAttributeModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  attributeData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const uoms = useAppSelector((state) => state.masterData.uoms);

  useEffect(() => {
    if (visible && attributeData) {
      form.setFieldsValue(attributeData);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, attributeData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editMode && attributeData
        ? `http://localhost:8000/attributes/${attributeData.id}`
        : 'http://localhost:8000/attributes';

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${editMode ? 'update' : 'create'} attribute`;
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

      const attribute: AttributeType = await response.json();
      message.success(`Attribute ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(attribute);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} attribute:`, error);
      message.error(error.message || `Failed to ${editMode ? 'update' : 'create'} attribute. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Attribute" : "Create New Attribute"}
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
          rules={[
            { required: true, message: 'Please enter attribute name' },
            { max: 100, message: 'Attribute name must be shorter than or equal to 100 characters' }
          ]}
        >
          <Input prefix={<TagOutlined />} placeholder="Enter attribute name" />
        </Form.Item>

        <Form.Item
          label="Code"
          name="code"
          rules={[
            { required: true, message: 'Please enter attribute code' },
            { max: 50, message: 'Attribute code must be shorter than or equal to 50 characters' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Code can only contain letters, numbers, and underscores' }
          ]}
        >
          <Input placeholder="Enter attribute code (unique identifier)" />
        </Form.Item>

        <Form.Item
          label="Data Type"
          name="dataType"
          rules={[{ required: true, message: 'Please select data type' }]}
        >
          <Select placeholder="Select data type">
            <Select.Option value="text">Text</Select.Option>
            <Select.Option value="number">Number</Select.Option>
            <Select.Option value="boolean">Boolean</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="UOM"
          name="uomId"
        >
          <Select placeholder="Select UOM (optional)" allowClear>
            {uoms.map((uom) => (
              <Select.Option key={uom.uomId} value={parseInt(uom.uomId)}>
                {uom.uomName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Multi Value"
          name="is_multi_value"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAttributeModal;
