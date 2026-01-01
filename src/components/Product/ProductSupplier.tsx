import React, { useEffect } from 'react';
import { Form, Row, Col, Select } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSuppliers } from '../../store/masterDataSlice';

interface ProductSupplierProps {
  form: any;
  onSubmit: (values: any) => void;
  requiredAttributes: string[];
}

const ProductSupplier: React.FC<ProductSupplierProps> = ({
  form,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const { suppliers, loading: masterDataLoading } = useAppSelector(
    (state) => state.masterData
  );

  useEffect(() => {
    // Fetch suppliers when component mounts
    dispatch(fetchSuppliers());
  }, [dispatch]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} xxl={8}>
          <Form.Item
            label="Supplier"
            name="supplierId"
            rules={[{ required: true, message: 'Please select a supplier' }]}
          >
            <Select
              showSearch
              placeholder="Search and select a supplier"
              loading={masterDataLoading}
              options={suppliers.map(supplier => ({
                value: supplier.supplierId,
                label: supplier.name,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ProductSupplier;
