import React, { Component } from 'react';
import Timeline from '../';
import { Icon } from 'mtf.block';
import M from 'mtf.utils';

const value = [
    {date: 1501257649100, status: "a", desc: "发起", name: "张三", mis: "zhangsan"},
    {date: 1501603241819, status: "a", desc: "审批通过", name: "李四", mis: "lisi04"},
    {date: 1503543949100, status: "a", desc: "审批通过", name: "王二", mis: "wanger"},
    {date: 1505807941819, status: "r", desc: "审批拒绝", name: "叶良辰", mis: "yeliangchen", "memo": "因项目紧急, 现阶段不要连续请一个星期这样的长假, 等项目完结了, 再给你批"}
];
const IconMap = {
    "a": "check-circle",
    "r": "cross-circle"
};

class Custom extends Component {
    render(){
        return (
            <div className="custom-demo">
                <ul>
                    <li>
                        <Timeline simple
                                  onFetchTimeline={this._fetchTime}
                                  renderLabel={this._renderLabel} />
                    </li>
                </ul>
            </div>
        );
    }

    _fetchTime = () => {
        return value;
    };
    _renderLabel = ({item, index, list}) => {
        let colorIndex = 0;
        (Array.prototype.forEach.call(item.name, (v, i) => {
            colorIndex += item.name.charCodeAt(i)
        }));
        colorIndex = colorIndex%7;
        return {
            left: <div className={`custom-left custom-left_${item.status}`}>
                <Icon type={IconMap[item.status]} />
                <span>{item.desc}</span>
            </div>,
            dot: <div className="custom-dot">
                <span>{index}</span>
                <div className={`custom-dot_name color-${colorIndex}`}>{item.name && item.name[0]}</div>
            </div>,
            right: <div className="custom-right">
                <div>{M.formatDatetime(item.date, '%m月%d日 %M:%S')}</div>
                <div>
                    <span>{item.name}</span>
                    <span>{item.mis}</span>
                </div>
                {item.memo && <div>{item.memo}</div>}
            </div>
        }
    };
}

export default <Custom/>