import React, { Component } from 'react';
import Doc from 'mtf.block/util/doc';
let api = require("../api");
let conf = {
  "code":"edit-table",
  "sub":{
    "title":"",
    "desc":""
  },
  "stage":{
    "title":"使用场景",
    "desc":"当用户需要从下拉列表中选择一项或多项作为表单输入内容时"
  },
  demos:[
    {
      "code": "totalEdit",
      "title": "整体编辑举例",
      "desc":<div>
        <p>整体编辑举例。</p>
      </div>,
      'element':require('./TotalEdit').default,
      "link":"TotalEdit.js"
    },
    {
      "code": "uniqueEdit",
      "title": "单行编辑举例",
      "desc":<div>
        <p>单行编辑举例。</p>
      </div>,
      'element':require('./UniqueEdit').default,
      "link":"UniqueEdit.js"
    },
    {
      "code": 'complexTable',
      "title": "复选框，翻页举例",
      "desc":<div>
        <p>复选框，翻页举例。</p>
      </div>,
      'element':require('./ComplexTable').default,
      "link":"ComplexTable.js"
    }
  ],
  repos: "mtf.block-plug",
  api: api
};

export default <Doc className="block-select-demo" {...conf}/>;