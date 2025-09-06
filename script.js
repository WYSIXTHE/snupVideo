/** Utils **/
const $ = sel => document.querySelector(sel)
const $$ = sel => Array.from(document.querySelectorAll(sel))

const dbKey = 'videolinki.items.v1'

function loadItems(){
  try{ return JSON.parse(localStorage.getItem(dbKey)) || [] }catch{ return [] }
}
function saveItems(items){ localStorage.setItem(dbKey, JSON.stringify(items)) }

function fmtCount(n){
  const forms = ['film','filmy','filmów']
  const f = (n%10===1 && n%100!==11)?0:([2,3,4].includes(n%10) && ![12,13,14].includes(n%100)?1:2)
  return `${n} ${forms[f]}`
}

function parseUrl(raw){
  let url
  try{ url = new URL(raw) }catch{ return {type:'unknown', raw} }
  const host = url.hostname.replace('www.','')
  // YouTube
  if(host.includes('youtube.com') || host==='youtu.be'){
    let id = url.searchParams.get('v')
    if(!id && host==='youtu.be') id = url.pathname.slice(1)
    // Shorts
    if(!id && url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2]
    if(id){
      return {
        type:'youtube',
        embed:`https://www.youtube.com/embed/${id}`,
        thumb:`https://img.youtube.com/vi/${id}/hqdefault.jpg`
      }
    }
  }
  // Vimeo
  if(host.includes('vimeo.com')){
    const parts = url.pathname.split('/').filter(Boolean)
    const id = parts.find(p => /^\d+$/.test(p))
    if(id){
      return {
        type:'vimeo',
        embed:`https://player.vimeo.com/video/${id}`,
        thumb:null
      }
    }
  }
  // Bezpośrednie pliki wideo
  if(/[.](mp4|webm|ogg)(?:$|\?)/i.test(url.pathname)){
    return {type:'file', src:url.toString(), thumb:null}
  }
  // Fallback do iframe
  return {type:'iframe', embed:url.toString(), thumb:null}
}

function createId(){ return Math.random().toString(36).slice(2) }

/** State **/
let items = loadItems()
let currentId = null

/** Render **/
const grid = $('#grid')
const emptyState = $('#emptyState')
const countChip = $('#countChip')

function render(){
  grid.innerHTML = ''
  const q = $('#searchInput').value.trim().toLowerCase()
  const filtered = items.filter(it => it.title.toLowerCase().includes(q) || it.url.toLowerCase().includes(q))
  countChip.textContent = fmtCount(filtered.length)
  emptyState.classList.toggle('hidden', filtered.length>0)

  for(const it of filtered){
    const card = document.createElement('article')
    card.className = 'card'

    const thumb = document.createElement('div')
    thumb.className = 'thumb'
    const badge = document.createElement('span')
    badge.className = 'badge'
    badge.textContent = it.kind.toUpperCase()
    thumb.appendChild(badge)

    if(it.thumb){
      const img = document.createElement('img')
      img.loading = 'lazy'
      img.src = it.thumb
      img.alt = ''
      thumb.appendChild(img)
    } else {
      const ph = document.createElement('div')
      ph.className = 'ghost'
      ph.textContent = 'Brak miniatury'
      thumb.appendChild(ph)
    }

    const playWrap = document.createElement('div')
    playWrap.className = 'play'
    const playBtn = document.createElement('button')
    playBtn.title = 'Odtwórz'
    playWrap.appendChild(playBtn)
    thumb.appendChild(playWrap)

    const meta = document.createElement('div')
    meta.className = 'meta'
    meta.innerHTML = `<div class="title" title="${it.title}">${it.title}</div>
                      <div class="url" title="${it.url}">${it.url}</div>`

    card.appendChild(thumb)
    card.appendChild(meta)
    grid.appendChild(card)

    playBtn.addEventListener('click', () => openPlayer(it.id))
    thumb.addEventListener('dblclick', () => openPlayer(it.id))
  }
}

/** Player modal **/
const dlg = $('#player')
const playerBody = $('#playerBody')
const playerTitle = $('#playerTitle')
const playerSub = $('#playerSub')

function openPlayer(id){
  const it = items.find(x => x.id===id)
  if(!it) return
  currentId = id
  playerTitle.textContent = it.title
  playerSub.textContent = it.url
  playerBody.innerHTML = ''

  if(it.kind==='YOUTUBE' || it.kind==='VIMEO' || it.kind==='IFRAME'){
    const iframe = document.createElement('iframe')
    iframe.src = it.embed
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    iframe.allowFullscreen = true
    iframe.frameBorder = '0'
    playerBody.appendChild(iframe)
  } else if(it.kind==='FILE'){
    const video = document.createElement('video')
    video.src = it.src
    video.controls = true
    video.playsInline = true
    playerBody.appendChild(video)
    video.play().catch(()=>{})
  }
  dlg.showModal()
}

$('#closeBtn').addEventListener('click', () => dlg.close())
$('#deleteBtn').addEventListener('click', () => {
  if(!currentId) return
  items = items.filter(it => it.id!==currentId)
  saveItems(items)
  render()
  dlg.close()
})

/** Form **/
$('#addForm').addEventListener('submit', e => {
  e.preventDefault()
  const url = $('#urlInput').value.trim()
  const titleRaw = $('#titleInput').value.trim()
  if(!url) return

  const parsed = parseUrl(url)
  const rec = { id:createId(), url, title: titleRaw || url, createdAt: Date.now(), thumb:null, kind:'IFRAME' }

  if(parsed.type==='youtube'){
    rec.kind = 'YOUTUBE'; rec.embed = parsed.embed; rec.thumb = parsed.thumb
  } else if(parsed.type==='vimeo'){
    rec.kind = 'VIMEO'; rec.embed = parsed.embed
  } else if(parsed.type==='file'){
    rec.kind = 'FILE'; rec.src = parsed.src
  } else if(parsed.type==='iframe'){
    rec.kind = 'IFRAME'; rec.embed = parsed.embed
  } else {
    alert('Nieznany typ linku – spróbuj YouTube/Vimeo albo plik .mp4/.webm/.ogg')
    return
  }

  items.unshift(rec)
  saveItems(items)
  render()
  e.target.reset()
  $('#urlInput').focus()
})

$('#searchInput').addEventListener('input', render)

/** Import / Eksport / Wyczyść **/
$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], {type:'application/json'})
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'videolinki-export.json'
  a.click()
  URL.revokeObjectURL(a.href)
})

$('#importBtn').addEventListener('click', async () => {
  const inp = document.createElement('input')
  inp.type = 'file'; inp.accept = 'application/json'
  inp.onchange = async () => {
    const file = inp.files?.[0]
    if(!file) return
    const text = await file.text()
    try{
      const data = JSON.parse(text)
      if(Array.isArray(data)){
        // Prosty merge: nowe na wierzchu, bez duplikatów po URL
        const existing = new Set(items.map(i=>i.url))
        const cleaned = data.filter(d => d && d.url && !existing.has(d.url))
        items = [...cleaned, ...items]
        saveItems(items)
        render()
      } else {
        alert('Plik nie zawiera listy (array).')
      }
    }catch(err){
      alert('Błąd podczas importu: '+err.message)
    }
  }
  inp.click()
})

$('#clearBtn').addEventListener('click', () => {
  if(confirm('Na pewno usunąć wszystkie pozycje?')){
    items = []
    saveItems(items)
    render()
  }
})

// Inicjalizacja
render()
