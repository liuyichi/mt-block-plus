import React, { Component } from 'react';
import Doc from 'mtf.block/util/doc';
import './index.scss';
import Api from '../api';
let conf = {
  "code": "timeline",
  "sub": {
    "title": "Timeline",
    "desc": "用于显示时间轴的组件"
  },
  "stage": {
    "title": "使用场景",
    "desc": "可供业务场景中有时间轴/流程链场景时使用"
  },
  demos: [
    {
      "code": "simple",
      "title": "简单模式",
      "desc": <div>
        <p>简单模式, 只读, 不可切换, 可以指定圆圈的颜色</p>
      </div>,
      "element": require('./simple').default,
      "link": 'simple.js'
    },
    {
      "code": "catalog",
      "title": "目录场景",
      "element": require('./catalog').default,
      "link": "catalog.js"
    },
    {
      "code": "timeline",
      "title": "时间轴场景",
      "desc": <div>
        <p>可新增, 切换后可指定是否删除"新增中", 保存或取消后去更新时间轴和详情的内容</p>
      </div>,
      'element': require('./timeline').default,
      "link": "timeline.js"
    },
    {
      "code": "custom",
      "title": "其他业务场景",
      'element': require('./custom').default,
      "link": "custom.js"
    }
  ],
  repos: "mtf.block-plug",
  api: Api
};

export default <Doc className="block-timeline-demo" {...conf}/>;




