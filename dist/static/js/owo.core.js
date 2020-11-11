// Wed Nov 11 2020 18:07:49 GMT+0800 (GMT+08:00)
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
            
            if (attribute.name.slice(0, 8) == 'o-class-') {
              var bindClassName = attribute.name.slice(8)
              if (bindClassName) {
                var value = shaheRun.apply(moudleScript, [eventFor])
                if (Boolean(value)) {
                  tempDom.classList.add(bindClassName)
                } else {
                  tempDom.classList.remove(bindClassName)
                }
              }
            }
            
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





window.addEventListener("popstate", function(e) {
  // 修复有时候hash和view会同时变化无法刷新的问题
  setTimeout(function () {
    if (_owo.getarg(document.URL) !== owo.activePage) _owo.hashchange()
    _owo.getViewChange()
  }, 200);
}, false);


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



// 获取URL中的参数
_owo.getQueryVariable = function () {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  var temp = {}
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    temp[pair[0]] = pair[1];
  }
  return temp;
}


// 页面切换

_owo.animation = function (oldDom, newDom, animationIn, animationOut, forward) {
  if (!oldDom || !newDom) {
    console.error('错误的页面切换!', oldDom, newDom)
    return
  }
  // 没有动画处理 如果没有某些必须方法也不使用动画(IE)
  if (!animationIn || !animationOut || _owo.isIE) {
    if (oldDom) {
      // 隐藏掉旧的节点
      oldDom.style.display = 'none'
    }
    // 查找页面跳转后的page
    newDom.style.display = ''
    return
  }
  if (typeof animationIn == 'string') animationIn = animationIn.split('&&')
  if (typeof animationOut == 'string') animationOut = animationOut.split('&&')
  // 动画延迟
  var delay = 0
  // 获取父元素
  var parentDom = newDom.parentElement
  if (!oldDom) {
    console.error('旧页面不存在!')
  }
  oldDom.addEventListener("animationend", oldDomFun)
  newDom.addEventListener("animationend", newDomFun)
  
  oldDom.style.position = 'absolute'

  newDom.style.position = 'absolute'
  newDom.style.display = ''
  // 给即将生效的页面加上“未来”标识
  if (forward) {
    newDom.classList.add('owo-animation-forward')
  } else {
    oldDom.classList.add('owo-animation-forward')
  }
  // document.body.style.overflow = 'hidden'

  parentDom.style.perspective = '1200px'
  oldDom.classList.add('owo-animation')
  for (var ind =0; ind < animationIn.length; ind++) {
    var value = animationIn[ind]
    //判断是否为延迟属性
    if (value.slice(0, 5) == 'delay') {
      var tempDelay = parseInt(value.slice(5))
      if (delay < tempDelay)  delay = tempDelay
    }
    oldDom.classList.add('o-page-' + value)
  }

  newDom.classList.add('owo-animation')
  for (var ind =0; ind < animationOut.length; ind++) {
    var value = animationOut[ind]
    if (value.slice(0, 5) == 'delay') {
      var tempDelay = parseInt(value.slice(5))
      if (delay < tempDelay)  delay = tempDelay
    }
    newDom.classList.add('o-page-' + value)
  }
  // 旧DOM执行函数
  function oldDomFun (e) {
    // 排除非框架引起的结束事件
    // if (e.target.getAttribute('template') || e.target.getAttribute('route')) {
      // 移除监听
      oldDom.removeEventListener('animationend', oldDomFun, false)
      // 延迟后再清除，防止动画还没完成
      setTimeout(function () {
        oldDom.style.display = 'none'
        // console.log(oldDom)
        oldDom.style.position = ''
        oldDom.classList.remove('owo-animation')
        oldDom.classList.remove('owo-animation-forward')
        parentDom.style.perspective = ''
        // 清除临时设置的class
        for (var ind =0; ind < animationIn.length; ind++) {
          var value = animationIn[ind]
          oldDom.classList.remove('o-page-' + value)
        }
      }, delay);
    // }
  }

  // 新DOM执行函数
  function newDomFun () {
    // 移除监听
    newDom.removeEventListener('animationend', newDomFun, false)
    // 延迟后再清除，防止动画还没完成
    setTimeout(function () {
      // 清除临时设置的style
      newDom.style.position = '';
      newDom.classList.remove('owo-animation');
      newDom.classList.remove('owo-animation-forward');
      for (var ind =0; ind < animationOut.length; ind++) {
        var value = animationOut[ind]
        newDom.classList.remove('o-page-' + value);
      }
    }, delay);
  }
  owo.state._animation = null
}





