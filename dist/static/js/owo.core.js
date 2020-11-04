// Wed Nov 04 2020 22:29:40 GMT+0800 (GMT+08:00)
var owo = {tool: {},state: {},};
/* 方法合集 */
var _owo = {
  isIE: (window.navigator.userAgent.indexOf("MSIE") >= 1),
  // 支持IE的事件绑定
  addEventListener: function (dom, name, func) {
    if (_owo.isIE) {
      dom.attachEvent('on' + name, func);      
    } else {
      dom.addEventListener(name, func, false);
    }
  }
}

/* 运行页面初始化方法 */
_owo.runCreated = function (pageFunction) {
  // 如果dom已经被删掉那么不会运行对应的方法
  if (!pageFunction.$el) {
    console.info('dom元素不存在!')
    return;
  }
  try {
    // console.log(pageFunction)
    if (pageFunction.show) {pageFunction.show.apply(pageFunction)}
    if (pageFunction["_isCreated"]) return
    // 确保created事件只被执行一次
    pageFunction._isCreated = true
    if (pageFunction.created) {pageFunction.created.apply(pageFunction)}
  } catch (e) {
    console.error(e)
  }
}

_owo.getFuncformObj = function (pageFunction, pathStr) {
  if (!pageFunction) {
    return false
  }
  var pointFunc = pageFunction
  var pathList = pathStr.split('.')
  for (var ind = 0; ind < pathList.length; ind++) {
    var path = pathList[ind];
    if (pointFunc[path]) pointFunc = pointFunc[path]
    else {
      return false
    }
  }
  return pointFunc
}

_owo._run = function (eventFor, event, newPageFunction) {
  // 复制eventFor防止污染
  var eventForCopy = eventFor
  // 待优化可以单独提出来
  // 取出参数
  var parameterArr = []
  var parameterList = eventForCopy.match(/[^\(\)]+(?=\))/g)
  
  if (parameterList && parameterList.length > 0) {
    // 参数列表
    parameterArr = parameterList[0].split(',')
    // 进一步处理参数
    
    for (var i = 0; i < parameterArr.length; i++) {
      var parameterValue = parameterArr[i].replace(/(^\s*)|(\s*$)/g, "")
      // console.log(parameterValue)
      // 判断参数是否为一个字符串
      
      if (parameterValue.charAt(0) === '"' && parameterValue.charAt(parameterValue.length - 1) === '"') {
        parameterArr[i] = parameterValue.substring(1, parameterValue.length - 1)
      }
      if (parameterValue.charAt(0) === "'" && parameterValue.charAt(parameterValue.length - 1) === "'") {
        parameterArr[i] = parameterValue.substring(1, parameterValue.length - 1)
      }
      // console.log(parameterArr[i])
    }
  }
  eventForCopy = eventFor.replace(/\([\d\D]*\)/, '')
  // console.log(newPageFunction, eventForCopy)
  // 如果有方法,则运行它
  newPageFunctionTemp = _owo.getFuncformObj(newPageFunction, eventForCopy)
  if (newPageFunctionTemp) {
    // 绑定window.owo对象
    newPageFunction.$event = event
    newPageFunction.$target = event.target
    newPageFunctionTemp.apply(newPageFunction, parameterArr)
  } else {
    shaheRun.apply(newPageFunction, [eventFor])
  }
}

_owo.bindEvent = function (eventName, eventFor, tempDom, moudleScript) {
  switch (eventName) {
    case 'tap':
      // 变量
      var startTime = 0
      var isMove = false
      tempDom.ontouchstart = function () {
        startTime = Date.now();
      }
      tempDom.ontouchmove = function () {
        isMove = true
      }
      tempDom.ontouchend = function (event) {
        if (Date.now() - startTime < 300 && !isMove) {_owo._run(eventFor, event || this, moudleScript)}
        // 清零
        startTime = 0;
        isMove = false
      }
      break;
  
    default:
      // 防止重复绑定
      if (tempDom['owo_bind_' + eventName] !== eventFor) {
        tempDom['owo_bind_' + eventName] = eventFor
        _owo.addEventListener(tempDom, eventName, function(event) {
          _owo._run(eventFor, event || this, moudleScript)
        })
      }
      break;
  }
}

