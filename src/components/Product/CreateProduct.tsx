import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Space, Row, Col, message, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProductType } from '../../types/product.types';
import { useAppSelector } from '../../store/hooks.ts';
import ProductBasicInfo from './ProductBasicInfo.tsx';
import ProductAttributes from './ProductAttributes.tsx';
// import ProductSupplier from './ProductSupplier.tsx';

const CreateProduct: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [requiredAttributes, setRequiredAttributes] = useState<string[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [basicInfoSubmitted, setBasicInfoSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { uoms } = useAppSelector((state) => state.masterData);

  const editMode = !!location.state?.product;
  const productData = location.state?.product as ProductType | null;

  const getRequiredAttributesByUOM = (uomType: string) => {
    switch (uomType.toLowerCase()) {
      case 'litre':
      case 'ml':
        return ['volume'];
      case 'm':
      case 'cm':
      case 'ft':
        return ['length', 'thickness'];
      case 'm2':
        return ['length', 'breadth'];
      case 'box':
      case 'units':
      case 'kg':
      case 'g':
        return ['length', 'breadth', 'height', 'weight'];
      default:
        return [];
    }
  };

  useEffect(() => {
    // Fetch suppliers for step 2
    // Note: Other data fetching is handled in step components

    if (productData) {
      form.setFieldsValue(productData);
    } else {
      form.resetFields();
    }
  }, [productData, form]);

  const handleNext = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      // Submit basic info to create product and get productId
      const values = form.getFieldsValue();
      const payload = {
        name: values.name,
        categoryId: Number(values.categoryId),
        subCategoryId: values.subCategoryId,
        brandId: values.brandId,
        buyingUomId: values.buyingUomId,
        sellingUomId: values.sellingUomId,
        description: values.description,
        reorderPoint: values.reorderPoint,
        // Note: attributes and supplierId will be added later
      };

      console.log('Basic Info Payload:', payload);

      // Use a dummy URL for now
      const url = 'https://jsonplaceholder.typicode.com/posts';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create product basic info');
      }

      const data = await response.json();
      setProductId(data.id); // Assuming the response has id
      setBasicInfoSubmitted(true);

      // Set required attributes based on UOM
      const sellingUomId = form.getFieldValue('sellingUomId');
      const selectedUom = uoms.find(uom => uom.uomId === sellingUomId);
      const attributes = selectedUom ? getRequiredAttributesByUOM(selectedUom.uomName) : [];
      setRequiredAttributes(attributes);

      message.success('Basic info submitted successfully. You can now add attributes.');
    } catch (error) {
      console.error('Error submitting basic info:', error);
      message.error('Failed to submit basic info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Build attributes object with dynamic attributes
      const attributes: any = {};
      requiredAttributes.forEach((attr: string) => {
        attributes[attr] = values[attr];
      });
      if (values.attributes) {
        attributes.additional = values.attributes;
      }

      // Consistent payload structure for API
      const payload = {
        name: values.name,
        categoryId: Number(values.categoryId),
        subCategoryId: values.subCategoryId,
        brandId: values.brandId,
        buyingUomId: values.buyingUomId,
        sellingUomId: values.sellingUomId,
        description: values.description,
        reorderPoint: values.reorderPoint,
        supplierId: values.supplierId,
        attributes: attributes,
        // Note: fileList is not included in payload as it's handled separately
      };

      console.log('API Payload:', payload); // Log the payload for verification

      // Use a dummy URL for now
      const url = 'https://jsonplaceholder.typicode.com/posts';
      const method = 'POST';

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

      message.success(`Product ${editMode ? 'updated' : 'created'} successfully!`);
      form.resetFields();
      setFileList([]);
      navigate('/product');
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} product:`, error);
      message.error(`Failed to ${editMode ? 'update' : 'create'} product. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: 'Basic Info',
      children: (
        <ProductBasicInfo
          form={form}
          onNext={handleNext}
          onCancel={() => navigate('/product')}
          fileList={fileList}
          setFileList={setFileList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      ),
    },
    {
      key: '2',
      label: 'Attributes',
      disabled: !basicInfoSubmitted || !productId,
      children: (
        <ProductAttributes
          form={form}
          onSubmit={handleSubmit}
          requiredAttributes={requiredAttributes}
          loading={loading}
        />
      ),
    },
    // {
    //   key: '3',
    //   label: 'Supplier',
    //   children: (
    //     <ProductSupplier
    //       form={form}
    //       onSubmit={handleSubmit}
    //       requiredAttributes={requiredAttributes}
    //     />
    //   ),
    // },
  ];

  return (
    <Card
      title={
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/product')}
              />
              {editMode ? "Edit Product" : "Create New Product"}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button onClick={() => navigate('/product')}>
                Cancel
              </Button>
              <Button type="primary" onClick={() => form.submit()} loading={loading}>
                Create
              </Button>
            </Space>
          </Col>
        </Row>
      }
    >
      <Tabs
        defaultActiveKey="1"
        items={tabItems}
      />
    </Card>
  );
};

export default CreateProduct;