_owo._event_if = function (tempDom, moudleScript) {
  // o-if处理
  var ifValue = tempDom.getAttribute('o-if')
  if (ifValue) {
    var temp = ifValue.replace(/ /g, '')
    var show = shaheRun.apply(moudleScript, [temp])
    if (!show) {
      tempDom.style.display = 'none'
      return false
    } else {
      tempDom.style.display = ''
    }
  }
  return true
}


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
  
  // 判断页面中是否有路由
  if (this.view) {
    if (!this.view._isCreated) {
      this.view._isCreated = true
      temp = []
      for (var viewName in this.view) {
        // 跳过系统添加的字段
        if (viewName[0] == '_') continue
        var routeList = this.view[viewName]
        this.view[viewName] = new View(routeList, viewName, this['$el'], this)
        temp.push(this.view[viewName])
      }
      _owo.getViewChange()
      this.view._list = temp
    } else {
      // 运行每个激活路由的show方法
      for (var index in this.view._list) {
        var routeItem = this.view._list[index]
        var pageObj = routeItem[routeItem._activeName]
        if (pageObj.show && pageObj.$el) routeItem[routeItem._activeName].show()
      }
    } 
  }
  
  
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
  
  // sdsddddddd
  if(!_owo._event_if(tempDom, moudleScript)) return
  
  
  
  if (moudleScript['forList']) {
    // 处理o-for
    for (var key in moudleScript['forList']) {
      var forItem = moudleScript['forList'][key];
      var forDomList = tempDom.querySelectorAll('[otemp-for="' + forItem['for'] + '"]')
      if (forDomList.length > 0) {
        forDomList[0].outerHTML = forItem.template
        for (var domIndex = 1; domIndex < forDomList.length; domIndex++) {
          forDomList[domIndex].remove()
        }
      }
    }
  }
  // 先处理o-for
  _owo.recursion(tempDom, function (tempDom) {
    
    // dd
    if(!_owo._event_if(tempDom, moudleScript)) return true
    
    var forValue = tempDom.getAttribute('o-for')
    if (forValue) {
      // console.log(new Function('a', 'b', 'return a + b'))
      var forEle = shaheRun.apply(moudleScript, [forValue])
      // 如果o-for不存在则隐藏dom
      if (!forEle || forEle.length == 0) return
      if (!moudleScript['forList']) moudleScript['forList'] = []
      
      moudleScript['forList'].push({
        "for": forValue,
        "children": forEle.length,
        "template": tempDom.outerHTML
      })

      tempDom.removeAttribute("o-for")
      var tempNode = tempDom.cloneNode(true)
      var outHtml = ''
      
      for (var key in forEle) {
        tempNode.setAttribute('otemp-for', forValue)
        var temp = tempNode.outerHTML
        var value = forEle[key];
        var tempCopy = temp
        // 获取模板插值
        var varList = _owo.cutStringArray(tempCopy, '{', '}')
        varList.forEach(element => {
          var forValue = new Function('value', 'key', 'return ' + element)
          // 默认变量
          tempCopy = tempCopy.replace('{' + element + '}', forValue.apply(moudleScript, [value, key]))
        })
        outHtml += tempCopy
      }
      tempDom.outerHTML = outHtml + ''
    }
  })
  
  _owo.recursion(tempDom, function (childrenDom) {
    if (childrenDom.hasAttribute('o-for')) return true
    
    // 22222
    if(!_owo._event_if(childrenDom, moudleScript)) return true
    
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


// 特殊类型
function View(routeList, viewName, entryDom, pageScript) {
  this._list = []
  this._viewName = viewName
  this.$el = entryDom.querySelector('[view="' + viewName +'"]')
  for (var routeInd = 0; routeInd < routeList.length; routeInd++) {
    var routeItem = routeList[routeInd]
    this._list[routeInd] = routeItem
    this._list[routeInd]._index = routeInd
    this._list[routeInd].$el = entryDom.querySelector('[view="' + viewName +'"] [route="' + routeItem._name +'"]')
    // 默认隐藏route
    this._list[routeInd].$el.setAttribute('route-active', 'false')
    // 错误处理
    if (!this._list[routeInd].$el) {
      console.error('找不到视窗 ' + viewName + ' 中的路由: ' + routeItem._name)
      break
    }
    this._list[routeInd] = new Page(this._list[routeInd], pageScript)
    this._list[routeInd].$el.setAttribute('route-ind', routeInd)
    this[routeItem._name] = this._list[routeInd]
  }
}

owo.state.routeBusy = false

View.prototype.showIndex = function (ind) {
  if (owo.state.routeBusy) return
  owo.state.routeBusy = true
  // 防止来回快速切换页面出问题
  if (owo.state[this._viewName + '_changeing']) return
  owo.state[this._viewName + '_changeing'] = true
  this._activeIndex = this._activeIndex
  var oldRoute = this._list[this._activeIndex]
  // 如果新旧路由和旧路由是一样的那么不做处理
  if (this._activeIndex == ind) {
    oldRoute.$el.setAttribute('route-active', 'true')
    owo.state[this._viewName + '_changeing'] = false
    owo.state.routeBusy = false
    return
  }
  var newRoute = this._list[ind]
  if (!newRoute) {console.error('导航到不存在的页面: ' + ind);return;}
  this["_activeName"] = newRoute._name
  this["_activeIndex"] = ind
  newRoute.owoPageInit()
  newRoute.handleEvent()
  if (oldRoute) {
    if (owo.state._animation || owo.globalAni) {
      var animationValue = owo.state._animation || owo.globalAni
      if (newRoute._index > oldRoute._index) _owo.animation(oldRoute.$el, newRoute.$el, animationValue.in, animationValue.out)
      else _owo.animation(oldRoute.$el, newRoute.$el, animationValue.backIn, animationValue.backOut)
    } else {
      _owo.animation(oldRoute.$el, newRoute.$el)
    }
    // 加个延时隐藏不然直接隐藏动画效果不好
    setTimeout(() => {
      owo.state[this._viewName + '_changeing'] = false
      oldRoute.$el.setAttribute('route-active', 'false')
    }, 800);
  } else {
    owo.state[this._viewName + '_changeing'] = false
  }
  newRoute.$el.setAttribute('route-active', 'true')
  owo.onViewChange()
}

View.prototype.showName = function (name) {
  if (owo.state.routeBusy) return
  owo.state.routeBusy = true
  // 防止来回快速切换页面出问题
  if (owo.state[this._viewName + '_changeing']) return
  owo.state[this._viewName + '_changeing'] = true

  var oldRoute = this[this._activeName]
  var newRoute = this[name]
  if (!newRoute) {console.error('导航到不存在的页面: ' + name);return;}
  // 如果新旧路由和旧路由是一样的那么不做处理
  if (this._activeName == name) {
    oldRoute.$el.setAttribute('route-active', 'true')
    owo.state[this._viewName + '_changeing'] = false
    return
  }
  // 根据index
  this["_activeName"] = newRoute._name
  this["_activeIndex"] = newRoute._index
  // 如果没有旧路由，那么直接显示新路由就行
  
  newRoute.owoPageInit()
  newRoute.handleEvent()
  if (oldRoute) {
    if (owo.state._animation || owo.globalAni) {
      var animationValue = owo.state._animation || owo.globalAni
      if (newRoute._index > oldRoute._index) _owo.animation(oldRoute.$el, newRoute.$el, animationValue.in, animationValue.out)
      else _owo.animation(oldRoute.$el, newRoute.$el, animationValue.backIn, animationValue.backOut)
    } else {
      _owo.animation(oldRoute.$el, newRoute.$el)
    }
    // 加个延时隐藏不然直接隐藏动画效果不好
    setTimeout(() => {
      owo.state[this._viewName + '_changeing'] = false
      oldRoute.$el.setAttribute('route-active', 'false')
      owo.state.routeBusy = false
    }, 800);
  } else {
    owo.state[this._viewName + '_changeing'] = false
    owo.state.routeBusy = false
  }
  newRoute.$el.setAttribute('route-active', 'true')
  owo.onViewChange()
}
View.prototype.owoPageInit = owoPageInit
View.prototype.handleEvent = handleEvent

owo.onViewChange = function () {}

_owo.getViewChange = function () {
  var activeScript = owo.script[owo.activePage]
  // 路由列表
  var viewList = activeScript.$el.querySelectorAll('[view]')
  // 获取url参数
  owo.state.urlVariable = _owo.getQueryVariable()
  for (var index = 0; index < viewList.length; index++) {
    var viewItem = viewList[index];
    var viewName = viewItem.getAttribute('view')
    var viewValue = owo.state.urlVariable['view-' + viewName]
    if (viewValue) {
      activeScript.view[viewName].showName(viewValue)
    } else {
      activeScript.view[viewName].showIndex(0)
    }
  }
}




owo.go = function (aniStr) {
  if (!aniStr || typeof aniStr !== 'string')  {
    console.error('owo.go的正确使用方法为: owo.go("页面名/URL参数/入场动画/离场动画/是否允许返回/返回入场动画/返回离场动画")')
    return
  }
  var target = aniStr.split('/')
  var config = {
    page: target[0],
    paramString: target[1],
    inAnimation: target[2],
    outAnimation: target[3],
    noBack: target[4],
    backInAnimation: target[5],
    backOutAnimation: target[6],
  }
  var paramString = ''
  var pageString = '#' + owo.activePage
  var activePageName = config.page || owo.activePage
  
  // 处理动画缩写
  if (config['ani']) {
    var temp = config['ani'].split('/')
    config.inAnimation = temp[0]
    config.outAnimation = temp[1]
  }
  // 待优化 不需要这段代码的情况不打包这段代码
  if (!config.inAnimation && !config.outAnimation) {
    if (owo.globalAni) {
      if (owo.globalAni["in"]) config.inAnimation =  owo.globalAni["in"]
      if (owo.globalAni.out) config.outAnimation = owo.globalAni.out
      if (owo.globalAni["backIn"]) config.backInAnimation = owo.globalAni["backIn"]
      if (owo.globalAni["backOut"]) config.backOutAnimation = owo.globalAni["backOut"]
    }
    if (owo.pageAni && owo.pageAni[activePageName]) {
      if (owo.pageAni[activePageName]["in"]) config.inAnimation = owo.pageAni[activePageName]["in"]
      if (owo.pageAni[activePageName]["out"]) config.outAnimation = owo.pageAni[activePageName]["out"]
      if (owo.pageAni[activePageName]["backIn"]) config.backInAnimation = owo.globalAni["backIn"]
      if (owo.pageAni[activePageName]["backOut"]) config.backOutAnimation = owo.globalAni["backOut"]
    }
  }
  if (config.inAnimation && config.outAnimation) {
    owo.state._animation = {
      "in": config.inAnimation,
      "out": config.outAnimation,
      "backIn": config.backInAnimation,
      "backOut": config.backOutAnimation,
      "forward": true
    }
  }
  if (config.page) {
    if (!owo.script[config.page]) {console.error("导航到不存在的页面: " + config.page); return}
    if (config.page != owo.activePage) pageString = '#' + config.page
  }
  if (config.paramString) {
    var search = _owo.getQueryVariable()
    var addSEarch = config.paramString.split('=')
    search[addSEarch[0]] = addSEarch[1]
    paramString = '?'
    for (var key in search) {
      var value = search[key]
      if (value) paramString += (paramString == '?' ?  '' : '&') + key + '=' + value
    }
  }
  // 防止在同一个页面刷新
  if (!paramString && !pageString) return
  // owo.state._animation = null
  // 判断是否支持history模式
  if (window.history && window.history.pushState) {
    if (config.noBack) {
      window.history.replaceState({
        url: window.location.href
      }, '', paramString + pageString)
    } else {
      window.history.pushState({
        url: window.location.href
      }, '', paramString + pageString)
    }

    if (config.page) _owo.hashchange()
    if (config.paramString) _owo.getViewChange()
  } else {
    if (config.noBack) {
      location.replace(paramString + pageString)
    } else {
      window.location.href = paramString + pageString
    }
  }
}


// 待修复 跳转返回没有了
var toList = document.querySelectorAll('[go]')
for (var index = 0; index < toList.length; index++) {
  var element = toList[index]
  element.onclick = function () {
    owo.go(this.attributes['go'].value)
  }
}

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