// 处理dom的owo事件
_owo.addEvent = function (tempDom, moudleScript) {
  if (tempDom.attributes) {
    for (var ind = 0; ind < tempDom.attributes.length; ind++) {
      var attribute = tempDom.attributes[ind]
      // ie不支持startsWith
      var eventFor = attribute.textContent || attribute.value
      eventFor = eventFor.replace(/ /g, '')
      // 判断是否为owo的事件
      if (attribute.name.slice(0, 2) == 'o-') {
        var eventName = attribute.name.slice(2)
        switch (eventName) {
          case 'if':
          case 'hover':
            break
          case 'tap': {
            // 根据手机和PC做不同处理
            if (_owo.isMobi) _owo.bindEvent('tap', eventFor, tempDom, moudleScript)
            else _owo.bindEvent('click', eventFor, tempDom, moudleScript)
            break
          }
          // 处理o-value
          case 'value': {
            var value = shaheRun.apply(moudleScript, [eventFor])
            function inputEventHandle (e) {
              var eventFor = e.target.getAttribute('o-value')
              shaheRun.apply(moudleScript, [eventFor + '="' + e.target.value + '"'])
            }
            switch (tempDom.tagName) {
              case 'INPUT':
                switch (tempDom.getAttribute('type')) {
                  case 'number':
                    if (value == undefined) value = ''
                    tempDom.value = value
                    tempDom.oninput = function (e) {
                      var eventFor = e.target.getAttribute('o-value')
                      var value = e.target.value
                      if (value == '') value = '""'
                      shaheRun.apply(moudleScript, [eventFor + '=' + value])
                    }
                    break;
                  case 'color':
                  case 'password':
                  case 'text':
                    if (value == undefined) value = ''
                    tempDom.value = value
                    tempDom.oninput = inputEventHandle
                    break;
                  case 'checkbox':
                    tempDom.checked = Boolean(value)
                    tempDom.onclick = function (e) {
                      var eventFor = e.target.getAttribute('o-value')
                      shaheRun.apply(moudleScript, [eventFor + '=' + e.target.checked])
                    }
                    break;
                  
                }
                break;
              case 'SELECT':
                if (value == null || value == undefined) value = ''
                var activeOpt = tempDom.querySelector('[value="' + value + '"]')
                if (activeOpt) {
                  activeOpt.setAttribute('selected', 'selected')
                } else {
                  console.error('找不到应该活跃的选项: ' + value + '\r\nDOM元素为: ', tempDom);
                }
                tempDom.onchange = inputEventHandle
                break;
              default:
                tempDom.innerHTML = value
                break;
            }
            break
          }   
          default: {
            
            _owo.bindEvent(eventName, eventFor, tempDom, moudleScript)
          }
        }
      } else if (attribute.name == 'view') {
        viewName = eventFor
      } else if (attribute.name == 'route') {
        routeName = eventFor
      }
    }
  }
}






_owo.cutString = function (original, before, after, index) {
  index = index || 0
  if (typeof index === "number") {
    var P = original.indexOf(before, index)
    if (P > -1) {
      if (after) {var f = original.indexOf(after, P + before.length)
        // console.log(P, f)
        // console.log(original.slice(P + before.toString().length, f))
        return (f>-1)? original.slice(P + before.toString().length, f) : ''
      } else {
        return original.slice(P + before.toString().length);
      }
    } else {
      return ''
    }
  } else {
    console.error("owo [sizeTransition:" + index + "不是一个整数!]")
  }
}
_owo.cutStringArray = function (original, before, after, index, inline) {
  var aa=[], ab=0;
  index = index || 0
  
  while(original.indexOf(before, index) > 0) {
    var temp = this.cutString(original, before, after, index)
    if (temp !== '') {
      if (inline) {
        if (temp.indexOf('\n') === -1) {
          aa[ab] = temp
          ab++
        }
      } else {
        aa[ab] = temp
        ab++
      }
    }
    // console.log(before)
    index = original.indexOf(before, index) + 1
  }
  return aa;
}




// 页面切换






// 判断是否为手机
_owo.isMobi = navigator.userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null
function Page(pageScript, parentScript) {
  for (var key in pageScript) {
    this[key] = pageScript[key]
  }
  
  // 处理页面引用的模板
  for (var key in pageScript.template) {
    pageScript.template[key].$el = pageScript.$el.querySelector('[template="' + key + '"]')
    pageScript.template[key] = new Page(pageScript.template[key])
  }
  if (parentScript) {
    this._parent = parentScript
  }
}

function owoPageInit () {
  _owo.runCreated(this)
  // 递归处理
  function recursion (entry) {
    for (var key in entry.template) {
      var templateScript = entry.template[key]
      _owo.runCreated(templateScript)
      recursion(templateScript)
    }
  }
  recursion(this)
  
  
}

_owo.recursion = function (tempDom, callBack) {
  if (!callBack || callBack(tempDom)) {
    return
  }
  // 判断是否有子节点需要处理
  if (tempDom.children) {
    // 递归处理所有子Dom结点
    for (var i = 0; i < tempDom.children.length; i++) {
      // 获取子节点实例
      var childrenDom = tempDom.children[i]
      if (!childrenDom.hasAttribute('template') && !childrenDom.hasAttribute('view')) {
        _owo.recursion(childrenDom, callBack)
      }
    }
  } else {
    console.info('元素不存在子节点!')
    console.info(tempDom)
  }
}

