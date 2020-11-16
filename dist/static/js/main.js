const serverIP = 'http://49.232.216.171:8006/'
// const serverIP = 'http://127.0.0.1:8006/'

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
  const pageData = owo.script.page.view.content.checkText.data
  data.forEach(item => {
    if (!pageData.findList[item['text']]) {
      pageData.findList[item['text']] = item
      pageData.findListArr.push(item)
      item.type = '正确成语'
      item.tips = `<h2 style="font-size: 20px;">${item['text']}</h2><h2 style="font-size: 20px;">[${item['pinyin2']}]</h2><p>释义：${item['interpretation']}</p><p>出处：${item['source']}</p><p>示例：${item['example']}</p>`
      // 如果词的类型为政治词语，不一致为错误，其他类型不一致为对应类型
      htmlData = htmlData.replace(new RegExp(item['text'], "gm"), `<span data-ind="${pageData.findListArr.length}" class="nrsh chengyu chengyu-base">${item['text']}</span>`)
    }
  })
  return htmlData
}

function chengyuPinyinHandle (htmlData, data) {
  // console.log(htmlData)
  const pageData = owo.script.page.view.content.checkText.data
  data.forEach(item => {
    if (!pageData.findList[item['like']]) {
      pageData.findList[item['like']] = item
      pageData.findListArr.push(item)
      item.type = '错误成语'
      item.tips = `<h2 style="font-size: 20px;">${item['text']}</h2><h2 style="font-size: 20px;">[${item['pinyin2']}]</h2><p>释义：${item['interpretation']}</p><p>出处：${item['source']}</p><p>示例：${item['example']}</p>`
      // 如果词的类型为政治词语，不一致为错误，其他类型不一致为对应类型
      htmlData = htmlData.replace(new RegExp(item['like'], "gm"), `<span data-ind="${pageData.findListArr.length}" class="nrsh chengyu chengyu-like">${item['like']}</span>`)
    }
  })
  return htmlData
}

function regexpHandle (htmlData, data) {
  // console.log(htmlData)
  const pageData = owo.script.page.view.content.checkText.data
  data.forEach(item => {
    if (!pageData.findList[item['like']]) {
      pageData.findList[item['like']] = item
      pageData.findListArr.push(item)
      if (item['likeNumber'] != 100) {
        item.type = '疑似错误'
        htmlData = htmlData.replace(new RegExp(item['like'], "gm"), `<span data-ind="${pageData.findListArr.length}" class="nrsh regexp regexp-like">${item['like']}</span>`)
      } else {
        htmlData = htmlData.replace(new RegExp(item['like'], "gm"), `<span data-ind="${pageData.findListArr.length}" class="nrsh regexp XiYu">${item['like']}</span>`)
      }
    }
  })
  return htmlData
}