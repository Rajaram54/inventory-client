import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { SubcategoryType } from '../../types/subcategory.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { fetchCategories } from '../../store/masterDataSlice.ts';

interface CreateSubcategoryModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (subcategory: SubcategoryType) => void;
  editMode?: boolean;
  subcategoryData?: SubcategoryType | null;
}

const CreateSubcategoryModal: React.FC<CreateSubcategoryModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  subcategoryData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { categories, loading: masterDataLoading } = useAppSelector(
    (state) => state.masterData
  );

  useEffect(() => {
    if (visible) {
      // Fetch master data when modal becomes visible
      dispatch(fetchCategories());
      
      if (subcategoryData) {
        form.setFieldsValue(subcategoryData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, subcategoryData, form, dispatch]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
        ...values,
        categoryId: Number(values.categoryId)
    }
    try {
      const url = editMode && subcategoryData 
        ? `http://localhost:8000/subcategories/${subcategoryData.subCategoryId}`
        : 'http://localhost:8000/subcategories';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${editMode ? 'update' : 'create'} subcategory`;
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

      const subcategory: SubcategoryType = await response.json();
      message.success(`Subcategory ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(subcategory);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} subcategory:`, error);
      message.error(error.message || `Failed to ${editMode ? 'update' : 'create'} subcategory. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Subcategory" : "Create New Subcategory"}
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
          label="Subcategory Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter subcategory name' },
            { max: 100, message: 'Subcategory name must be shorter than or equal to 100 characters' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter subcategory name" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="categoryId"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select
            placeholder="Select a category"
            loading={masterDataLoading}
            options={categories.map(category => ({
              value: category.categoryId,
              label: category.category_name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter subcategory description' }]}
        >
          <Input.TextArea rows={3} placeholder="Enter subcategory description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSubcategoryModal;