/* owo事件处理 */
// 参数1: 当前正在处理的dom节点
// 参数2: 当前正在处理的模块名称
function handleEvent (moudleScript, enterDom) {
  var moudleScript = moudleScript || this
  var enterDom = enterDom || moudleScript.$el
  // 判断是否是继承父元素方法
  if (moudleScript._inherit){
    moudleScript = moudleScript._parent
  }
  if (!enterDom) return
  var tempDom = enterDom
  
  
  
  _owo.recursion(tempDom, function (childrenDom) {
    if (childrenDom.hasAttribute('o-for')) return true
    
    _owo.addEvent(childrenDom, moudleScript)
  })
  // 递归处理子模板
  for (var key in moudleScript.template) {
    moudleScript.template[key].$el = tempDom.querySelector('[template="' + key + '"]')
    moudleScript.template[key].$parent = moudleScript
    handleEvent(moudleScript.template[key])
  }
}

Page.prototype.owoPageInit = owoPageInit
Page.prototype.handleEvent = handleEvent
Page.prototype.query = function (str) {
  return this.$el.querySelector(str)
}
Page.prototype.queryAll = function (str) {
  return this.$el.querySelectorAll(str)
}
// 快速选择器
owo.query = function (str) {
  return document.querySelectorAll('.page[template=' + owo.activePage +'] ' + str)
}
_owo.addHTMLElementFun = function (name, func) {
  if (window.HTMLElement) {
    HTMLElement.prototype[name] = func
  } else {
    for (var ind=0; ind < document.all.length; ind++) {
      document.all[ind][name] = func
    }
  }
}
_owo.addHTMLElementFun('query', function(str) {
  return this.querySelector(str)
})





// 沙盒运行
function shaheRun (code) {
  try {
    return eval(code)
  } catch (error) {
    console.error(error)
    console.log('执行代码: ' + code)
    console.log('运行环境: ', this)
    return undefined
  }
}


/*
 * 传递函数给whenReady()
 * 当文档解析完毕且为操作准备就绪时，函数作为document的方法调用
 */
_owo.ready = (function() {               //这个函数返回whenReady()函数
  var funcs = [];             //当获得事件时，要运行的函数
  
  //当文档就绪时,调用事件处理程序
  function handler(e) {
    //如果发生onreadystatechange事件，但其状态不是complete的话,那么文档尚未准备好
    if(e.type === 'onreadystatechange' && document.readyState !== 'complete') {
      return
    }
    // 确保事件处理程序只运行一次
    if(window.owo.state.isRrady) return
    window.owo.state.isRrady = true
    
    // 运行所有注册函数
    for(var i=0; i<funcs.length; i++) {
      funcs[i].call(document);
    }
    funcs = null;
  }
  //为接收到的任何事件注册处理程序
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', handler, false)
    document.addEventListener('readystatechange', handler, false)            //IE9+
    window.addEventListener('load', handler, false)
  } else if(document.attachEvent) {
    document.attachEvent('onreadystatechange', handler)
    window.attachEvent('onload', handler)
  }
  //返回whenReady()函数
  return function whenReady (fn) {
    if (window.owo.state.isRrady) {
      fn.call(document)
    } else {
      funcs.push(fn)
    }
  }
})()

// 单页面-页面资源加载完毕事件
_owo.showPage = function() {
  for (var key in owo.script) {
    owo.script[key].$el = document.querySelector('.page[template="' + key + '"]')
    owo.script[key] = new Page(owo.script[key])
  }
  var firstPageList = document.querySelector('.page[template]')
  // 允许项目只有模块没有页面
  if (firstPageList) {
    owo.entry = firstPageList.getAttribute('template')
    // 查找入口
    if (!owo.script[owo.entry] || !owo.script[owo.entry].$el) {
      console.error('找不到页面入口!')
    } else {
      owo.activePage = owo.entry
      var activeScript = owo.script[owo.activePage]
      activeScript.owoPageInit()
      activeScript.handleEvent()
    }
  }
  // 处理插件
  var plugList = document.querySelectorAll('.owo-block')
  for (var ind = 0; ind < plugList.length; ind++) {
    var plugEL = plugList[ind]
    var plugName = plugEL.getAttribute('template')
    owo.script[plugName].$el = plugEL
    owo.script[plugName].owoPageInit()
    owo.script[plugName].handleEvent()
    plugEL.style.display = ''
  }
}

// 执行页面加载完毕方法
_owo.ready(_owo.showPage)



// 这是用于代码调试的自动刷新代码，他不应该出现在正式上线版本!
if ("WebSocket" in window) {
  // 打开一个 web socket
  if (!window._owo.ws) window._owo.ws = new WebSocket("ws://" + window.location.host)
  window._owo.ws.onmessage = function (evt) { 
    if (evt.data == 'reload') {
      location.reload()
    }
  }
  window._owo.ws.onclose = function() { 
    console.info('与服务器断开连接')
  }
} else {
  console.error('浏览器不支持WebSocket')
}

