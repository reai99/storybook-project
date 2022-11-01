import React from 'react';
import { getDynamicColumns, getDynamicDataSource } from '../utils/utils';
import AntVirtualTable from '../components/AntVirtualTable';

export default {
  title: 'Components/AntVirtualTable',
  component: AntVirtualTable,
};

const DEFAULT_DATASOURCE = ['小明', '张三', '李四', '王五', '小红'].map((name, key) => {
  return {
    id: key,
    name,
    age: Math.floor(Math.random()* 10) * 3,
    sex: Math.random() > 0.5 ? '男' : '女',
    description: '这是一段描述，这是一段描述，这是一段描述，这是一段描述'
  }
})



const baseProps = {
  rowKey: 'id',
  dataSource: DEFAULT_DATASOURCE,
  scroll: { y: 300 },
  columns: [
    {
      dataIndex: "name",
      title: "名称",
      width: 130
    },
    {
      dataIndex: "age",
      title: "年龄",
      width: 100
    },
    {
      dataIndex: "sex",
      title: "性别",
      width: 80
    },
    {
      dataIndex: "description",
      title: "描述",
      width: 400
    }
  ],
  loading: false,
  headHeight: 36,
  rowHeight: 36,
  enableResize: false,
  enableSorting: false
}

const Table = (args) =>  <div style={{ width: "100%", margin: "0 auto" }}><AntVirtualTable {...args} /></div>;

export const 基础使用 = Table.bind({});
基础使用.args = {
  ...baseProps,
};

export const 表格固定列 = Table.bind({});
const fixedColumns = getDynamicColumns(40);
const fixedDataSource = getDynamicDataSource(100, 40);
表格固定列.args = {
  ...baseProps,
  columns: fixedColumns.map((v, index) => {
    if(index < 2)  return { ...v, fixed: 'left'};
    if(index > 38) return { ...v, fixed: 'right'};
    return v;
  }),
  dataSource: fixedDataSource,
};

export const 大数据量表格 = Table.bind({});
大数据量表格.args = {
  ...baseProps,
  columns: getDynamicColumns(50),
  dataSource: getDynamicDataSource(2000, 50),
};

