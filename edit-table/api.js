import React from 'react';
const columnType = <pre>
  <p><a href="/input" target="_blank">text</a></p>
  <p><a href="/input" target="_blank">number</a></p>
  <p><a href="/input" target="_blank">textarea</a></p>
  <p><a href="/date-picker" target="_blank">date</a></p>
  <p><a href="/select" target="_blank">select</a></p>
  <p><a href="/select" target="_blank">multiSelect</a></p>
  <p><a href="/tree-select" target="_blank">treeSelect</a></p>
  <p><a href="/tree-select" target="_blank">treeMultiSelect</a></p>
  <p><a href="/radio" target="_blank">radio</a></p>
  <p><a href="/checkbox" target="_blank">checkbox</a></p>
  <p><a href="/checkboxgroup" target="_blank">checkboxgroup</a></p>
   <p><a href="/checkbox" target="_blank">custom</a></p>
  <p>console(操作列)</p>
</pre>
module.exports = [
  {
    title: "EditTable",
    desc: "edittable支持的属性",
    columns: ["参数", "说明", "类型", "默认值"],
    data: [
      ["prefixCls", "设置样式前缀", "string", "mt"],
      ["mode", "设置控件状态，可选值为 edit|view 或者不设", "string", "edit"],
      ["value", "设置当前的值,如同bill的data,只接受一次，后续请用setValue修改", "Array", "-"],
      ["required", "设置控件是否必填", "boolean", 'false'],
      ["validation", "设置校验失败时的提示", "string", '-'],
      ["model", "模板", <a href="#model">查看属性</a>, "Object", '-'],
      ["locale", "默认文案设置","Object","emptyText: '暂无数据'"],
      ["onChange", "控件值改变的 handler", "function(value)", '-'],
      ["scroll", "横向或纵向支持滚动，也可用于指定滚动区域的宽高度：`{{ x: true, y: 300 }}`， model里该属性的优先级高于props里的", "Object", "-"],
      ["pagination", "翻页控件,参考Table的pagination对象, model里该属性的优先级高于props里的", "object", "-"],
      ["rowSelection", "勾选框参考Table的rowSelection对象，model里该属性的优先级高于props里的", "Object || Boolean", "undefined"],
    ]
  },
  {
    title: "model",
    desc: "配置文件的属性列表",
    columns: ["参数", "说明", "类型", "默认值"],
    data: [
      ["columns", "设置edittable的列", "array[Object]", "-"],
      ["buttons", "设置button", "array[Object]", "-"],
      ["scroll", "横向或纵向支持滚动，也可用于指定滚动区域的宽高度：`{{ x: true, y: 300 }}`， model里该属性的优先级高于props里的", "Object", "-"],
      ["pagination", "翻页控件,参考Table的pagination对象，model里该属性的优先级高于props里的", "object", -""],
      ["rowSelection", "勾选框参考Table的rowSelection对象，model里该属性的优先级高于props里的", "Object || Boolean", "undefined"],
    ]
  },
  {
    title: "columns",
    desc: "model中单个column的具体配置，组件共有的属性配置在code同层，组件特有属性，配置在conf里",
    columns: ["参数", "说明", "类型", "默认值"],
    data: [
      ["code", "列标识", "string", "-"],
      ["label", "表头标签", "string", "-"],
      ["type", <div>
        列控件类型,支持的类型有:
        <br />
        {columnType}
      </div>, "strting", <em>1.list/multiList/treeList/treeMultiList 类型值建议改为 <br />
        select/multiSelect/treeSelect/treeMultiSelect
      </em>],
      ["width", "列宽度", "String or Number", "-"],
      ["fixed", "列是否固定，可选 `true`(等效于 left) `'left'` `'right'`", "Boolean or String", "-"],
      ["conf", "组件特有属性配置在conf里，比如list, treelist的onFetchData(table, row, index, filter, callback), " +
      "onFetchNodeData(table, row, index, filter, callback)", "object", "-"],
      ["onChange", "字段改变时触发", "function(value, table, row, index, changeHandler), 调用changeHandler触发table的onChange", "-"],
      ["validator", "字段校验规则","function(table, row, index, value)","-"],
      ["formatComponent",
        "自定义列,type=='custom'时有效", "function(table, row, col, index)或者React class,如果是react class可以通过" +
      "this.props.table,this.props.row获取到table, row。" ,
        "-"],
      ["mode", "列的模式", "string,可选的值：edit || view", "edit"],
      ["required", "列是否必填", "Boolean", "false"],
      ["validation", "校验语", "string", "-"]

    ]
  },
  {
    title: "buttons",
    desc: "model中单个button的具体配置,对于编辑按钮，组件内部做了特殊处理，code一定要是edit。同理对于上移，下移按钮，code要是moveUp, moveDown",
    columns: ["参数", "说明", "类型", "默认值"],
    data: [
      ["code", "按钮标识", "string", "-"],
      ["label", "按钮label", "string", "-"],
      ["icon", "按钮icon", "String", "-"],
      ["style", "按钮类型，可选值为 primary|success|warning|danger|ghost 或者不设","string", "default"],
      ["shape", "设置按钮形状，可选值为 circle|circle-outline|no-outline 或者不设", "string", "-"],
      ["showInRowMode", "什么样的行模式下显示", "default | view | both", "both"],
      ["hideIn", "隐藏表格上方还是行内的按钮,若不设置，则行内和头部都有。对于显示在行内的按钮，默认是primary,no-outline", "head | row", "-"],
      ["showInHover", "是否hover时出现，对于行模式是view且行内按钮有效","Boolean","false"],
      ["action", "按钮的点击事件", "function(table, row, index)", "-"],
      ["format", "自定义按钮", "function（table, row, index)", "-"]
    ]
  },
  {
    title: "method",
    desc: "edittable提供的对外api",
    columns: ["方法名", "说明", "参数说明", "返回值类型|说明"],
    data: [
      ["getRowCell(index, code)", "获取格子ref", "index: 行下标。code: 列code", "ReactElement"],
      ["getRowRefs(index)", "获取行ref", "index: 行下标", "Array: 元素是ReactElement"],
      ["setRowMode(row, mode)", "设置行模式", "row：指定行。mode:要设置的行模式 edit | default", '-'],
      ["getEditingRows()", "获取当前正在被编辑的行数组", "-", "Array(value)"],
      ["isChanged()", "edittable的值是否变化", "", "Boolean"],
      ["setValue(value, [index])", "给edittable设值", "value: Array, [index]: 'Array,下标数组,指明哪些行是编辑态'", "-"],
      ["getValue()", "获取table的值","-", "Array"],
      ["resetRow(row, callback)", "将行设成编辑之前的值","row:  指定行，callback: 回调"],
      ["showHeadBtn([code])", "显示配在head的按钮", "Array:指定button的code的集合", "-"],
      ["hideHeadBtn([code])", "隐藏在head的按钮", "Array:指定button的code的集合", "-"],
      ["validate(row)", "传了row,则校验指定行，不传row则校验整个edittable", "-", "Boolean"],
      ["setRowFieldsValue(row, obj)","设置某行的值，类似于bill的setFieldsData","-"],
      ["setModel(obj)", "设置eittable的model", "-"],
      ["setColumnMode(code, mode)", "设置某一列的mode", "code: 列的code, mode: view || default", "-"],
      ["setBtnDisabled(Array)", "设置按钮disabled", "Array: 需要disabled的button的code集合", '-' ],
      ["setBtnEnable(Array)", "设置按钮enabled", "Array: 需要disabled的button的code集合", '-' ],
      ["getSelection()", "获取被勾选行的数据", "-", "Array(value)"]
    ]
  }

]