const serverIP = 'http://49.232.216.171:8006/'
// const serverIP = 'http://127.0.0.1:8006/'
let findList = {}
let findListArr = []
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
      return '/重要句子'
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
      htmlData = htmlData.replace(new RegExp(item['text'], "gm"), `<span data-ind="${findListArr.length}" class="nrsh chengyu chengyu-base">${item['text']}</span>`)
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
      htmlData = htmlData.replace(new RegExp(item['like'], "gm"), `<span data-ind="${findListArr.length}" class="nrsh chengyu chengyu-like">${item['like']}</span>`)
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
        htmlData = htmlData.replace(new RegExp(item['text'], "gm"), `<span data-ind="${findListArr.length}" class="nrsh base Standard">${item['text']}</span>`)
      } else {
        htmlData = htmlData.replace(new RegExp(item['text'],"gm"), `<span data-ind="${findListArr.length}" class="nrsh base ${item.type}">${item['text']}</span>`)
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
        htmlData = htmlData.replace(new RegExp(item['like'], "gm"), `<span data-ind="${findListArr.length}" class="nrsh like error">${item['like']}</span>`)
      } else {
        htmlData = htmlData.replace(new RegExp(item['like'], "gm"), `<span data-ind="${findListArr.length}" class="nrsh like ${item.type}">${item['like']}</span>`)
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
      htmlData = htmlData.replace(new RegExp(item['HitInfo'],"gm"), `<span data-ind="${findListArr.length}" class="nrsh">${item['HitInfo']}</span>`)
    } else {
      console.log(`${item['HitInfo']} 已被找出，跳过词语!`)
    }
  })
  return htmlData
}

function regexpHandle (htmlData, data) {
  data.forEach(item => {
    if (!findList[item['like']]) {
      findList[item['like']] = item
      findListArr.push(item)
      if (item['likeNumber'] != 100) {
        item.type = '疑似错误'
        htmlData = htmlData.replace(new RegExp(item['like'], "gm"), `<span data-ind="${findListArr.length}" class="nrsh regexp regexp-like">${item['like']}</span>`)
      } else {
        htmlData = htmlData.replace(new RegExp(item['like'], "gm"), `<span data-ind="${findListArr.length}" class="nrsh regexp XiYu">${item['like']}</span>`)
      }
    }
  })
  return htmlData
}