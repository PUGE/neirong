owo.tool.remind = function (text, time) {
  if (!text) return
  time = time || 6000
  var alertBox = document.createElement('div')
  alertBox.style.cssText = 'position: fixed;top: -40px;transition: top 1s;background-color: red;width: 100%;z-index: 9;text-align: center;line-height: 40px;color: white;font-size: 16px;'
  alertBox.innerHTML = text
  document.body.insertBefore(alertBox, document.body.lastChild)
  setTimeout(function () {
    alertBox.style.top = '0px'
  }, 0)
  setTimeout(function () {
    alertBox.style.top = '-40px'
  }, time)
}