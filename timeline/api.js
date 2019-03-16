import React, { Component } from 'react';

let model = [
    {
        title: "Timeline",
        desc: "时间轴支持的属性",
        columns: ["参数", "说明", "类型", "默认值"],
        data: [
            ["model", <div>时间轴的显示模板 <a href="#model">查看属性</a></div>, "node or element", '{colorField: "color"}'],
            ["simple", "设置简单模式, 只显示时间节点部分", "boolean", 'false'],
            ["color", "设置整体的颜色, 内置的颜色类型有 default|primary|success|error|warning ", "string", 'default'],
            ["active", "指定当前选中的时间节点", "object", "-"],
            ["getActive", "判断应该选中的时间节点并返回", "function(list) { return active }", "false"],
            ["position", "时间轴显示在内容的哪侧, 可选项为 left | right", "string", "left"],
            ["hideAdd", "是否隐藏 '新增' 按钮", "boolean", "false"],
            ["initIfEmpty", "没有时间节点时, 是否显示新增中", "boolean", "true"],
            ["delNewWhenSelect", "当从新增中切换到其他节点时, 是否删除新增中", "boolean", "false"],
            ["addBtnConf", "'新增' 按钮的配置, 直接传给 Button 的属性, 例如 { icon: '', size: '' }", "object", "-"],
            ["extraTab", "是否有额外的内容显示在时间轴之上'", "node or element", '-'],
            ["onSelect", "切换时间版本时的回调", "function({active, selected, list})", '-'],
            ["onAdd", <div>
                点击 '新增' 按钮的回调 <br/>
                data 是新增时复制时间节点的数据, 返回 false 则不新增, 返回 newData 则新增一条节点, 内容为 newData
            </div>, "function({data, active, selected, list}) { return false || newData }", '-'],
            ["onFetchTimeline", "获取时间节点数组的方法, 返回时间列表", "function() { return arr }", '-'],
            ["onFetchDetail", "获取某个时间节点对应详细数据的方法, 返回内容的数据", "function(active) { return anyType }", '-'],
            ["renderLabel", <div>
                渲染时间节点的函数 <br/>
                默认显示时间节点的 leftField, rightField <br/>
                如果返回的不是对象, 则按默认显示 <br/>
                {`如果返回对象 {left, dot, right}, left 覆盖掉左侧显示部分, dot 覆盖掉中间显示的节点部分, right 覆盖掉右侧显示部分, 可以只返回 {left} 单独覆盖左边显示的内容`}
            </div>, "function({item, index, list}) { return {left: '', right: ''} }", '默认显示 model 中配置的 leftField 和 rightField 等内容'],
            ["renderContent", "渲染某个时间节点内容的函数, 内容是根据 onFetchDetail 获取到的", "function({data, item, index, list}) { return node or element }", '-'],
            ["其余属性", "Timline 基于 Tabs 开发, 所有 Tabs 接收的除上述属性及 value 外都会直接透传进去", "any", "-"]
        ],
    },
    {
        title:"model",
        desc:"",
        columns: ["参数", "说明", "类型", "默认值"],
        data:[
            ["idField", "键的属性名标识", "string or number or boolean", "-"],
            ["leftField", "时间节点的左侧标题, 不设则不显示", "string or node", "-"],
            ["colorField", "时间节点的圆圈颜色", "string", "color"],
            ["rightField", "时间节点的右侧说明, 不设则不显示", "string", "-"]
        ]
    },
    {
        title:"Function",
        desc:"对外提供的方法",
        columns: ["参数", "说明", "参数", "返回值类型|返回值说明"],
        data:[
            ["fetchTimeline()", "请求时间列表", "-", "-"],
            ["fetchDetail(active)", "请求 active 节点的详情信息", "active, Object 类型, 需要哪个节点的信息, 如果在时间列表内不存在, 则什么也不会发生", "-"],
            ["setTimeline(source)", "设置时间列表", "source, array 类型, 需要更新的数据", "-"],
            ["getTimeline()", "获取当前的时间列表", "", "array|当前显示的时间列表"],
            ["getActive()", "获取当前被选中的节点", "", "object|当前选中的节点"],
        ]
    }
];

export default model;
