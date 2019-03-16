import 'mtf.block/style';
import './index.scss';
import ReactDOM from 'react-dom';
//let script = document.createElement("script");
//script.src = "//cdn.tinymce.com/4/tinymce.min.js";
//document.head.appendChild(script);

let elementName = location.search.slice(1) || 'timeline';
switch (elementName) {
  case "text":
  case "password":
  case "number":
  case "textarea":
    elementName = "input";
    break;
  case "list":
  case "multiList":
  case "autoText":
    elementName = "select";
    break;
  case "treeList":
  case "treeMultiList":
    elementName = "tree-select";
    break;
  case "date":
  case "time":
  case "rangeDate":
    elementName = "date-picker";
    break;
}

let context = require.context('../', true, /^\.\/(?!dev\/).+\/demo(?:.js|\/index.js)$/g);
let module = context(context.keys().find(m => m.includes(`/${elementName}/demo`)));
let demo = module.__esModule ? module.default : module;

document.title = elementName;

let container = document.createElement('div');
container.className = "page";
container.setAttribute("id", "page");
document.body.appendChild(container);

let goTop = document.createElement('a');
goTop.className = "goTop";
goTop.innerHTML = "返回顶部";
goTop.setAttribute("id", "goTop");
goTop.setAttribute("href", "javascript: scrollToCode('page')");
document.body.appendChild(goTop);

ReactDOM.render(demo, container);


