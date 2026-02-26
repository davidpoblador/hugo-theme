import 'instant.page'

// Share buttons: copy link
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-copy-link]')
  if (!btn) return
  e.stopImmediatePropagation()
  var url = btn.getAttribute('data-copy-link')
  navigator.clipboard.writeText(url).then(function () {
    // Swap icon to checkmark briefly, then revert
    var icon = btn.querySelector('svg')
    if (!icon) return
    var original = icon.outerHTML
    icon.outerHTML = '<svg class="' + icon.getAttribute('class') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    btn.classList.add('text-accent')
    setTimeout(function () {
      btn.querySelector('svg').outerHTML = original
      btn.classList.remove('text-accent')
    }, 1500)
  })
})

// Share buttons: native share (Web Share API)
// Show native share buttons only when browser supports it
if (navigator.share) {
  document.querySelectorAll('[data-native-share]').forEach(function (btn) {
    btn.classList.remove('hidden')
  })
}
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-native-share]')
  if (!btn) return
  if (navigator.share) {
    navigator.share({
      title: btn.getAttribute('data-share-title'),
      url: btn.getAttribute('data-share-url')
    })
  }
})

// Share buttons: Bluesky deep link on mobile
// On touch devices, try bluesky:// scheme to open compose in the app directly
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-bsky-deeplink]')
    if (!link) return
    e.preventDefault()
    var deepLink = link.getAttribute('data-bsky-deeplink')
    var webUrl = link.href
    // Try the deep link; fall back to web URL after timeout
    var didNavigate = false
    window.addEventListener('blur', function onBlur() {
      didNavigate = true
      window.removeEventListener('blur', onBlur)
    })
    window.location.href = deepLink
    setTimeout(function () {
      if (!didNavigate) {
        window.open(webUrl, '_blank', 'noopener,noreferrer')
      }
    }, 1500)
  })
}

// Share FAB toggle
;(function () {
  var toggle = document.getElementById('share-fab-toggle')
  var menu = document.getElementById('share-fab-menu')
  if (!toggle || !menu) return

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', String(!expanded))
    menu.classList.toggle('hidden')
    menu.classList.toggle('flex')
  })

  // Close FAB when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#share-fab')) {
      toggle.setAttribute('aria-expanded', 'false')
      menu.classList.add('hidden')
      menu.classList.remove('flex')
    }
  })

  // Hide FAB when inline share section is visible
  var fab = document.getElementById('share-fab')
  var inline = document.getElementById('share-inline')
  if (fab && inline) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        fab.style.opacity = entry.isIntersecting ? '0' : '1'
        fab.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto'
      })
    }, { threshold: 0.5 })
    observer.observe(inline)
  }
})()
