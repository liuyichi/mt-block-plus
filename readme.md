## block-plug 公用组件库

企业平台提供的前端组件库,由企业平台前端团队和北京用户体验部设计团队联合打造而成,立足于解决中后台项目的前端实现方案;
该组件库适用于快速搭建中后台项目的前端框架,提供完整的前后端分离的发布部署方案.

包含的组件以一下三个为主

* timeline : 时间轴组件

代码示例参考 [block-demo](http://git.sankuai.com/users/jiazhao/repos/block-demo/browse)

项目参与人员:

FE:jiazhao liukaimei dengyajun shaohuanxia 等

UED:liangjikun chenbin02 duanqiuzi houxiaoqing03 huyuanfu等

## publish
node dev/publish.js
cd dev/publish 
mnpm publish


## 更新日志

### ``0.0.10`` 2018.1.4
>
1. 修复 edittable 中, checkbox 类型 view 模式时显示不可选的勾选框的问题 
2. 修复 edittable isChanged 问题

### ``0.0.9`` 2017.11.28
>
1. 修复 edittable.props.mode 变化时, 行状态没有更新
2. 修复 edittable 多选下拉的 onFetchNodeData 的参数

### ``0.0.8`` 2017.11.8
> 
1. edittable 支持 rowSelection
2. edittable 提供 getSelection() api
3. edittable 弹出层弹出层级, 由 findDOMNode(this) 改成通过 ref 获取  
