(function(window, document) {
  'use strict';

  const peedo = (function() {
    const cache = {}
    let path = location.pathname

    const onStateChange = e => {
      path = location.pathname
      setPage()
    }

    const loadPage = url => {
      window.history.pushState(null, null, url);

      if (cache[url]) {
        return setPage()
      }

      get(url, {})
    }
    
    const setPage = html => {
      let parser  = new window.DOMParser
      let newPage = cache[path] || parser.parseFromString(html, 'text/html')

      window.scrollTo(0, 0)

      document.title = newPage.title
      document.body.innerHTML = newPage.body.innerHTML
      
      if (! cache[path]) {
        cache[path] = newPage
      }
    }
  
    const onLinkClick = e => {
      if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) {
        return
      }
  
      let target = e.target
  
      while (target && target.localName !== 'a') {
        target = target.parentNode
      }
  
      if (target && target.host !== location.host) {
        return
      }
  
      loadPage(path = target.pathname)
      e.preventDefault()
    }
    
    const get = (url, callback) => {
      let request = new XMLHttpRequest()
  
      request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status !== 500) {
                setPage(request.responseText, request)
            }
            else {
                callback(null, request)
            }
        }
      }
  
      request.open('GET', url, true)
      request.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      request.send(null)
    }

    return {
      run() {
        document.addEventListener('click', onLinkClick)
        window.addEventListener('popstate', onStateChange)
      }
    }
  })()

  window.peedo = peedo
})(window, document)

document.addEventListener('DOMContentLoaded', peedo.run)