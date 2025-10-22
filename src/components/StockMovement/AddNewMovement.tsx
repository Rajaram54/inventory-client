import React, { useState, useEffect } from 'react';
import { Card, Form, Button, message, Select, DatePicker, Col, Typography, Row, Modal, InputNumber, AutoComplete, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SupplierType } from '../../types/supplier.types';


const { Option } = Select;

const AddNewMovement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);

  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([]);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Quantity Ordered',
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
  ];

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('http://localhost:8000/suppliers');
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        const data = await response.json();
        setSuppliers(data.data || data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId: Number(values.supplierId),
          orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : null,
          deliveryDate: values.deliveryDate ? values.deliveryDate.format('YYYY-MM-DD') : null,
          products: savedProducts.map(product => ({
            productId: Number.parseInt(product.productId),
            quantityOrdered: product.quantityOrdered,
            price: product.price,
          })),
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create purchase order`);
      }

      await response.json();
      message.success('Purchase order created successfully!');
      form.resetFields();
      setSavedProducts([]);
      navigate('/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      message.error('Failed to create purchase order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProduct = async (query: string) => {
    if (query.length >= 2) {
      try {
        const response = await fetch(`http://localhost:8000/products/autocomplete?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch product suggestions');
        const data = await response.json();
        const options = data.map((product: any) => ({
          value: product.productId,
          label: product.name,
        }));
        setProductOptions(options);
      } catch (error) {
        console.error('Error fetching product suggestions:', error);
      }
    } else {
      setProductOptions([]);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row>
        <Col xs={24} sm={12} md={8} lg={8} xl={8} xxl={8}>
          
            <Form.Item
              label="Supplier"
              name="supplierId"
              rules={[{ required: true, message: 'Please select a supplier' }]}
            >
              <Select
                showSearch
                placeholder="Search and select supplier"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => {
                  const supplier = suppliers.find(s => s.supplierId === value);
                  setSelectedSupplier(supplier || null);
                }}
              >
                {suppliers.map((supplier) => (
                  <Option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {selectedSupplier && (
              <div>
                <Typography.Title level={5}>Supplier Details</Typography.Title>
                <p><strong>Address:</strong> {selectedSupplier.address}</p>
                <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
              </div>
            )}
         
        <Form.Item
          label="Order Date"
          name="orderDate"
          rules={[{ required: true, message: 'Please select order date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="Delivery Date"
          name="deliveryDate"
          rules={[{ required: true, message: 'Please select delivery date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
         </Col>
         <Col xs={24} sm={11} md={15} lg={15} xl={15} xxl={15}>
           <Button type="primary" style={{ marginRight: 0, float: 'right' }} onClick={() => setIsModalVisible(true)}>Add Products</Button>
         </Col>
        </Row>
        {savedProducts.length > 0 && (
          <Table
            columns={columns}
            dataSource={savedProducts.map((product, index) => ({ ...product, key: index }))}
            pagination={false}
            style={{ marginTop: 16 }}
          />
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} disabled={savedProducts.length === 0} style={{ marginRight: 8 }}>
            Create Purchase Order
          </Button>
          <Button onClick={() => navigate('/purchase-orders')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Add Products"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="add" style={{ backgroundColor: 'green', borderColor: 'green' }} onClick={() => {
            const currentProducts = modalForm.getFieldValue('products') || [];
            modalForm.setFieldsValue({ products: [...currentProducts, {}] });
          }}>
            Add New Row
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            modalForm.validateFields().then((values) => {
              console.log('Saved products:', values);
              const productsWithNames = values.products.map((product: any) => {
                const option = productOptions.find(opt => opt.value === product.productId);
                return {
                  ...product,
                  productName: option ? option.label : product.productId,
                };
              });
              setSavedProducts(prev => [...prev, ...productsWithNames]);
              modalForm.resetFields();
              setIsModalVisible(false);
            });
          }}>
            Save
          </Button>,
        ]}
      >
        <Form form={modalForm} layout="vertical" initialValues={{ products: [{}] }}>
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ marginBottom: 16, border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
                    <Form.Item {...restField} label="Search Product" name={[name, 'productId']}>
                      <AutoComplete
                        options={productOptions}
                        onSearch={handleSearchProduct}
                        placeholder="Search for products..."
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item {...restField} label="Quantity Ordered" name={[name, 'quantityOrdered']} rules={[{ required: true, message: 'Please enter quantity' }]}>
                      <InputNumber placeholder="Enter quantity" style={{ width: '100%' }} min={1} />
                    </Form.Item>
                    <Form.Item {...restField} label="Price" name={[name, 'price']} rules={[{ required: true, message: 'Please enter price' }]}>
                      <InputNumber placeholder="Enter price" style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button type="link" onClick={() => remove(name)} style={{ color: 'red' }}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
};

export default AddNewMovement;
