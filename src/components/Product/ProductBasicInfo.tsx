import React, { useEffect } from 'react';
import { Form, Input, InputNumber, message, Select, Row, Col, Upload, Carousel, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { fetchCategories, fetchBrands, fetchSubcategories, fetchUOMs } from '../../store/masterDataSlice.ts';

interface ProductBasicInfoProps {
  form: any;
  onNext: () => void;
  onCancel: () => void;
  fileList: any[];
  setFileList: (files: any[]) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
}

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  form,
  onNext,
  onCancel,
  fileList,
  setFileList,
  errorMessage,
  setErrorMessage,
}) => {
  const dispatch = useAppDispatch();
  const { categories, subcategories, uoms, brands, loading: masterDataLoading } = useAppSelector(
    (state) => state.masterData
  );

  useEffect(() => {
    // Fetch master data when component mounts
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchUOMs());
  }, [dispatch]);

  const handleUploadChange = ({ fileList }: any) => {
    // Validate file types
    const invalidFiles = fileList.filter((file: any) => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setErrorMessage('Only image files are allowed!');
      // Remove invalid files from the list
      const validFiles = fileList.filter((file: any) => file.type.startsWith('image/'));
      setFileList(validFiles);
      return;
    }

    if (fileList.length > 6) {
      setErrorMessage('You can upload a maximum of 6 images only');
      return;
    }
    setErrorMessage('');
    setFileList(fileList);
  };

  const handleRemove = (file: any) => {
    setFileList(fileList.filter(f => f.uid !== file.uid));
  };

  const handleNameBlur = async () => {
    const name = form.getFieldValue('name');
    if (!name || name.trim() === '') return;
    try {
      const response = await fetch(`http://localhost:8000/products/exist?name=${encodeURIComponent(name)}`);
      if (response.ok) {
        message.error('Product already exists!');
        setErrorMessage('Product already exists!');
      }
    } catch (error) {
      console.error('Error checking product existence:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onNext}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} xxl={8}>
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter product name' },
              { max: 150, message: 'Product name must be shorter than or equal to 150 characters' }
            ]}
          >
            <Input placeholder="Enter product name" onBlur={handleNameBlur} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Form.Item
            label="Brand"
            name="brandId"
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

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item
            label="Reorder Point"
            name="reorderPoint"
            rules={[
              { type: 'number', min: 0, message: 'Reorder point must be a positive number' }
            ]}
          >
            <InputNumber
              placeholder="Enter reorder point"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} xxl={8}>
          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
              style={{ marginBottom: '16px' }}
            />
          )}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Attach Product Images</div>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              onRemove={handleRemove}
              beforeUpload={(file) => {
                if (!file.type.startsWith('image/')) {
                  message.error('Only image files are allowed!');
                  return false;
                }
                if (fileList.length > 6) {
                  message.error('You can upload a maximum of 6 images only');
                  return false;
                }
                return false;
              }}
              accept="image/*"
              multiple
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </div>
          {fileList.length > 0 && (
            <Carousel autoplay>
              {fileList.map((file, index) => (
                <div key={index}>
                  <img
                    src={URL.createObjectURL(file.originFileObj)}
                    alt={`Product ${index + 1}`}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </Carousel>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default ProductBasicInfo;
