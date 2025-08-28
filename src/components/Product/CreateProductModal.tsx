import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, InputNumber, Select } from 'antd';
import { ProductType } from '../../types/product.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { fetchCategories, fetchBrands, fetchSuppliers } from '../../store/masterDataSlice.ts';

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
  const { categories, brands, suppliers, loading: masterDataLoading } = useAppSelector(
    (state) => state.masterData
  );

  useEffect(() => {
    if (visible) {
      // Fetch master data when modal becomes visible
      dispatch(fetchCategories());
      dispatch(fetchBrands());
      dispatch(fetchSuppliers());
      
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
      const url = editMode && productData 
        ? `http://localhost:8000/products/${productData.productId }`
        : 'http://localhost:8000/products';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
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
          />
        </Form.Item>

        <Form.Item
          label="Brand"
          name="brandId"
          rules={[{ required: true, message: 'Please select a brand' }]}
        >
          <Select
            placeholder="Select a brand"
            loading={masterDataLoading}
            options={brands.map(brand => ({
              value: brand.brandId,
              label: brand.brandName,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Supplier"
          name="supplierId"
          rules={[{ required: true, message: 'Please select a supplier' }]}
        >
          <Select
            placeholder="Select a supplier"
            loading={masterDataLoading}
            options={suppliers.map(supplier => ({
              value: supplier.supplierId,
              label: supplier.name,
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
          label="Price"
          name="price"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={0.01}
            precision={2}
            placeholder="Enter price"
          />
        </Form.Item>

        <Form.Item
          label="SKU"
          name="sku"
          rules={[{ required: true, message: 'Please enter SKU' }]}
        >
          <Input placeholder="Enter SKU" />
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
