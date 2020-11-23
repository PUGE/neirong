const serverIP = 'http://49.232.216.171:8006/'
// const serverIP = 'http://127.0.0.1:8006/'
let findList = {}
let findListArr = []
let xiyuLike = []
let nrshID = 0

function nrReplaceAll(str, text, findListArrLen, classStr, xuexiStr){
  let returnData = ''
  let strCutArr = str.split(text)
  
  for (let index = 0; index < strCutArr.length; index++) {
    const element = strCutArr[index];
    nrshID ++
    if (index != strCutArr.length && index != 0) {
      if (xuexiStr) {
        xuexiArr = xuexiStr.split('|')
        const last = strCutArr[index - 1]
        const next = strCutArr[index]
        // 智能学习忽略
        if (last && xuexiArr.includes((last[last.length - 1] + text))) {
          console.log('智能学习忽略')
          returnData += text
        } else if (next && xuexiArr.includes((text + next[0]))) {
          
          console.log('智能学习忽略')
          returnData += text
        } else {
          returnData += `<span nrsh-id="${nrshID}" data-ind="${findListArrLen}" class="${classStr}">${text}</span>`
        }
      } else {
        returnData += `<span nrsh-id="${nrshID}" data-ind="${findListArrLen}" class="${classStr}">${text}</span>`
      }
    }
    returnData += element
  }
  return returnData;
}


function getErrorTypeText (errorCode) {
  switch (errorCode) {
    case 'Polity':
      return '政治'
      break;
    case 'Illegal':
      return '违法'
      break;
    case 'Porn':
      return '色情'
      break;
    case 'Abuse':
      return '粗俗'
      break;
    case 'Terror':
      return '恐怖'
      break;
    case 'Standard':
      return '错误表述'
      break;
    case 'Ad':
      return '广告'
      break;
    case 'XiYu':
      return '重点句子'
      break;
    case 'article':
      return '习语原文'
      break;
    default:
      return errorCode
      break;
  }
}

function chengyuBaseHandle (htmlData, data) {
  data.forEach(item => {
    if (!findList[item['text']]) {
      findList[item['text']] = item
      findListArr.push(item)
      item.type = '正确成语'
      item.tips = `<h2 style="font-size: 20px;">${item['text']}</h2><h2 style="font-size: 20px;">[${item['pinyin2']}]</h2><p>释义：${item['interpretation']}</p><p>出处：${item['source']}</p><p>示例：${item['example']}</p>`
      // 如果词的类型为政治词语，不一致为错误，其他类型不一致为对应类型
      htmlData = nrReplaceAll(htmlData, item['text'], findListArr.length, 'nrsh chengyu chengyu-base', item['xuexi'])
    }
  })
  return htmlData
}

function chengyuPinyinHandle (htmlData, data) {
  // console.log(htmlData)
  
  data.forEach(item => {
    if (!findList[item['like']]) {
      findList[item['like']] = item
      findListArr.push(item)
      item.type = '错误成语'
      item.tips = `<h2 style="font-size: 20px;">${item['text']}</h2><h2 style="font-size: 20px;">[${item['pinyin2']}]</h2><p>释义：${item['interpretation']}</p><p>出处：${item['source']}</p><p>示例：${item['example']}</p>`
      // 如果词的类型为政治词语，不一致为错误，其他类型不一致为对应类型
      htmlData = nrReplaceAll(htmlData, item['like'], findListArr.length, 'nrsh chengyu chengyu-like', item['xuexi'])
    }
  })
  return htmlData
}

function regularHandle (htmlData, data) {
  data.forEach(item => {
    if (!findList[item['text']]) {
      findList[item['text']] = item
      findListArr.push(item)
      item.type = '自定义错误'
      
      // 如果词的类型为政治词语，不一致为错误，其他类型不一致为对应类型
      htmlData = nrReplaceAll(htmlData, item['text'], findListArr.length, 'nrsh regular error', item['xuexi'])
    }
  })
  return htmlData
}

