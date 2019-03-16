import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import M from 'mtf.utils';
import { Input, Table, Select, TreeSelect, RadioGroup, ConsoleButton, DatePicker, CheckboxGroup } from 'mtf.block';
import classNames from 'classnames';
import _ from 'lodash-compat';
import { noop } from 'mtf.block/util/data';
import './style';

const defaultLocale = {
  emptyText: <span>暂无数据</span>,
}


let modelObjectShape;

modelObjectShape = PropTypes.shape({
  columns: PropTypes.arrayOf(PropTypes.object),
  buttons: PropTypes.arrayOf(PropTypes.object),
  scroll: PropTypes.object,
  pagination: PropTypes.object,
});

class EditTable extends M.BaseComponent {
  static propTypes = {
    prefixCls: PropTypes.string,
    locale: PropTypes.object,
    mode: PropTypes.oneOf(['edit', 'view']),
    model: modelObjectShape,
    value: PropTypes.array,
    required: PropTypes.bool,
    validation: PropTypes.string,
    onChange: PropTypes.func,
  }
  static defaultProps = {
    prefixCls: 'mt',
    mode: 'edit',
    locale: defaultLocale,
    model: {},
    value: [],
    required: false,
    validation: null,
    onChange: noop,
  }

  constructor(props) {
    super(props);
    this.beforeEditValue = [];
    Object.assign(this.state, {
      mode: props.mode || "edit",
    });
    let processedValue = this._formatValue(props.value); // _formatValue里对state.mode做了判断，所以初始的时候要先把props.mode放到state 里
    Object.assign(this.state, {
      value: _.cloneDeep(processedValue),
      model: _.cloneDeep(props.model),
      userControlHeadBtn: false,
      selectedRowKeys: [], //被勾选行的_pkCode集合
      isChanged: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.hasOwnProperty('mode') && nextProps.mode != this.state.mode) {
      this.setState({ mode: nextProps.mode }, () => {
        let { value, mode: tableMode } = this.state;
        let processedValue = value.map( (item) => {
          this.setRowMode(item, tableMode);  // 只有setRowMode里 做了beforeEditValue的赋值， 所以这里调用setRowMode
          item._editMode = tableMode === "edit";
          return item;
        });
        this.setState({ value:  processedValue});
      });
    }
  }


  render() {
    let { value } = this.state;
    let { locale, className, required, validation } = this.props;
    let { model } = this.state;
    let prefixCls = this.props.prefixCls + "-edit-table";
    let headButton = this._parseHeadButtons(model);
    let columns = this._parseModelColumns(model);
    let cls = classNames({
      [className]: !!className,
      [`${prefixCls}`]: true
    });
    let pagination = model.pagination || this.props.pagination;
    let rowSelection = model.rowSelection || this.props.rowSelection;
    let scroll = model.scroll || this.props.scroll;
    let hasInitHeadBtn = (model.buttons || []).findIndex(item => item.hideIn != "head" ) > -1;
    return (
      <div ref={r => this.editTableRef = r}
           className={cls}>
        {hasInitHeadBtn &&
        <div className={`${prefixCls}-head-button-group`}>
          {headButton}
        </div>}
        <div className={`${prefixCls}-table-container ${ (required && (value || []).length === 0) ? "has-error" : ''}`}>
          <Table columns={columns}
                 locale={locale}
                 idField="_pkCode"
                 dataSource={value}
                 scroll={scroll}
                 pagination = { !pagination ? false : {
                   'size': 'small',
                   ...pagination
                 }}
                 rowSelection={ !rowSelection ? undefined : {
                   ...rowSelection,
                   onChange: (selectedRowKeys) => {
                     this.setState({ selectedRowKeys })
                   }
                 }}
          />
          {( (required && (value || []).length === 0) && validation ) &&
          <span className={`has-explain ${prefixCls}-explain`}>{validation}</span>}
        </div>
      </div>
    );
  }

  /**
   * 属性白名单
   */
  _specifyProps(model, _model, props) {
    if (_.isEmpty(_model)) {
      return;
    }
    _.forEach(props, function (prop) {
      if (_model.hasOwnProperty(prop)) {
        model[prop] = _model[prop];
      }
    });
  }

  /**
   * 删除指定属性
   */
  _deleteProps(oldProps, deleteList) {
    let props = _.cloneDeep(oldProps);
    _.forEach(deleteList, function (prop) {
      if (props.hasOwnProperty(prop)) {
        delete props[prop];
      }
    });
    return props;
  }

  /**
   * 解析行内的button
   */
  _parseRowButtons(model, row, col, index){
    let prefixCls = this.props.prefixCls + "-edit-table";
    if(model && model.buttons){
      let btnConfList = _.cloneDeep(model.buttons);
      let rowBtnGroup = (btnConfList || []).map(btnConf => {
        let showInRowMode = btnConf.showInRowMode ? btnConf.showInRowMode : "both";
        let isInRightMode = false;
        if((row._editMode == true) && (showInRowMode == "edit" || showInRowMode == "both")){
          isInRightMode = true;
        }else if( (row._editMode == false) && (showInRowMode == "view" || showInRowMode == "both") ){
          isInRightMode = true;
          btnConf.showInHover && (btnConf.className = btnConf.className + ` ${this.props.prefixCls}-show-in-hover-btn`);
        }
        if( (btnConf.hideIn != 'row') && isInRightMode ) {
          if(_.isFunction(btnConf.format)){
            return btnConf.format( this, row, index);
          }else if((btnConf.code === "moveUp" && index === 0) || (btnConf.code === "moveDown" && index === this.state.value.length-1)){
            return null;
          }else{
            return (
              <ConsoleButton shape="no-outline"
                             style="primary"
                             size="xsmall"
                             {...btnConf}
                             className={M.classNames(`${prefixCls}-row-button`, btnConf.className)}
                             key={btnConf.code}
                             onClick={this._operatorClickHandler.bind(null, row, col, index, this, btnConf)}/>);
          }
        }else{
          return null;
        }
      });
      return <div className={`${this.props.prefixCls}-operate-row-group`}>{rowBtnGroup}</div>
    }
  }

  /**
   * 解析显示在head的button
   * @param modelButtons
   * @private
   */
  _parseHeadButtons(model){
    let prefixCls = this.props.prefixCls + "-edit-table";
    if(model && model.buttons){
      let { userControlHeadBtn } = this.state;
      let btnConfList = _.cloneDeep(model.buttons);
      if(!userControlHeadBtn && (model.buttons || []).length > 0){
        this.showHeadBtnCodes = [];
        model.buttons.forEach(btnConf => {
          if(btnConf.hideIn != 'head'){
            this.showHeadBtnCodes.push(btnConf.code);
          }
        })
      }

      let headBtnGroup = (btnConfList || []).map(btnConf => {
        let index = this.showHeadBtnCodes.findIndex(code => btnConf.code === code);
        if( (index > -1) && (btnConf.hideIn != 'head')){
          if(_.isFunction(btnConf.format)){
            return btnConf.format(this);
          }else{
            return (
              <ConsoleButton size="xsmall"
                             style="ghost"
                             {...btnConf}
                             className={M.classNames(`${prefixCls}-head-button`, btnConf.className, btnConf.inHeadPosition == "right" && `${prefixCls}-head-button-right`)}
                             key={btnConf.code}
                             onClick={this._operatorClickHandler.bind(null, null, null, null, this, btnConf)}/>)
          }
        }else{
          return null;
        }
      });
      return headBtnGroup;
    }
  }

  /**
   * 解析model.columns成Table可接受columns的形式
   */
  _parseModelColumns(model) {
    let modelColumns = model.columns;
    let columns = [];
    this.tableRefArray = [];
    if ((modelColumns || []).length > 0) {
      columns = _.cloneDeep(modelColumns);
      columns.forEach(colConfig => {
        let cls = classNames({
          [colConfig.className]: !!colConfig.className,
          'required': colConfig.required
        })
        colConfig.code = colConfig.code || colConfig.dataIndex;
        colConfig.label = colConfig.label || colConfig.title;
        colConfig.className = cls;
        colConfig.format = (row, col, index) => {
          return this._renderCell(row, col, index, model);
        }
      });
    }
    return columns;
  }

  /**
   * 数据处理
   * @param value
   * @private
   */
  _formatValue(value, editRowIndexArr){
    value = _.cloneDeep(value);
    let formattedValue = value.map( (item, i) => {
      if(!item._pkCode) {
        item._pkCode = _.uniqueId();
      }
      if(editRowIndexArr) {
        if( ( editRowIndexArr.findIndex( x => x == i) ) > -1){
          item._editMode = true;
        }else{
          item._editMode = false;
        }
      }else{
        let {mode: tableMode} = this.state;
        item._editMode = tableMode === "edit";
      }
      return item;
    });
    return formattedValue;
  }

  /**
   * 处理conf,绑定参数
   */
  _processConf(conf, row, index) {
    const config = _.cloneDeep(conf);
    if(config) {
      (Object.keys(config) || []).forEach(item => {
        if(_.isFunction(conf[item])) {
          config[item] = conf[item].bind(null, this, row, index)
        }
      });
    }
    return config;
  }

  /**
   * 渲染格子
   */
  _renderCell(row, colConf, index, model) {
    let content;
    let value;
    let colConfig = _.cloneDeep(colConf);
    colConfig = this._bindValidator(colConfig, row, index);
    let conf = this._processConf(colConfig.conf, row, index);
    this.tableRefArray[index] = {};
    let props = this._deleteProps(colConfig, ["code", "label", "type", "show", "width", "fixed", "format", "render", "conf", "defaultValue", "className"]);
    switch (colConfig.type) {
      case "text":
      case "textarea":
      case "number":
        content = <Input ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r)}
                         {...props}
                         size="small"
                         type={colConfig.type}
                         value={row[colConfig.code]}
                         mode={ this._getCellMode(row, colConfig, index) }
                         {...conf}
                         onChange={ this._changeHandler.bind(this, row, colConfig, index) }/>;
        break;
      case "list":
      case "select":
        value = this._formatSelectValue(row, colConfig);
        content = <Select ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                          {...props}
                          size="small"
                          value={value}
                          mode={ this._getCellMode(row, colConfig, index) }
                          getPopupContainer={() => {
                            return this.editTableRef;
                          }}
                          {...conf}
                          onChange={ this._changeHandler.bind(this, row, colConfig, index) }/>;
        break;
      case "multiList":
      case "multiSelect":
        content = <Select  ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                           {...props}
                           size="small"
                           value={row[colConfig.code] || []}
                           multiple={true}
                           mode={ this._getCellMode(row, colConfig, index) }
                           getPopupContainer={() => {
                             return findDOMNode(this);
                           }}
                           {...conf}
                           onChange={ this._changeHandler.bind(this, row, colConfig, index) }/>;
        break;
      case "treeList":
      case "treeSelect":
        value = this._formatSelectValue(row, colConfig);
        content = <TreeSelect ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                              {...props}
                              size="small"
                              value={value}
                              mode={ this._getCellMode(row, colConfig, index) }
                              getPopupContainer={() => {
                                return this.editTableRef;
                              }}
                              {...conf}
                              onChange={ this._changeHandler.bind(this, row, colConfig, index) }/>;
        break;
      case "treeMultiList":
      case "treeMultiSelect":
        content = <TreeSelect ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                              {...props}
                              size="small"
                              value={row[colConfig.code]}
                              mode={ this._getCellMode(row, colConfig, index) }
                              multiple={true}
                              getPopupContainer={() => {
                                return this.editTableRef;
                              }}
                              {...conf}
                              onChange={ this._changeHandler.bind(this, row, colConfig, index)  }/>;
        break;
      case "radio":
        content = <RadioGroup ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                              {...props}
                              size="small"
                              mode={ this._getCellMode(row, colConfig, index) }
                              value={row[colConfig.code]}
                              {...conf}
                              onChange={ this._changeHandler.bind(this, row, colConfig, index)  }/>;
        break;
      case "radiogroup":
        content = <RadioGroup ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                              {...props}
                              size="small"
                              mode={ this._getCellMode(row, colConfig, index) }
                              value={row[colConfig.code]}
                              {...conf}
                              onChange={ this._changeHandler.bind(this, row, colConfig, index)  }/>;
        break;
      case "checkboxgroup":
         content =
          <CheckboxGroup ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                         {...props}
                         size="small"
                         mode={ this._getCellMode(row, colConfig, index) }
                         value={row[colConfig.code]}
                         {...conf}
                         onChange={ this._changeHandler.bind(this, row, colConfig, index)  }/>;
        break;
// 这里建议checkbox自己支持showCheckboxWhenView属性，因为mode一设置成view 就没有checkbox了
      case "checkbox":
        value = this._formatCheckboxValue(row, colConfig);
        content =
          <CheckboxGroup ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                         {...props}
                         size="small"
                         value={value}
                         {...conf}
                         disabled={ this._getCellMode(row, colConfig, index) == 'view' ? true : ( conf || {}).disabled}
                         mode="default"
                         onChange={ this._changeHandler.bind(this, row, colConfig, index)  }/>;
        break;
      case "date":
        content = <DatePicker ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                              {...props}
                              size="small"
                              mode={ this._getCellMode(row, colConfig, index) }
                              value={row[colConfig.code]}
                              getPopupContainer={() => {
                                return this.editTableRef;
                              }}
                              {...conf}
                              onChange={ this._changeHandler.bind(this, row, colConfig, index) }/>;
        break;
      case "console":
        content = this._parseRowButtons(model, row, colConfig, index);
        break;
      case "custom":
        let isPureFunc = _.isFunction(colConfig.formatComponent) && !colConfig.formatComponent.prototype.render;
        let isClassFunc = _.isFunction(colConfig.formatComponent) && colConfig.formatComponent.prototype.render;

        if(isPureFunc){
          content = colConfig.formatComponent(this, row, colConfig, index);
        }else if(isClassFunc){
          let CustomElement =  colConfig.formatComponent;
          content = <CustomElement ref={ r => this.tableRefArray[index] && (this.tableRefArray[index][colConfig.code] = r) }
                                   parent={this}
                                   row={row}
                                   index={index}/>;
        }else{
          content = colConfig.formatComponent;
        }
        break;
      default:
        content = null;
        break;
    }
    return <div>
      { content }
    </div>
  }


  _getCellMode(row, colConf, index){
    let cellMode = "default";
    if( row._editMode === false || colConf.mode === "view" ){ //如果行正在被编辑，但colConf.mode === "view",格子的mode依然是view
      cellMode =  "view";
    }else{
      cellMode = "default"
    }
    return cellMode;
  }

  _changeHandler(row, colConfig, index, v) {
    let { onChange } = colConfig;
    let {value} = this.state;
    if(_.isFunction(onChange)){
      onChange(v, this, row, index, this.props.onChange);
    }else{
      switch (colConfig.type) {
        case "list":
        case "select":
        case "treeList":
        case "treeSelect":
          if (colConfig.objToServer) {
            value[index][colConfig.code] = v;
          } else {
            value[index][colConfig.code] = ( v || {} ).value;
            value[index][colConfig.showCode || colConfig.code + "Name"] = ( v || {} ).label;
          }
          break;
        default:
          value[index][colConfig.code] = v;
          break;
      }
      this.setState({value, isChanged: true});
      this.props.onChange(value);
    }

  }

  _formatSelectValue(row, colConf){
    let value = _.cloneDeep(row[colConf.code]);
    if(_.isObject(value)){
      return value;
    }else{
      let { idField, showField, showTpl } = colConf.model || {};
      let label = row[colConf.showCode || colConf.code];
      if (showTpl) {
        return {value, label};
      } else {
        return {[idField]: value, [showField]: label};
      }
    }
  }

  _formatCheckboxValue(row, colConf) {
    let value = _.cloneDeep(row[colConf.code]);
    if(_.isArray(value)) {
      return value;
    } else {
      return [value];
    }
  }


  /**
   * 按钮操作
   */
  _operatorClickHandler( row, colConf, index, table, btnConfig) {
    switch (btnConfig.code) {
      case "moveUp":
        this._moveUpHandler(row, colConf, index, table, btnConfig);
        break;
      case "moveDown":
        this._moveDownHandler(row, colConf, index, table, btnConfig);
        break;
      default:
        _.isFunction(btnConfig.action) && btnConfig.action(table, row, index);
        break;
    }
  }

  /**
   * 上移按钮handler
   * @private
   */
  _moveUpHandler(row, colConf, index, table, btnConf){
    let { onChange } = this.props;
    let { action }  = btnConf;
    let { value } = this.state;
    if(_.isFunction(action)){
      action(table,row, index);
    }else{
      if(index >= 1){
        let frontIndex = index-1;
        let frontObj = value[frontIndex];
        value[frontIndex] = value[index];
        value[index] = frontObj;
        this.setState({value}, () => {
          onChange(value);
        })
      }
    }
  }

  /**
   * 下移按钮handler
   * @private
   */
  _moveDownHandler(row, colConf, index, table, btnConf){
    let { onChange } = this.props;
    let { value } = this.state;
    let { action }  = btnConf;
    if(_.isFunction(action)){
      action(table,row, index);
    }else{
      if(index < value.length - 1){
        let backIndex = index+1;
        let backObj = value[backIndex];
        value[backIndex] = value[index];
        value[index] = backObj;
        this.setState({value}, () => {
          onChange(value);
        })
      }
    }
  }

  _findIndexByCode(array,_pkCode){
    let index = -1;
    if( (array || []).length > 0 ){
      index = array.findIndex( item => (
        item._pkCode && item._pkCode === _pkCode
      ))
    }
    return index;
  }

  _fetchDataHandler(row, table, colConf, index, filter, callback) {
    colConf.conf && _.isFunction(colConf.conf.onFetchData) &&
    colConf.conf.onFetchData(table, row, index, filter, callback);
  }

  _fetchNodeDataHandler(row, table, colConf, index, node, callback) {
    colConf.conf && _.isFunction(colConf.conf.onFetchNodeData) &&
    colConf.conf.onFetchNodeData(table, row, index, node, callback);
  }

  _bindValidator(_colConf, row, index) {
    let colConf = _.cloneDeep(_colConf);
    if(colConf && colConf.validator && _.isFunction(colConf.validator)) {
      colConf.validator = colConf.validator.bind(null, this, row, index);
    }else if(colConf && colConf.validator && _.isObject(colConf.validator)) {
      _.forEach(colConf.validator.onBlur || [], function (rule) {
        if (rule.validator && _.isFunction(rule.validator)) {
          rule.validator = rule.validator.bind(null, this, row, index);
        }
      }.bind(this));
      _.forEach(colConf.validator.onChange||[],(rule) => {
        if(rule.validator&&_.isFunction(rule.validator)) {
          rule.validator = rule.validator.bind(null, this, row, index);
        }
      });
    }
    return colConf;
  }

  _rowValidate(row) {
    let valid = true;
    let index = this._findIndexByCode(this.state.value, row._pkCode);
    let rowRefs = this.getRowRefs(index);
    rowRefs.forEach( cellRef => {
      if(cellRef && cellRef.validate && !cellRef.validate()){
        valid = false;
      }
    });
    return valid;
  }

  _hasRowInEdit(value){
    let has = false;
    value.forEach( v => {
      if(v._editMode == true){
        has = true;
      }
    });
    return has;
  }

  _hasNewRow(value){
    let has = false;
    value.forEach( v => {
      if(v._editMode == true && this.beforeEditValue[v._pkCode] == undefined){
        has = true;
      }
    });
    return has;
  }

  _toggleButtonDisabled(btnCodeList, on) {
    let { model } = this.state;
    (model.buttons || []).forEach(item => {
      if(btnCodeList.findIndex(code => code == item.code) > -1){
        item.disabled = on;
      }
    });
    this.state.model = model;
    this.forceUpdate();
  }




  /**---------------------------------- 对外api -------------------------*/
  /**
   * this.tableRefArray = [
   *  {metaCode: Input, metaMemo: Input}, //rowIndex == 0的ref集合
   *  {metaCode: Input, metaMemo: Input}, //rowIndex == 1的ref集合
   * ]
   */
  getRowCell(index, code){ //对于自定义的列(也就是自己写了format的列)，是拿不到ref的。
    return this.tableRefArray[index][code];
  }

  getRow(index){
    console.warn('getRow 已弃用，请尽快迁移至 getRowRefs');
    return this.getRowRefs(index);
  }
  /**
   * return [Input, Input, Select ....]
   * @param index
   * @returns {Array}
   */
  getRowRefs(index){
    let rowRefs = [];
    let rowObject = this.tableRefArray[index];
    rowObject && Object.keys(rowObject).forEach( code => {
      rowRefs.push(rowObject[code])
    });
    return rowRefs;
  }

  setRowMode(row, mode, callback){
    if(row){
      let { value } = this.state;
      let editIndexArr = this.getEditingRowsIndex();
      let rowIndex = this._findIndexByCode(value, row._pkCode);
      let rowIndexInEditIndexArr = editIndexArr.findIndex( x => x == rowIndex );
      let isRowInEdit = rowIndexInEditIndexArr > -1;
      if(mode === "view" && isRowInEdit){
        editIndexArr.splice(rowIndexInEditIndexArr, 1);
        delete this.beforeEditValue[row._pkCode];
      }else if( mode !== "view" && !isRowInEdit){
        this.beforeEditValue[row._pkCode] = _.cloneDeep(row);
        editIndexArr.push(rowIndex);
      }
      let formattedValue = this._formatValue(value, editIndexArr);
      this.state.value = formattedValue;
      this.forceUpdate(() => { callback && callback() });
    }
  }


  getEditingRows(){
    let { value } = this.state;
    return value.filter(v => v._editMode == true);
  }

  getEditingRowsIndex(){
    let { value } = this.state;
    let editingRowsIndexArr = [];
    value.forEach( (v, index) => v._editMode && editingRowsIndexArr.push(index));
    return editingRowsIndexArr;
  }


  isChanged() {
    //比较的时候 不比较_editMode
    let { value } = this.state;

    if(this.state.mode === 'edit') {  // 整体编辑
      return this.state.isChanged;
    } else {                        // 单行编辑
      if(this._hasNewRow(value)){
        return true;
      }else if(this._hasRowInEdit(value)){
        let processedValue =  value.map( v => this._deleteProps( _.cloneDeep(v), ["_editMode"]) );
        let processedBeforeEditValue = this.beforeEditValue.map(v => this._deleteProps( _.cloneDeep(v), ["_editMode"]));
        return !((processedBeforeEditValue.map( x => {
          return _.isEqual(x, processedValue[this._findIndexByCode(processedValue, x._pkCode)])
        })).every(Boolean));
      }else{
        return false;
      }
    }

  }

  setModel(mod, callback){
    if(mod){
      this.state.model = mod;
      this.forceUpdate(() => {callback && callback();});
    }
  }

  setValue(val, editRowIndexArr, callback){
    let formattedValue = this._formatValue(val, editRowIndexArr);

    //比较的时候 不比较_editMode, _pkCode
    let processedValue = this.state.value.map( v => this._deleteProps( _.cloneDeep(v), ["_editMode", "_pkCode"]) );
    let processedFormattedValue = formattedValue.map( v => this._deleteProps( _.cloneDeep(v), ["_editMode", "_pkCode"]) );

    if(!_.isEqual(processedValue, processedFormattedValue)) {
      this.state.isChanged = true;
    } else {
      this.state.isChanged = false;
    }


    this.state.value = formattedValue;
    this.forceUpdate(() => {this.props.onChange(this.state.value); callback && callback()})
  }

  /**
   * 给某行的字段设值 //类似与bill.setFieldsData()
   * @param row
   * @param obj
   */
  setRowFieldsValue(row, obj, callback){
    let { value } = this.state;
    let index = this._findIndexByCode(value, row._pkCode);
    if(index > -1 && obj) {
      for(let prop in obj){
        value[index][prop] = obj[prop];
      }
      let alreadyInEditingRows = this.getEditingRows();
      let editingIndexArr = [];
      alreadyInEditingRows.forEach(x => {
        editingIndexArr.push(this._findIndexByCode(value, x._pkCode))
      });
      this.setValue(value, editingIndexArr, callback)
    }
  }


  getValue(){
    let tableValue = _.cloneDeep(this.state.value);
    return tableValue;
  }

  async resetRow(row, callback) {
    let { value } = this.state;
    let operateIndex = this._findIndexByCode(value, row._pkCode);
    if(this.beforeEditValue[row._pkCode] !== undefined){
      let operateRow = _.cloneDeep( this.beforeEditValue[row._pkCode] );
      value[operateIndex] = operateRow;
      value[operateIndex]._editMode = row._editMode;
    }else{//如果是新增行,直接删除该行.如果某行在编辑态而且beforeEditValue == undefined那么这行是新增行
      value.splice(operateIndex, 1);
    }
    // let formattedValue = this._formatValue(value);
    // this.state.value = formattedValue;
    // this.forceUpdate(() => { value[operateIndex] && this._rowValidate(value[operateIndex]);});
    let editingRowsIndex = this.getEditingRowsIndex();
    await this.setValue(value, editingRowsIndex, callback);
    value[operateIndex] && this._rowValidate(value[operateIndex]);

  }

  showHeadBtn(btnCodeList) {
    //如果用户没有手动调用showHeadBtn／hideHeadBtn，默认state.model.button里面所有showInHead的都显示
    //所以需要设置个用户手动调用showHeadBtn/hideHeadBtn的标识
    this.setState({
      userControlHeadBtn: true
    });
    this.showHeadBtnCodes = btnCodeList;
    this.forceUpdate();
  }

  hideHeadBtn(btnCodeList) {
    this.setState({
      userControlHeadBtn: true
    });
    btnCodeList.forEach( code => {
      let index = (this.showHeadBtnCodes).findIndex( x => x == code);
      index > -1 && (this.showHeadBtnCodes.splice(index, 1));
    });
    this.forceUpdate();
  }

  setColumnMode(code, mode) {
    let { model } = this.state;
    let colConf = (model.columns || []).find(item => item.code == code);
    colConf.mode = mode;
    this.state.model = model;
    this.forceUpdate();
  }

  setBtnDisabled(btnCodeList) {
    this._toggleButtonDisabled(btnCodeList, true);
  }

  setBtnEnable(btnCodeList) {
    this._toggleButtonDisabled(btnCodeList, false);
  }

  /**
   * 获取被选中行的值
   * @returns {Array.<T>}
   */
  getSelection() {
    let { value, selectedRowKeys } = this.state;
    let dataById = M.toObject(value, "_pkCode");
    return selectedRowKeys.map(i => dataById[i]).filter(Boolean);
  }

  validate(row) {
    if(row !== undefined && row._pkCode){
      return this._rowValidate(row);
    }else{
      let valid = true;
      let { value } = this.state;
      let { required } = this.props;
      if((value || []).length > 0){ //校验每行
        valid = (value || []).map((row, index) => this._rowValidate(row)).every(Boolean);
      }else{ //没有行时 校验整个table
        if(required && (value || []).length === 0){
          valid = false;
        }
      }
      return valid;
    }
  }

  setCellMode(row, colCode, mode) {

  }

}

export default EditTable;


