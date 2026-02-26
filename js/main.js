import 'instant.page'

// Share buttons: copy link
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-copy-link]')
  if (!btn) return
  var url = btn.getAttribute('data-copy-link')
  navigator.clipboard.writeText(url).then(function () {
    // Show text feedback if available (sidebar/inline)
    var feedback = btn.nextElementSibling
    if (feedback && feedback.tagName === 'SPAN') {
      feedback.classList.remove('opacity-0')
      setTimeout(function () { feedback.classList.add('opacity-0') }, 1500)
    }
    // Brief color flash on the button itself (works for FAB too)
    btn.classList.add('text-accent')
    setTimeout(function () { btn.classList.remove('text-accent') }, 1500)
  })
})

// Share buttons: native share (Web Share API)
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
