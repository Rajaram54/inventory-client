import React from 'react';
import { Table, TableProps } from 'antd';

type AntdTableWrapperProps<RecordType extends object = any> = TableProps<RecordType> & {
  columns: TableProps<RecordType>['columns'];
  dataSource: TableProps<RecordType>['dataSource'];
};

/**
 * AntdTableWrapper
 * Generic wrapper for Ant Design Table with TypeScript support.
 * Pass any TableProps—for example pagination, rowSelection, loading, etc.
 */
function AntdTableWrapper<RecordType extends object = any>({
  columns,
  dataSource,
  pagination = { pageSize: 10 },
  rowSelection,
  ...rest
}: AntdTableWrapperProps<RecordType>) {
  return (
    <Table<RecordType>
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      rowSelection={rowSelection}
      rowKey={(record) => (record as any).id ?? (record as any).key}
      {...rest}
    />
  );
}

export default AntdTableWrapper;
