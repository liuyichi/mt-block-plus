import React, { PropTypes, isValidElement } from 'react';
import { cloneDeep, isEmpty } from 'lodash-compat';
import { Tabs, Button, Spin, Icon } from 'mtf.block';
import M from 'mtf.utils';
import { noop, isEmptyString, isObject, isFunction, isString } from 'mtf.block/util/data';
import NoData from '../img/nodata.png';
import {
  MODEL, IDFIELD, ADDBTNCONF,
  findItem, getKey, getNewTime, hasNew, buildTimeline
} from './util';


/**
 * 时间轴组件(使用 Tabs)
 *  显示时间和节点描述
 */
export default class Timeline extends M.BaseComponent {
  static propTypes = {
    prefixCls: PropTypes.string,
    position: PropTypes.oneOf(['left', 'right']),
    hideAdd: PropTypes.bool,
    initIfEmpty: PropTypes.bool,
    delNewWhenSelect: PropTypes.bool,
    addBtnConf: PropTypes.object,
    extraTab: PropTypes.node,
    model: PropTypes.shape({
      idField: PropTypes.string,
      leftField: PropTypes.string,
      colorField: PropTypes.string,
      rightField: PropTypes.string,
    }),
    simple: PropTypes.bool,
    color: PropTypes.string,
    active: PropTypes.object,
    getActive: PropTypes.func,
    onSelect: PropTypes.func,
    onAdd: PropTypes.func,
    onFetchTimeline: PropTypes.func,
    onFetchDetail: PropTypes.func,
    renderLabel: PropTypes.func,
    renderContent: PropTypes.func,
  };
  static defaultProps = {
    prefixCls: "mt",     // 样式前缀
    position: 'left',    // 时间轴位于内容的哪端
    hideAdd: false,      // 是否隐藏 '新增' 按钮
    initIfEmpty: true,   // 没有时间节点时, 是否显示新增中
    delNewWhenSelect: false, // 当从新增中切换到其他节点时, 是否删除新增中
    addBtnConf: null,    // '新增' 按钮的配置, 直接传给 Button 的属性, 例如 { icon: "", size: "" }
    extraTab: null,      // 是否有额外的内容显示在时间轴之上
    model: null,         // 设置时间轴的显示模板 {leftField, rightField, idField... }
    simple: false,       // 设置简单模式
    color: 'default',    // 设置整体的颜色
    getActive: null,     // 判断应该选中的时间节点并返回  getActive(list) { return active }
    onSelect: noop,      // 切换时间版本时的回调
    onAdd: noop,         // 点击 '新增' 按钮的回调
    onFetchTimeline: noop,   // 获取时间节点数组的方法 onFetchTimeline() { return array };
    onFetchDetail: noop, // 获取某个时间节点对应详细数据的方法 onFetchDetail(active) { return anyType }
    renderLabel: null,   // 渲染时间节点的方法 renderLabel({item, index, list}) { return {left: "2017-07-01", right: "系统生成"} || <div></div>  }
    renderContent: null, // 渲染详情内容的方法 renderContent({data, active, index, list}) { return <div></div> }
  };
  constructor(props) {
    super(props);
    this.model = Object.assign({}, MODEL, props.model);
    this.state = {
      loading: true,
      list: [],
      data: null,   // 存储渲染内容的数据
      active: props.active ? Object.assign({}, props.active, {[IDFIELD]: getKey(this.model, props.active)}) : {},
    }
  }
  componentDidMount() {}
  async componentWillReceiveProps(nextProps) {
    if ('active' in nextProps && nextProps.active !== this.props.active) {
      await this.fetchDetail(Object.assign({}, nextProps.active, {[IDFIELD]: getKey(this.model, nextProps.active)}));
    }
  }
  async componentWillMount() {
    await this.fetchTimeline();
  }

  renderLabel(item, index) {
    let { renderLabel, prefixCls, color, simple } = this.props;
    let { leftField, rightField, colorField } = this.model;
    var desc = item[rightField];
    let label = item._new ? item[leftField] : M.formatDatetime(item[leftField] || '', '%Y-%m-%d');
    let content = {
      left: label || '',
      right: desc || ''
    };
    let { active, list } = this.state;
    if (!item._new && renderLabel && isFunction(renderLabel)) {
      let res = renderLabel({item, index, list});
      if (isValidElement(res)) {
        return res;
      } else if (isObject(res)) { // 如果是返回了 left, right 的对象
        if ('left' in res) {
          leftField = true;
        }
        if ('right' in res) {
          rightField = true;
        }
        Object.assign(content, res);
      }
    }
    prefixCls += '-timeline-label';
    let cls = M.classNames({
      [`${prefixCls}`]: true,
      [`_${item[IDFIELD]}`]: true,
    });
    let itemColor = item[colorField] || ((!simple && active[IDFIELD] === item[IDFIELD]) ? "primary" : color);
    let headCls = M.classNames({
      [`${prefixCls}_head`]: true,
      [`${prefixCls}_head_${itemColor}`]: itemColor,
      [`${prefixCls}_head_custom`]: content.dot,
    });
    return <div className={cls}>
      {leftField && <div className={`${prefixCls}_left`}>{content.left || ''}</div>}
      <div className={headCls}>{isString(content.dot) ? <Icon type={content.dot} /> : content.dot}</div>
      {rightField && <div className={`${prefixCls}_right`}>{content.right || ''}</div>}
    </div>
  }
  renderContent(item, index) {
    let { renderContent } = this.props;
    let { active, data, list } = this.state;
    if (renderContent && isFunction(renderContent) && item[IDFIELD] === active[IDFIELD]) {
      return renderContent({data, item, index, list});
    } else {
      return null;
    }
  }
  render() {
    let { prefixCls, hideAdd, addBtnConf, extraTab, position, simple, other } = this.props;
    prefixCls += '-timeline';
    let { active, list, loading } = this.state;
    let cls = this.classNames(prefixCls, {
      [`${prefixCls}_showRight`]: this.model.rightField,
      [`${prefixCls}_simple`]: simple,
    });
    if (!list || list.length === 0) {
      return <div className={`${prefixCls} ${prefixCls}-noData`} ref="container">
        {loading && <Spin/>}
        <img src={NoData}/>
        <p>暂无数据</p>
      </div>;
    }
    let showAdd = !hideAdd && !hasNew(list);
    let extraTabDOM = !simple && <div className={`${prefixCls}__extra ${(showAdd || extraTab) ? '' : `${prefixCls}__extra-noData`}`}>
        {extraTab}
        {showAdd && <Button className={`${prefixCls}__extra-add`}
                            onClick={this._addHandler} {...Object.assign(ADDBTNCONF, addBtnConf)} />}
      </div>;
    return <div className={cls}>
      {loading && <Spin/>}
      <Tabs {...other} position={position}
                       autoDestory={true}
                       height="100%"
                       showPage={false}
                       disabled={simple}
                       model={{idField: IDFIELD}}
                       activeKey={active[IDFIELD]}
                       value={list.map((item, index) => {
              item.label = this.renderLabel(item, index);
              item.content = !simple && this.renderContent(item, index);
              return item;
            })}
                       extraTab={extraTabDOM}
                       onChange={this._changeHandler} />
    </div>
  }

