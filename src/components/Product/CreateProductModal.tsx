import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select } from 'antd';
import { ProductType } from '../../types/product.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { fetchCategories, fetchBrands, fetchSuppliers, fetchSubcategories, fetchUOMs } from '../../store/masterDataSlice.ts';

interface CreateProductModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (product: ProductType) => void;
  editMode?: boolean;
  productData?: ProductType | null;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editMode = false,
  productData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { categories, subcategories, uoms, loading: masterDataLoading } = useAppSelector(
    (state) => state.masterData
  );

  useEffect(() => {
    if (visible) {
      // Fetch master data when modal becomes visible
      dispatch(fetchCategories());
      dispatch(fetchBrands());
      dispatch(fetchSuppliers());
      dispatch(fetchUOMs());

      if (productData) {
        form.setFieldsValue(productData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, productData, form, dispatch]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        categoryId: Number(values.categoryId),
      };
      const url = editMode && productData 
        ? `http://localhost:8000/products/${productData.productId }`
        : 'http://localhost:8000/products';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editMode ? 'update' : 'create'} product`);
      }

      const product: ProductType = await response.json();
      message.success(`Product ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      onSuccess(product);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} product:`, error);
      message.error(`Failed to ${editMode ? 'update' : 'create'} product. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editMode ? "Edit Product" : "Create New Product"}
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
          label="Product Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter product name' },
            { max: 150, message: 'Product name must be shorter than or equal to 150 characters' }
          ]}
        >
          <Input placeholder="Enter product name" />
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
            onChange={(value) => {
              dispatch(fetchSubcategories(value));
              form.setFieldsValue({ subCategoryId: undefined });
            }}
          />
        </Form.Item>

        <Form.Item
          label="Subcategory"
          name="subCategoryId"
        >
          <Select
            placeholder="Select a subcategory"
            loading={masterDataLoading}
            disabled={!form.getFieldValue('categoryId')}
            options={subcategories.map(subcategory => ({
              value: subcategory.subCategoryId,
              label: subcategory.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Buying UOM"
          name="buyingUomId"
          rules={[{ required: true, message: 'Please select a Buying UOM' }]}
        >
          <Select
            placeholder="Select a Buying UOM"
            loading={masterDataLoading}
            options={uoms.map(uom => ({
              value: uom.uomId,
              label: uom.uomName,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Selling UOM"
          name="sellingUomId"
          rules={[{ required: true, message: 'Please select a Selling UOM' }]}
        >
          <Select
            placeholder="Select a Selling UOM"
            loading={masterDataLoading}
            options={uoms.map(uom => ({
              value: uom.uomId,
              label: uom.uomName,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea rows={3} placeholder="Enter product description" />
        </Form.Item>



        <Form.Item
          label="Image URL"
          name="image_url"
        >
          <Input placeholder="Enter image URL" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProductModal;
