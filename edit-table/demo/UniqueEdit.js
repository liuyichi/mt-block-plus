/**
 * Created by shaohuanxia on 2017/9/17.
 */
import React from 'react';
import EditTable from '../EditTable';
import M from 'mtf.utils';
import { Dialog, Button, Input } from 'mtf.block';
import model from './model/uniqueEditModel.json';

const mockEffectiveStatusIndex = [
  {"id": 1, "name": "有效"},
  {"id": 2, "name": "无效"}
];
const mockInitTableValue = [
  {
    "triggerCode": "RET",
    "triggerMemo": "重新入职",
    "effectiveStatusIndex": 1,
    "effectiveStatusIndexName": "有效"
  },
  {
    "triggerCode": "ENTRY",
    "triggerMemo": "入职",
    "effectiveStatusIndex": 1,
    "effectiveStatusIndexName": "有效",
    'isSave': 1,
    'applied_flag': 'Y'
  }
];

const mockRefreshTableValue = [
  {
    "triggerCode": "lll",
    "triggerMemo": "shui",
    "effectiveStatusIndex": 1,
    "effectiveStatusIndexName": "有效"
  }
];

class UniqueEdit extends M.BaseComponent{
  constructor(props){
    super(props);
    Object.assign(this.state, {
      value: mockInitTableValue
    });
    M.mergeModel(model, {
      "buttons": {
        "add.action": (table, row, index) => {
          table.setBtnDisabled(['add']);
          table.setColumnMode("triggerCode", "default");
          let value = table.getValue();
          value.unshift({"effectiveStatusIndex": 1, "effectiveStatusIndexName": "有效"});
          table.setValue(value, [0]);

          // table.hideHeadBtn(["add"]);

        },
        "save.action": (table, row, index) => {
          if(table.validate(row)){
            table.setBtnEnable(['add']);
            table.setRowMode(row, "view");
            console.log("取出该行数据发给后端");
            console.log(table.getValue());
            console.log(table.getValue()[index]);
            // table.showHeadBtn(["add"]);
            // table.setValue(mockRefreshTableValue); 模拟重新刷数据
            // this.setState({value: mockRefreshTableValue})  useless
          }
        },
        "cancel.action": (table, row, index) => {
          table.setBtnEnable(["add"]);
          table.resetRow(row);
          table.setRowMode(row, "view");
          //  table.showHeadBtn(["add"]);
        },
        "edit.action": (table, row, index) => {
          table.setBtnDisabled(["add"]);
          //   table.hideHeadBtn(["add"]);
          let editingRows = table.getEditingRows();
          if(table.isChanged()){
            Dialog.confirm({
              title: "保存警告",
              content: "您修改了数据尚未保存，确定要继续操作吗？",
              onOk: (close) => {
                (table.getEditingRows()).forEach( x => {
                  table.resetRow(x);
                  table.setRowMode(x, "view");
                } );
                table.setRowMode(row, "edit");
                table.setColumnMode("triggerCode", "view");
                close();
              }
            })
          }else{
            table.setColumnMode("triggerCode", "view");
            (table.getEditingRows()).forEach( x => (table.setRowMode( editingRows[0], "view")) );
            table.setRowMode(row, "edit");
          }

        }
      },
      "columns": {
        "effectiveStatusIndex.conf.onFetchData": (table, row, index, filter, callback) => {
          callback && callback(mockEffectiveStatusIndex);
        }
      }
    })
  }
  render(){
    return <div>
      <EditTable
        mode="view"
        model={model}
        value={this.state.value}
      />
    </div>
  }
}
export default <UniqueEdit />;