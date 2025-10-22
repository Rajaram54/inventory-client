import React, { useState, useEffect } from 'react';
import { Card, AutoComplete, Table, message } from 'antd';
import { ProductType } from '../../types/product.types';
import { WarehouseType } from '../../types/warehouse.types';

interface InventoryItem {
  inventory_id: number;
  product_id: number;
  warehouse_id: number | null;
  quantity_available: number;
  minimum_stock_level: number;
  maximum_stock_level: number;
  reorder_point: number;
  created_at: string;
  updated_at: string;
  product?: ProductType;
  warehouse?: WarehouseType;
}

const Inventory: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [filteredData, setFilteredData] = useState<InventoryItem[]>([]);
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Product Name',
      dataIndex: ['product', 'name'],
      key: 'productName',
    },
    {
      title: 'Warehouse',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouseName',
    },
    {
      title: 'Quantity Available',
      dataIndex: 'quantity_available',
      key: 'quantity_available',
    },
    {
      title: 'Minimum Stock Level',
      dataIndex: 'minimum_stock_level',
      key: 'minimum_stock_level',
    },
    {
      title: 'Maximum Stock Level',
      dataIndex: 'maximum_stock_level',
      key: 'maximum_stock_level',
    },
    {
      title: 'Reorder Point',
      dataIndex: 'reorder_point',
      key: 'reorder_point',
    },
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/inventory');
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      const inventory = data.data || data;
      setInventoryData(inventory);
      setFilteredData(inventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      message.error('Failed to load inventory data');
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
          value: product.productId.toString(),
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

  const handleSelectProduct = async (value: string) => {
    const productId = parseInt(value);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/inventory?product_id=${productId}`);
      if (!response.ok) throw new Error('Failed to fetch inventory for product');
      const data = await response.json();
      const inventory = data.data || data;
      setFilteredData(inventory);
    } catch (error) {
      console.error('Error fetching inventory for product:', error);
      message.error('Failed to load inventory data for selected product');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setFilteredData(inventoryData);
  };

  return (
    <Card>
      <AutoComplete
        options={productOptions}
        onSearch={handleSearchProduct}
        onSelect={handleSelectProduct}
        onClear={handleClearSearch}
        placeholder="Search for products..."
        style={{ width: '100%', marginBottom: 16 }}
        allowClear
      />
      <Table
        columns={columns}
        dataSource={filteredData.map((item, index) => ({ ...item, key: index }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default Inventory;