function baseHandle (htmlData, data) {
  // console.log(htmlData)
  data.forEach(item => {
    if (!findList[item['text']]) {
      findList[item['text']] = item
      findListArr.push(item)
      if (item.type === 'Standard') {
        htmlData = nrReplaceAll(htmlData, item['text'], findListArr.length, 'nrsh base Standard', item['xuexi'])
      } else {
        htmlData = nrReplaceAll(htmlData, item['text'], findListArr.length, `nrsh base ${item.type}`, item['xuexi'])
      }
    }
  })
  return htmlData
}

function pinyinHandle (htmlData, data) {
  // console.log(data)
  data.forEach(item => {
    if (!findList[item['like']]) {
      findList[item['like']] = item
      findListArr.push(item)
      // 如果词的类型为政治词语，不一致为错误，其他类型不一致为对应类型
      if (item.type === 'Polity') {
        htmlData = nrReplaceAll(htmlData, item['like'], findListArr.length, `nrsh like error`, item['xuexi'])
      } else {
        htmlData = nrReplaceAll(htmlData, item['like'], findListArr.length, `nrsh like ${item.type}`, item['xuexi'])
      }
    }
  })
  return htmlData
}

function networkHandle (htmlData, data) {
  // console.log(data)
  data.forEach(item => {
    if (!findList[item['HitInfo']]) {
      findList[item['HitInfo']] = item
      findListArr.push(item)
      htmlData = nrReplaceAll(htmlData, item['HitInfo'], findListArr.length, `nrsh`, item['xuexi'])
    } else {
      console.log(`${item['HitInfo']} 已被找出，跳过词语!`)
    }
  })
  return htmlData
}

function regexpHandle (htmlData, data) {
  data.forEach(item => {
    const likeStr = item['like']
    if (!findList[likeStr]) {
      findList[likeStr] = item
      findListArr.push(item)
      if (item['type'] == 'XiYu') {
        let isRight = false
        xiyuLike[likeStr].forEach(element => {
          if (element.likeNumber == 100) {
            isRight = true
          }
        })
        if (isRight) {
          htmlData = nrReplaceAll(htmlData, likeStr, findListArr.length, `nrsh XiYu`, item['xuexi'])
        } else {
          item.typeName = '相似习语'
          htmlData = nrReplaceAll(htmlData, likeStr, findListArr.length, `nrsh XiYu error`, item['xuexi'])
        }
      } else {
        item.typeName = '疑似错误'
        htmlData = nrReplaceAll(htmlData, likeStr, findListArr.length, `nrsh regexp regexp-like`, item['xuexi'])
      }
    }
  })
  return htmlData
}

// 排列函数
function compare(property) {
  return function(obj1,obj2){
      var value1 = obj1[property];
      var value2 = obj2[property];
      return value2 - value1;     // 降序
  }
}

function articleHandle(htmlData, articleArr) {
  let temp = {}
  articleArr.forEach(articleItem => {
    for (const likeText in articleItem['data']) {
      let itemArr = articleItem['data'][likeText]
      if (!temp[likeText]) temp[likeText] = []
      temp[likeText] = temp[likeText].concat(itemArr)
      
    }
  })
  for (const likeText in temp) {
    if (temp.hasOwnProperty(likeText)) {
      let itemArr = temp[likeText];
      itemArr = itemArr.sort(compare("likeNumber"))
      findList[likeText] = {
        type: "article",
        itemArr: itemArr,
        like: likeText
      }
      // console.log(itemArr)
      if (itemArr[0].likeNumber == 100) {
        htmlData = nrReplaceAll(htmlData, likeText, findListArr.length, `nrsh article`, '')
      } else {
        htmlData = nrReplaceAll(htmlData, likeText, findListArr.length, `nrsh article error`, '')
      }
    }
  }
  return htmlData
}

String.prototype.replaceAll = function (FindText, RepText) {
  regExp = new RegExp(FindText, "g");
  return this.replace(regExp, RepText);
}

function transformTime(timestamp = +new Date()) {
  if (timestamp) {
      var time = new Date(timestamp);
      var y = time.getFullYear();
      var M = time.getMonth() + 1;
      var d = time.getDate();
      var h = time.getHours();
      var m = time.getMinutes();
      var s = time.getSeconds();
      return y + '-' + addZero(M) + '-' + addZero(d) + ' ' + addZero(h) + ':' + addZero(m) + ':' + addZero(s);
    } else {
        return '';
    }
}
function addZero(m) {
  return m < 10 ? '0' + m : m;
}