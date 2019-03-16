/**
 * Created by shaohuanxia on 2017/9/14.
 */
import React from 'react';
import EditTable from '../EditTable';
import M from 'mtf.utils';
import { Input, Button, DatePicker } from 'mtf.block';
import model from './model/totalEditModel.json';
import _ from 'lodash-compat';

const mockValueType = [
  {
    "valueType": 1,
    "valueTypeName": "日期型"
  },
  {
    "valueType": 2,
    "valueTypeName": "字符型"
  }
];
class TotalEdit extends M.BaseComponent {
  constructor(props) {
    super(props);
    this.customCol = [];
    M.mergeModel(model, {
      "columns.metaCode": {
        "onChange": (value, table, row, index, changeHandler) => {
          table.setRowFieldsValue(row, {"metaCode": value.trim()})
        },
        "validator": {
          "onChange": [
            {
              "validator": (table, row, index, value) => {
                value = (value.toString()).trim();
                if (value.length > 5) {
                  return "超过5个字符啦"
                } else if (value.length == 0) {
                  return "不可为空"
                }
              }
            }
          ]
        }
      },
      "columns.valueType.conf.onFetchData": async(table, row, index, filter, callback) => {
        await new Promise((resolve) => {
          resolve(mockValueType)
        }).then((mockValueType) => {
          callback && callback(mockValueType);
        })
      },
      "buttons": {
        "add.action": (table, row, index) => {
          let value = table.getValue();
          value.push({defaultValue: 1, metaCode: 22});
          table.setValue(value);
        },
        "delete.action": (table, row, index) => {
          let value = table.getValue();
          value.splice(index, 1);
          table.setValue(value);
        }
      }
    })
  }

  componentDidMount() {
    //自定义组件的第一种接收形式
    M.mergeModel(model, {
      "columns.defaultValue.formatComponent": (table, row, col, index) => {
        let tableValue = table.getValue();
        if( !tableValue ){
          return null;
        }else{
          if( tableValue[index] && tableValue[index].valueType == 1){
            return <DatePicker value={row.defaultValue}
                               ref={ r => this.customCol[index] = r}
                               required={true}
                               size="small"
                               onChange={ v => {
                                 table.setRowFieldsValue(row, {defaultValue: v})
                               }} />
          }else if(tableValue[index] && tableValue[index].valueType == 2){
            return <Input value={row.defaultValue}
                          required={true}
                          size="small"
                          ref={ r => this.customCol[index] = r}
                          onChange={v => {
                            table.setRowFieldsValue(row, {defaultValue: v})
                          }}/>
          }else if(tableValue[index] && tableValue[index].valueType == ""){
            return  null;
          }
        }
      }
    });


    //自定义组件的第二种接收形式
    // M.mergeModel(model, {
    //   "columns.defaultValue.formatComponent": CustomCol
    // });


    this.refs.editTableRef.setModel(model);
  }

  render() {
    return <div>
      <EditTable
        ref="editTableRef"
        model={model}
      />
      <Button label="保存"
              onClick={() => {
                let editTable = this.refs.editTableRef;
               // let valid = this.customCol.map( x => x == null || x.validate() || editTable.validate()).every(Boolean);
                if(editTable.validate()){
                  console.log("table的数据是");
                  console.log(editTable.getValue());
                }
              }}/>
    </div>
  }
}

class CustomCol extends M.BaseComponent{
  constructor(props) {
    super(props);
    Object.assign(this.state, {
      value: ""
    })
  }
  validate(){
    return this.refs.customInput.validate();
  }
  render() {
    let { row } = this.props;
    return (
      <div>
        <Input
          ref="customInput"
          size="small"
          required={true}
          value={row.defaultValue}
          onChange={(v) => {
            this.setState({value: v});
            this.props.parent.setRowFieldsValue(this.props.row, {'defaultValue': v});
            console.log(this.props.parent);
          }}
        />
      </div>
    )
  }
}



export default <TotalEdit />;