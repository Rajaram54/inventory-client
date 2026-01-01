import React from 'react';
import { Form, Input, Row, Col } from 'antd';

interface ProductAttributesProps {
  form: any;
  onSubmit: (values: any) => void;
  requiredAttributes: string[];
  loading: boolean;
}

const ProductAttributes: React.FC<ProductAttributesProps> = ({
  form,
  onSubmit,
  requiredAttributes,
  loading,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} xxl={8}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Attributes</div>
            {requiredAttributes.map((attribute) => (
              <Form.Item
                key={attribute}
                label={attribute.charAt(0).toUpperCase() + attribute.slice(1)}
                name={attribute}
                rules={[{ required: true, message: `Please enter ${attribute}` }]}
              >
                <Input placeholder={`Enter ${attribute}`} />
              </Form.Item>
            ))}

            <Form.Item
              label="Additional Attributes"
              name="attributes"
            >
              <Input.TextArea rows={4} placeholder="Enter additional product attributes (e.g., color, size, material)" />
            </Form.Item>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default ProductAttributes;
