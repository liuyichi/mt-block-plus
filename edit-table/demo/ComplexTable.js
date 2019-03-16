import React from 'react';
import EditTable from '../EditTable';
import M from 'mtf.utils';
import model from './model/complexTableModel.json';

const mockValue = [
  {
    "assetLabel": "1RD0993845",
    "category": "电脑",
    "brand": "三星",
  },
  {
    "assetLabel": "1RD0993846",
    "category": "鼠标",
    "brand": "戴尔",
  }
];


class ComplexTable extends M.BaseComponent{
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    M.mergeModel(model, {
      'buttons.save.action': (table) => {
        console.log('向后端发送数据：' , table.getSelection());
      }
    });
    this.editTableRef.setModel(model);
  }
  render() {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({ selectedRows });
      },
      onSelect: (row, selected, selectedRows) => {
        console.log(row, selected, selectedRows);
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        console.log(selected, selectedRows, changeRows);
      },
    };
    return (
      <div>
        <EditTable
          ref={r => this.editTableRef = r}
          value={mockValue}
          rowSelection={true}
          pagination={{
            current: 1,
            total: 40,
            pageSize: 2,
          }}
          model={model}/>
      </div>
    );
  }
}

export default <ComplexTable />;