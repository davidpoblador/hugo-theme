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

// Share buttons: app deep link on mobile
// On touch devices, try native app scheme (bluesky://, fb://) to open compose directly
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-app-deeplink]')
    if (!link) return
    e.preventDefault()
    var deepLink = link.getAttribute('data-app-deeplink')
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
    }, 1000)
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

// WebMCP: expose agent-invocable tools for reaching David.
// Specs: https://webmcp.org/ — tools are discovered by scanners on homepage load.
;(function () {
  if (!('modelContext' in navigator) || !navigator.modelContext) return

  var REACH_ENDPOINT = 'https://reach.poblador.com'
  var INTRO_URL = 'https://intro.co/DavidPobladoriGarcia'
  var ALLOWED_SITES = ['davidpoblador.com', 'es.davidpoblador.com', 'poblador.cat', 'poblador.se']

  function sourceSite() {
    var h = (location.hostname || '').toLowerCase().replace(/^www\./, '')
    return ALLOWED_SITES.indexOf(h) !== -1 ? h : null
  }

  navigator.modelContext.registerTool({
    name: 'contact_david',
    description:
      "Send a short message to David Poblador. Delivered to his personal inbox; he reads messages from agents but may not reply, typically responds within a few days. " +
      "Use only when the end-user explicitly wants to reach him — do not use for questions you can answer from his site. " +
      "Users may write in English, Spanish, Catalan, or Swedish; send the message in the user's language.",
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          minLength: 2,
          maxLength: 200,
          description: 'Name or handle of the person sending the message (not an email address).'
        },
        purpose: {
          type: 'string',
          maxLength: 200,
          description: 'One-line reason for reaching out (e.g. "Speaking invitation", "Collaboration request").'
        },
        message: {
          type: 'string',
          minLength: 40,
          maxLength: 4000,
          description: 'The message body. Be specific — David prioritises concrete asks over open-ended intros.'
        },
        reply_to: {
          type: 'string',
          format: 'email',
          description: 'Optional email address where David can reply.'
        }
      },
      required: ['from', 'purpose', 'message']
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    execute: async function (args) {
      var site = sourceSite()
      if (!site) {
        return { ok: false, error: 'This tool only runs on one of David\'s sites.' }
      }
      var body = {
        from: args.from,
        purpose: args.purpose,
        message: args.message,
        source_site: site
      }
      if (args.reply_to) body.reply_to = args.reply_to

      try {
        var res = await fetch(REACH_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        var data = await res.json().catch(function () { return null })
        if (!res.ok || !data || data.ok !== true) {
          return {
            ok: false,
            error: (data && data.error) || ('HTTP ' + res.status),
            field: data && data.field
          }
        }
        return {
          ok: true,
          submission_id: data.submission_id,
          note: data.note
        }
      } catch (err) {
        return { ok: false, error: 'network error: ' + (err && err.message ? err.message : String(err)) }
      }
    }
  })

  navigator.modelContext.registerTool({
    name: 'book_intro_call_with_david',
    description:
      "Return the booking URL for a PAID intro.co call with David Poblador. " +
      "intro.co charges for these consultations; the end-user will be asked to pay on the booking page. " +
      "Use only when the end-user explicitly wants a live advisory conversation and is prepared to pay. " +
      "For asynchronous written questions, use contact_david instead.",
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          maxLength: 200,
          description: 'Optional short description of what the end-user wants to discuss. Not sent to David — included in the tool response so you can present it back to the user.'
        }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    execute: async function (args) {
      return {
        ok: true,
        url: INTRO_URL,
        note: 'Paid booking via intro.co. Price and availability are shown on the booking page. David responds to accepted calls within a few days.',
        topic: (args && args.topic) || null
      }
    }
  })

  // Read-only tools backed by /agent.json (published by the home layout).
  var indexPromise = null
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch('/agent.json', { headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status)
          return r.json()
        })
        .catch(function (err) {
          indexPromise = null
          throw err
        })
    }
    return indexPromise
  }
  function indexError(err) {
    return { ok: false, error: 'index unavailable: ' + (err && err.message ? err.message : String(err)) }
  }
  function yearFromDate(s) {
    if (!s) return null
    var m = String(s).match(/^(\d{4})/)
    return m ? parseInt(m[1], 10) : null
  }

  navigator.modelContext.registerTool({
    name: 'get_about_david',
    description:
      'Return structured information about David Poblador — his role, affiliation, languages, photo, ' +
      'and the social/professional profiles and domains he publishes on. ' +
      "Use this to answer 'Who is David?', 'What does David do?', or 'Where can I follow David?'. " +
      'For writings, talks, or projects use list_davids_recent_posts, list_davids_appearances, or list_davids_projects.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    execute: async function () {
      try {
        var idx = await loadIndex()
        return { ok: true, site: idx.site, person: idx.person }
      } catch (err) { return indexError(err) }
    }
  })

  navigator.modelContext.registerTool({
    name: 'list_davids_recent_posts',
    description:
      "List recent blog posts by David with title, date, URL, tags, and description. " +
      "Entries include a markdown_url where available — fetch that to read the full post as clean markdown. " +
      "Use this for 'What has David written about X?' or 'What are David's latest posts?'.",
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 50, description: 'How many posts to return (default 10).' },
        since_year: { type: 'integer', minimum: 2000, maximum: 2100, description: 'Only return posts from this year or later.' }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    execute: async function (args) {
      try {
        var idx = await loadIndex()
        var posts = (idx.posts || []).slice()
        if (args && args.since_year) {
          posts = posts.filter(function (p) { var y = yearFromDate(p.date); return y !== null && y >= args.since_year })
        }
        var limit = (args && args.limit) || 10
        return { ok: true, posts: posts.slice(0, limit), total: posts.length }
      } catch (err) { return indexError(err) }
    }
  })

  navigator.modelContext.registerTool({
    name: 'list_davids_appearances',
    description:
      "List David's public appearances: talks, podcasts, press interviews, broadcast media, writing, and events. " +
      "Each entry has a title, outlet, date, language, type, and optional links. " +
      "Use this for 'Has David spoken about X?', 'What podcasts has David been on?', 'Where has David been quoted?'.",
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['talk', 'podcast', 'press', 'media', 'writing', 'event'],
          description: 'Filter by appearance type.'
        },
        lang: {
          type: 'string',
          enum: ['en', 'es', 'ca', 'sv'],
          description: 'Filter by the language the appearance was delivered in.'
        },
        since_year: { type: 'integer', minimum: 2000, maximum: 2100 },
        limit: { type: 'integer', minimum: 1, maximum: 200, description: 'Default 20.' }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    execute: async function (args) {
      try {
        var idx = await loadIndex()
        var items = (idx.portfolio || []).slice()
        if (args && args.type) items = items.filter(function (i) { return i.type === args.type })
        if (args && args.lang) items = items.filter(function (i) { return i.lang === args.lang })
        if (args && args.since_year) {
          items = items.filter(function (i) { var y = yearFromDate(i.date); return y !== null && y >= args.since_year })
        }
        var limit = (args && args.limit) || 20
        return { ok: true, items: items.slice(0, limit), total: items.length }
      } catch (err) { return indexError(err) }
    }
  })

  navigator.modelContext.registerTool({
    name: 'list_davids_projects',
    description:
      'List projects David has built or maintains — name, description, external link, and status (active, beta, archived). ' +
      "Use this for 'What is David building?' or 'What are David's side projects?'.",
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'beta', 'archived'],
          description: 'Filter by project status.'
        }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    execute: async function (args) {
      try {
        var idx = await loadIndex()
        var items = (idx.projects || []).slice()
        if (args && args.status) items = items.filter(function (p) { return p.status === args.status })
        return { ok: true, projects: items, total: items.length }
      } catch (err) { return indexError(err) }
    }
  })
})()
