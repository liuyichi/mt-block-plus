import React, { Component } from 'react';
import Timeline from '../';

const value = [
    {date: 1503543949100, desc: "退休", draft: false},
    {date: 1501603200000, desc: "员工类型变更", draft: false},
    {date: 1501603200000, desc: "员工类型变更", draft: true},
    {date: 1501257600000, desc: "重新入职", draft: false},
    {date: 1496851200000, desc: "离职", draft: false},
    {date: 1493568000000, desc: "系统变更", draft: false},
    {date: 1487779200000, desc: "入职", draft: false}
];
const value2 = [
    {date: 1503543949100, desc: "店家发货"},
    {date: 1501603200000, desc: "快递员取货", color: "default"},
    {date: 1503590400000, desc: "到达吐鲁番...", color: "primary"},
    {date: 1503676800000, desc: "到达巴基斯坦...", color: "success"},
    {date: 1503676800000, desc: "到达巴基斯坦...", color: "error"},
    {date: 1503676800000, desc: "到达巴基斯坦...", color: "warning"}
];

class Simple extends Component {
    _fetchTime = () => {
        return value;
    };

    render(){
        return (
            <div className="simple-demo">
                <ul>
                    <li>
                        <label>只显示标题:</label>
                        <Timeline simple
                                  onFetchTimeline={this._fetchTime}
                                  model={{leftField: "date"}} />
                    </li>
                    <li>
                        <label>只显示说明:</label>
                        <Timeline simple
                                  onFetchTimeline={this._fetchTime}
                                  model={{rightField: "desc"}} />
                    </li>
                    <li>
                        <label>显示标题和说明:</label>
                        <Timeline simple
                                  onFetchTimeline={this._fetchTime}
                                  model={{leftField: "date", rightField: "desc"}} />
                    </li>
                    <li>
                        <label>圆圈颜色统一控制:</label>
                        <Timeline simple
                                  color="primary"
                                  model={{rightField: "desc"}}
                                  onFetchTimeline={this._fetchTime}/>
                    </li>
                    <li>
                        <label>圆圈颜色单独控制:</label>
                        <Timeline simple
                                  model={{rightField: "desc"}}
                                  onFetchTimeline={()=>value2}/>
                    </li>
                </ul>
            </div>
        );
    }
}

export default <Simple/>