  // 选中哪条
  _getActiveHandler(list) {
    if (!Array.isArray(list) || list.length <= 0) {
      return;
    }
    let { getActive } = this.props;
    let { active } = this.state;
    // 当前没有指定选中的时候, 选中第一项
    if (getActive) {
      active = getActive(list);
    } else if (!([IDFIELD] in active) || !findItem(list, active[IDFIELD])) {
      active = list[0];
    }
    return active;
  }
  // 新增时间版本
  async _addHandler() {
    let { onAdd } = this.props;
    let { list, active, data } = this.state;
    let oldList = cloneDeep(list);
    let newDate = getNewTime(this.model);
    let index = !([IDFIELD] in active) ? 0 : (list || []).findIndex(v => v[IDFIELD] === active[IDFIELD]);
    if (index !== -1) {
      list.splice(index, 0, newDate);
      Object.assign(this.state, {list});
    }
    let res = await onAdd({active, newDate, list: oldList, data});
    if (res === false) return;
    if (index !== -1 && !hasNew(oldList)) {
      list.splice(index, 1, newDate);
      this.addData = isEmptyString(res) ? data : res;
      this.setState({active: newDate, list, data: this.addData});
    }
  }
  // 切换时间轴
  async _changeHandler(key) {
    let { onSelect, delNewWhenSelect } = this.props;
    let { active, list } = this.state;
    let selected = findItem(list, key);
    let res = await onSelect({active, selected, list});
    if (res === false) return;
    if (active._new && delNewWhenSelect) { // 删除新增中节点
      let index = (list || []).findIndex(v => v[IDFIELD] === active[IDFIELD]);
      index !== -1 && list.splice(index, 1);
      Object.assign(this.state, {list});
    }
    if (selected._new) { // 跳到新增中去
      this.setState({active: selected, data: this.addData});
    } else if (!('active' in this.props)) {
      this.fetchDetail(selected);
    }
  }

  // 请求左侧时间轴数据
  async fetchTimeline(...args) {
    let list = [];
    let { onFetchTimeline, initIfEmpty, simple, hideAdd } = this.props;
    this.setState({loading: true}, async ()=>{
      try {
        list = await onFetchTimeline(...args) || [];
        list = buildTimeline(this.model, Array.isArray(list) ? list : (list.pageList || []));
      } finally {
        let active;
        Object.assign(this.state, {list});
        if (!simple && list.length === 0 && !hideAdd && initIfEmpty) {
          Object.assign(this.state, {active: {}, data: null}); // 如果是传入的空数组, 那么置空
          this._addHandler();
          this.setState({loading: false});
        } else {
          active = this._getActiveHandler(list); // 当前没有指定选中的时候, 选中第一项
          if (active) {
            this.fetchDetail(active);
          } else {
            this.setState({loading: false});
          }
        }
      }
    });
  }
  // 请求右侧内容数据
  async fetchDetail(active, ...args) {
    let { active: stateActive } = this.state;
    active = ([IDFIELD] in active) ? active : stateActive;
    if (active) {
      let data = {};
      this.setState({loading: true}, async ()=>{
        try {
          data = await this.props.onFetchDetail(active, ...args);
        } finally {
          // Tabs 根据 active 选中页签后直接渲染内容, 此时 state.data 必须要有值
          this.setState({loading: false, active, data});
        }
      });
    }
  }
  // 设置左侧时间轴数据
  async setTimeline(source) {
    if (Array.isArray(source)) {
      let list = buildTimeline(this.model, cloneDeep(source));
      Object.assign(this.state, {list});
      let active = this._getActiveHandler(list);
      if (active) {
        this.fetchDetail(active);
      } else {
        this.forceUpdate();
      }
    }
  }

  // 获取左侧时间轴数据
  getTimeline() {
    return this.state.list;
  }
  // 获取当前选中的时间节点
  getActive() {
    return this.state.active;
  }
}
