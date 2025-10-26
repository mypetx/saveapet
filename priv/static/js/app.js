document.addEventListener('DOMContentLoaded', () => {
  console.log('=== APP.JS LOADED ===')
  console.log('DOMContentLoaded event fired')
  
  const apiBase = '/api'
  const formAuth = document.getElementById('form-auth')
  const btnSubmitAuth = document.getElementById('btn-submit-auth')
  const btnToggleRegister = document.getElementById('btn-toggle-register')
  const feed = document.getElementById('feed')
  const authSection = document.getElementById('auth')

  const formReport = document.getElementById('form-report')
  const btnSubmitReport = document.getElementById('btn-submit-report')

  const petsDiv = document.getElementById('pets')

  const msgModal = document.getElementById('msg-modal')
  const msgTo = document.getElementById('msg-to')
  const msgText = document.getElementById('msg-text')
  const btnSendMsg = document.getElementById('btn-send-msg')
  const btnCloseMsg = document.getElementById('btn-close-msg')

  const inboxModal = document.getElementById('inbox-modal')
  const inboxList = document.getElementById('inbox-list')
  const btnCloseInbox = document.getElementById('btn-close-inbox')

  let currentPetOwner = null
  let currentUser = null
  let reportMarker = null
  let map = null
  let currentPetDetail = null

  let isRegister = false

  // ensure only email/password shown on login
  function updateAuthFields(){
    const show = isRegister
    const elems = ['name','phone','city']
    elems.forEach(id => { const el = document.getElementById(id); if (!el) return; el.style.display = show ? 'block' : 'none' })
  }

  // initialize fields visibility
  updateAuthFields()

  btnToggleRegister.addEventListener('click', () => {
    isRegister = !isRegister
    document.getElementById('auth-title').innerText = isRegister ? 'Criar conta' : 'Entrar'
    btnSubmitAuth.innerText = isRegister ? 'Criar conta' : 'Entrar'
    btnToggleRegister.innerText = isRegister ? 'Já tenho conta' : 'Ainda não tem conta?'
    updateAuthFields()
  })

  btnSubmitAuth.addEventListener('click', async () => {
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const phone = document.getElementById('phone') ? document.getElementById('phone').value : null
    const city = document.getElementById('city') ? document.getElementById('city').value : null

    if (!email || !password) return alert('Preencha email e senha')

    if (isRegister) {
      const payload = { name, email, password }
      if (phone) payload.phone = phone
      if (city) payload.city = city
      const res = await fetch(`${apiBase}/register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        await afterLogin()
      } else {
        alert((data.details && JSON.stringify(data.details)) || data.error || 'Erro no cadastro')
      }
    } else {
      const res = await fetch(`${apiBase}/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        await afterLogin()
      } else {
        alert(data.error || 'Login falhou')
      }
    }
  })

  async function afterLogin(){
    console.log('afterLogin: called')
    authSection.style.display = 'none'
    // show new layout: map + feed + FAB
    const mapSection = document.getElementById('map-section')
    const feedSection = document.getElementById('feed')
    const fabButton = document.getElementById('fab-add-pet')
    
    if (!mapSection || !feedSection || !fabButton) {
      console.error('afterLogin: missing elements', { mapSection, feedSection, fabButton })
      alert('Erro: elementos da interface não encontrados')
      return
    }
    
    mapSection.style.display = 'block'
    feedSection.style.display = 'block'
    fabButton.style.display = 'block'
    
    console.log('afterLogin: sections displayed')
    
    await loadMe()
    renderHeaderButtons()
    await loadPets()
    
    // Inicializar mapa por último, depois que tudo está visível
    setTimeout(() => {
      console.log('afterLogin: calling initMap')
      initMap().catch(err => console.error('map init error:', err))
    }, 300)
  }
  // header actions rendering
  function ensureHeaderActions(){
    let actions = document.querySelector('.header-actions')
    if (!actions) {
      const brand = document.querySelector('.brand')
      actions = document.createElement('div')
      actions.className = 'header-actions'
      brand.appendChild(actions)
    }
    return actions
  }

  function renderHeaderButtons(){
    const actions = ensureHeaderActions()
    actions.innerHTML = ''
    // only render buttons when we have a logged user
    if (!currentUser) return

    // messages icon
    // const msgBtn = document.createElement('button')
    // msgBtn.className = 'btn icon'
    // msgBtn.title = 'Mensagens'
    // msgBtn.innerHTML = '✉️'
    // msgBtn.addEventListener('click', async () => {
    //   inboxModal.style.display='flex'
    //   await loadMessages()
    // })
    // actions.appendChild(msgBtn)

    // profile menu (Meu Perfil -> Editar perfil, Sair)
    const profWrap = document.createElement('div')
    profWrap.className = 'profile-menu'
    const profLabel = document.createElement('button')
    profLabel.className = 'btn profile-btn'
    profLabel.innerText = 'Meu Perfil'
    profLabel.addEventListener('click', (e) => {
      e.stopPropagation()
      const dd = profWrap.querySelector('.profile-dropdown')
      dd.style.display = dd.style.display === 'block' ? 'none' : 'block'
    })
    const dropdown = document.createElement('div')
    dropdown.className = 'profile-dropdown'
    dropdown.style.display = 'none'
    dropdown.innerHTML = `<div class='profile-item' id='hdr-edit-profile'>Editar perfil</div><div class='profile-item' id='hdr-logout'>Sair</div>`
    profWrap.appendChild(profLabel)
    profWrap.appendChild(dropdown)
    actions.appendChild(profWrap)

    // dropdown handlers
    profWrap.querySelector('#hdr-edit-profile').addEventListener('click', (ev) => { ev.stopPropagation(); openProfile(); profWrap.querySelector('.profile-dropdown').style.display='none' })
    profWrap.querySelector('#hdr-logout').addEventListener('click', (ev) => { ev.stopPropagation(); doLogout(); profWrap.querySelector('.profile-dropdown').style.display='none' })
    // click outside to close dropdown
    document.addEventListener('click', () => { const dd = profWrap.querySelector('.profile-dropdown'); if (dd) dd.style.display='none' })
  }

  function openProfile(){
    if (!currentUser) return alert('Faça login')
    document.getElementById('profile-name').value = currentUser.name || ''
    document.getElementById('profile-email').value = currentUser.email || ''
    document.getElementById('profile-phone').value = currentUser.phone || ''
    document.getElementById('profile-city').value = currentUser.city || ''
    document.getElementById('profile-password').value = ''
    document.getElementById('profile-modal').style.display = 'flex'
  }

  document.getElementById('btn-close-profile').addEventListener('click', () => document.getElementById('profile-modal').style.display = 'none')

  document.getElementById('btn-save-profile').addEventListener('click', async () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Faça login')
    const payload = {}
    const name = document.getElementById('profile-name').value
    const email = document.getElementById('profile-email').value
    const phone = document.getElementById('profile-phone').value
    const city = document.getElementById('profile-city').value
    const password = document.getElementById('profile-password').value
    if (name) payload.name = name
    if (email) payload.email = email
    if (phone) payload.phone = phone
    if (city) payload.city = city
    if (password) payload.password = password
    const res = await fetch(`${apiBase}/me`, { method: 'PATCH', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (res.ok && data.user) {
      currentUser = data.user
      document.getElementById('profile-modal').style.display = 'none'
      renderHeaderButtons()
      await loadMe()
      alert('Perfil atualizado')
    } else {
      alert((data.details && JSON.stringify(data.details)) || data.error || 'Erro ao atualizar')
    }
  })

  function doLogout(){
    localStorage.removeItem('token')
    currentUser = null
    // hide profile modal if open
    const pm = document.getElementById('profile-modal')
    if (pm) pm.style.display = 'none'
    // hide create pet modal if open
    const cm = document.getElementById('create-pet-modal')
    if (cm) cm.style.display = 'none'
    document.getElementById('auth').style.display = 'block'
    document.getElementById('map-section').style.display = 'none'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('fab-add-pet').style.display = 'none'
    const actions = document.querySelector('.header-actions')
    if (actions) actions.innerHTML = ''
  }

  // map
  async function initMap(){
    try{
      console.log('initMap: starting')
      
      // Verificar se Leaflet está disponível
      if (typeof L === 'undefined') {
        console.error('initMap: Leaflet library not loaded')
        alert('Erro: Biblioteca Leaflet não carregada. Recarregue a página.')
        return
      }
      
      // Se mapa já existe, apenas atualizar tamanho
      if (map) {
        console.log('initMap: map exists, invalidating size')
        map.invalidateSize()
        return
      }
      
      const mapEl = document.getElementById('map')
      if (!mapEl) {
        console.error('initMap: map element not found')
        alert('Erro: Elemento do mapa não encontrado')
        return
      }
      
      console.log('initMap: creating map instance')
      map = L.map('map').setView([-23.55, -46.63], 12)
      
      console.log('initMap: adding tile layer')
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)
      
      console.log('initMap: map created successfully')
      
      // Forçar re-render do mapa após um delay
      setTimeout(() => { 
        if (map) {
          console.log('initMap: forcing size recalculation')
          map.invalidateSize()
        }
      }, 500)
      
      // click to place marker for reporting
      map.on('click', function(e){
        const lat = e.latlng.lat.toFixed(6)
        const lng = e.latlng.lng.toFixed(6)
        const latInput = document.querySelector('[name="last_seen_lat"]')
        const lngInput = document.querySelector('[name="last_seen_lng"]')
        if (latInput && lngInput) { 
          latInput.value = lat
          lngInput.value = lng
          // Atualizar hint visual
          const hint = document.getElementById('location-hint')
          if (hint) hint.textContent = `${lat}, ${lng}`
        }
        if (reportMarker) map.removeLayer(reportMarker)
        reportMarker = L.marker([lat, lng], {
          draggable: true
        }).addTo(map)
        
        // Atualizar coordenadas quando arrastar o marcador
        reportMarker.on('dragend', function(event) {
          const pos = event.target.getLatLng()
          const newLat = pos.lat.toFixed(6)
          const newLng = pos.lng.toFixed(6)
          if (latInput) latInput.value = newLat
          if (lngInput) lngInput.value = newLng
          const hint = document.getElementById('location-hint')
          if (hint) hint.textContent = `${newLat}, ${newLng}`
        })
      })
      
    }catch(e){ 
      console.error('initMap: failed', e)
      alert('Erro ao inicializar mapa: ' + e.message)
    }
  }

  async function loadMe(){
    const token = localStorage.getItem('token')
    if (!token) return
    const res = await fetch(`${apiBase}/me`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok){
      const data = await res.json()
      currentUser = data.user
    } else {
      // token inválido, fazer logout
      doLogout()
    }
  }

  btnSubmitReport.addEventListener('click', async () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Faça login primeiro')
    // auto-geocode if lat/lng empty and address provided
    const latInput = document.querySelector('[name="last_seen_lat"]')
    const lngInput = document.querySelector('[name="last_seen_lng"]')
    const addrInput = document.querySelector('[name="address"]')
    if (( !latInput.value || !lngInput.value ) && addrInput && addrInput.value) {
      try {
        const q = encodeURIComponent(addrInput.value)
        const gres = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`, {
          headers: {
            'User-Agent': 'MeuPetx/1.0'
          }
        })
        if (gres.ok) {
          const results = await gres.json()
          if (results && results.length>0) {
            const place = results[0]
            if (latInput) latInput.value = place.lat
            if (lngInput) lngInput.value = place.lon
            if (reportMarker) map.removeLayer(reportMarker)
            reportMarker = L.marker([parseFloat(place.lat), parseFloat(place.lon)]).addTo(map)
            map.setView([parseFloat(place.lat), parseFloat(place.lon)], 15)
          }
        }
      } catch(e){ 
        console.warn('geocode failed before submit', e)
        // Não bloquear o envio se geocode falhar
      }
    }

    const fd = new FormData()
    Array.from(formReport.elements).forEach(el => {
      if (!el.name) return
      if (el.type === 'file') { if (el.files && el.files[0]) fd.append(el.name, el.files[0]) }
      else fd.append(el.name, el.value)
    })
    const res = await fetch(`${apiBase}/pets`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    const data = await res.json()
    if (data.pet) {
      alert('Post criado com sucesso!')
      formReport.reset()
      
      // Fechar modal e resetar UI
      document.getElementById('create-pet-modal').style.display = 'none'
      const hint = document.getElementById('location-hint')
      if (hint) hint.textContent = 'Clique no mapa ao lado para marcar'
      if (reportMarker) {
        map.removeLayer(reportMarker)
        reportMarker = null
      }
      
      loadPets()
    } else {
      alert(data.error || 'Erro ao criar post')
    }
  })

  // FAB button: open create pet modal
  const fabBtn = document.getElementById('fab-add-pet')
  console.log('FAB button element:', fabBtn)
  if (fabBtn) {
    console.log('Adding click listener to FAB')
    fabBtn.addEventListener('click', function(e) {
      e.preventDefault()
      e.stopPropagation()
      console.log('FAB CLICKED!')
      
      const createModal = document.getElementById('create-pet-modal')
      
      console.log('Create modal element:', createModal)
      
      if (createModal) {
        createModal.style.display = 'flex'
        console.log('Opened create modal')
      }
    })
    console.log('FAB listener added')
  } else {
    console.error('FAB button NOT FOUND')
  }

  // Botão fechar modal de criar post
  const btnCloseCreateModal = document.getElementById('btn-close-create-modal')
  if (btnCloseCreateModal) {
    btnCloseCreateModal.addEventListener('click', function() {
      document.getElementById('create-pet-modal').style.display = 'none'
      formReport.reset()
      const hint = document.getElementById('location-hint')
      if (hint) hint.textContent = 'Clique no mapa ao lado para marcar'
      if (reportMarker) {
        map.removeLayer(reportMarker)
        reportMarker = null
      }
    })
  }

  // Botão geocode (buscar endereço no mapa)
  const btnGeocode = document.getElementById('btn-geocode')
  if (btnGeocode) {
    btnGeocode.addEventListener('click', async function(e) {
      e.preventDefault()
      e.stopPropagation()
      
      const addrInput = document.querySelector('[name="address"]')
      
      if (!addrInput || !addrInput.value || addrInput.value.trim() === '') {
        return alert('Digite um endereço primeiro')
      }
      
      try {
        const q = encodeURIComponent(addrInput.value.trim())
        
        const gres = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`, {
          headers: {
            'User-Agent': 'MeuPetx/1.0'
          }
        })
        
        if (!gres.ok) {
          return alert('Erro ao buscar endereço. Tente novamente.')
        }
        
        const results = await gres.json()
        
        if (results && results.length > 0) {
          const place = results[0]
          const lat = parseFloat(place.lat).toFixed(6)
          const lng = parseFloat(place.lon).toFixed(6)
          
          const latInput = document.querySelector('[name="last_seen_lat"]')
          const lngInput = document.querySelector('[name="last_seen_lng"]')
          if (latInput) latInput.value = lat
          if (lngInput) lngInput.value = lng
          
          const hint = document.getElementById('location-hint')
          if (hint) hint.textContent = `${lat}, ${lng}`
          
          if (reportMarker) map.removeLayer(reportMarker)
          reportMarker = L.marker([lat, lng], { draggable: true }).addTo(map)
          map.setView([lat, lng], 15)
          
          // Atualizar coordenadas quando arrastar
          reportMarker.on('dragend', function(event) {
            const pos = event.target.getLatLng()
            const newLat = pos.lat.toFixed(6)
            const newLng = pos.lng.toFixed(6)
            if (latInput) latInput.value = newLat
            if (lngInput) lngInput.value = newLng
            if (hint) hint.textContent = `${newLat}, ${newLng}`
          })
        } else {
          alert('Endereço não encontrado')
        }
      } catch(e) {
        console.warn('Geocode error:', e)
        alert('Erro ao buscar endereço. Use o clique no mapa para marcar a localização.')
      }
    })
  }

  async function loadPets(){
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiBase}/pets`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!res.ok) return
    const data = await res.json()
    petsDiv.innerHTML = ''
    data.pets.forEach(p => {
      const card = document.createElement('div')
      card.className = 'pet-card'
      card.dataset.petId = p.id
      const img = document.createElement('img')
      img.src = p.photo_url || '/favicon.ico'
      const meta = document.createElement('div')
      meta.className = 'pet-meta'
      meta.innerHTML = `
        <strong>${p.name || 'Sem nome'}</strong>
        <div class='muted'>${p.species || ''} • ${p.breed || ''}</div>
        <div class='muted'>Status: ${p.status||''}</div>
        <div style='margin-top:8px; padding-top:8px; border-top:1px solid #e6e6ee'>
          <span style='font-size:13px; color:#6b7280'>💬 Ver detalhes e comentários</span>
        </div>
      `
      card.appendChild(img)
      card.appendChild(meta)
      card.addEventListener('click', function() {
        console.log('CARD CLICKED for pet:', p.name, p.id)
        openPetDetail(p)
      })
      petsDiv.appendChild(card)
      console.log('Card added for pet:', p.name)

      if (p.last_seen_lat && p.last_seen_lng && map) {
        const marker = L.marker([p.last_seen_lat, p.last_seen_lng]).addTo(map)
        marker.bindPopup(`<b>${p.name||'Pet'}</b><br>${p.species||''}<br>Status: ${p.status||''}`)
      }
    })
  }

  async function openPetDetail(pet){
    console.log('=== openPetDetail CALLED ===')
    console.log('Pet data:', pet)
    
    currentPetDetail = pet
    const modal = document.getElementById('pet-detail-modal')
    const content = document.getElementById('pet-detail-content')
    
    console.log('Modal element:', modal)
    console.log('Content element:', content)
    
    if (!modal || !content) {
      console.error('openPetDetail: modal elements not found!')
      alert('Erro: elementos do modal não encontrados')
      return
    }
    
    content.innerHTML = `
      <img src="${pet.photo_url||'/favicon.ico'}" style="width:100%; max-height:300px; object-fit:cover; border-radius:8px; margin-bottom:12px"/>
      <h2>${pet.name || 'Sem nome'}</h2>
      <p><strong>Espécie:</strong> ${pet.species||'N/A'} • <strong>Raça:</strong> ${pet.breed||'N/A'}</p>
      <p><strong>Cor:</strong> ${pet.color||'N/A'}</p>
      <p><strong>Status:</strong> ${pet.status||'N/A'}</p>
      <p><strong>Descrição:</strong> ${pet.description||'Sem descrição'}</p>
      <p><strong>Endereço:</strong> ${pet.address||'N/A'} ${pet.reference ? '('+pet.reference+')' : ''}</p>
      <div class="row"><button class="btn" id="detail-contact-owner">Entrar em contato</button></div>
    `
    
    console.log('Content populated, setting modal display to flex')
    modal.style.display = 'flex'
    console.log('Modal display set. Current style:', modal.style.display)
    
    console.log('Loading comments for pet:', pet.id)
    await loadPetComments(pet.id)
    
    // attach contact handler
    const contactBtn = content.querySelector('#detail-contact-owner')
    if (contactBtn) {
      console.log('Contact button found, adding listener')
      contactBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token')
        if (!token) { alert('Faça login'); return }
        currentPetOwner = { owner: pet.user_id, petId: pet.id }
        msgTo.innerText = `Para usuário ${pet.user_id} (pet ${pet.id})`
        msgModal.style.display = 'flex'
        modal.style.display = 'none'
      })
    }
    
    console.log('=== openPetDetail COMPLETE ===')
  }

  async function loadPetComments(petId){
    console.log('loadPetComments: loading for pet', petId)
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${apiBase}/pets/${petId}/comments`, { headers })
    if (!res.ok) {
      console.error('loadPetComments: fetch failed', res.status)
      return
    }
    const data = await res.json()
    console.log('loadPetComments: received data', data)
    const list = document.getElementById('pet-detail-comments')
    if (!list) {
      console.error('loadPetComments: comments container not found')
      return
    }
    list.innerHTML = ''
    
    // A API retorna array direto ou objeto com comments
    const comments = Array.isArray(data) ? data : (data.comments || [])
    console.log('loadPetComments: comments count', comments.length)
    
    if (comments.length === 0) {
      list.innerHTML = '<p class="muted">Nenhum comentário ainda.</p>'
      return
    }
    
    comments.forEach(c => {
      const el = document.createElement('div')
      el.className = 'comment'
      el.innerHTML = `<div class='muted small'>Usuário ${c.user_id} • ${new Date(c.inserted_at).toLocaleString()}</div><div>${c.body}</div>`
      list.appendChild(el)
    })
    console.log('loadPetComments: comments rendered')
  }

  const btnAddComment = document.getElementById('btn-add-pet-comment')
  console.log('Setting up comment button:', btnAddComment ? 'found' : 'NOT FOUND')
  
  btnAddComment && btnAddComment.addEventListener('click', async () => {
    console.log('btn-add-pet-comment: clicked')
    if (!currentPetDetail || !currentUser) {
      console.error('btn-add-pet-comment: missing pet or user', { currentPetDetail, currentUser })
      return alert('Faça login para comentar')
    }
    const textarea = document.getElementById('pet-detail-comment-input')
    const body = textarea.value
    if (!body) {
      console.warn('btn-add-pet-comment: empty comment')
      return alert('Digite um comentário')
    }
    console.log('btn-add-pet-comment: submitting comment', body)
    const token = localStorage.getItem('token')
    const payload = { comment: { body: body, user_id: currentUser.id } }
    const res = await fetch(`${apiBase}/pets/${currentPetDetail.id}/comments`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    const data = await res.json()
    console.log('btn-add-pet-comment: response', data)
    if (data.id) { 
      textarea.value = ''
      await loadPetComments(currentPetDetail.id)
      console.log('btn-add-pet-comment: comment added successfully')
    } else {
      console.error('btn-add-pet-comment: failed', data)
      alert('Erro ao comentar')
    }
  })

  const btnCloseDetail = document.getElementById('btn-close-pet-detail')
  console.log('Setting up close detail button:', btnCloseDetail ? 'found' : 'NOT FOUND')
  
  btnCloseDetail && btnCloseDetail.addEventListener('click', () => {
    document.getElementById('pet-detail-modal').style.display = 'none'
    currentPetDetail = null
  })
  
  // messages / inbox
  const conversationDiv = document.getElementById('conversation')

  // header message/button is rendered only after login via renderHeaderButtons

  btnCloseInbox && btnCloseInbox.addEventListener('click', () => { inboxModal.style.display='none'; conversationDiv.innerHTML=''; inboxList.innerHTML='' })

  async function loadMessages(){
    const token = localStorage.getItem('token')
    if (!token) return alert('Faça login')
    const res = await fetch(`${apiBase}/messages`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return
    const data = await res.json()
    inboxList.innerHTML = ''
    data.forEach(conv => {
      const el = document.createElement('div')
      el.className = 'conversation-item'
      el.innerHTML = `<div class='row'><strong>${conv.other_user_id}</strong><button class='btn open-conv' data-user='${conv.other_user_id}'>Abrir</button></div>`
      inboxList.appendChild(el)
    })
    document.querySelectorAll('.open-conv').forEach(b => b.addEventListener('click', async (ev) => {
      const userId = ev.currentTarget.getAttribute('data-user')
      await openConversation(userId)
    }))
  }

  async function openConversation(userId){
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiBase}/messages/conversation/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return
    const data = await res.json()
    conversationDiv.innerHTML = ''
    data.forEach(m => {
      const el = document.createElement('div')
      el.className = m.from_user_id == currentUser.id ? 'msg sent' : 'msg recv'
      el.innerText = `${m.message} \n\n <small class=\'muted\'>${m.inserted_at}</small>`
      conversationDiv.appendChild(el)
    })
    // send box
    const sendBox = document.createElement('div')
    sendBox.innerHTML = `<textarea id='conv-text'></textarea><div class='row'><button id='conv-send' class='btn primary'>Enviar</button></div>`
    conversationDiv.appendChild(sendBox)
    document.getElementById('conv-send').addEventListener('click', async () => {
      const txt = document.getElementById('conv-text').value
      const res = await fetch(`${apiBase}/messages`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ to_user_id: userId, message: txt }) })
      const r = await res.json()
      if (r.message) { await openConversation(userId) }
    })
  }

  btnCloseMsg.addEventListener('click', () => { msgModal.style.display = 'none'; msgText.value = '' })

  btnSendMsg.addEventListener('click', async () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Faça login')
    if (!currentPetOwner) return alert('Selecione um pet')
    const payload = { to_user_id: currentPetOwner.owner, pet_id: currentPetOwner.petId, message: msgText.value }
    const res = await fetch(`${apiBase}/messages`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (data.message) { alert('Mensagem enviada'); msgModal.style.display='none'; msgText.value = '' }
    else alert(data.error || 'erro')
  })

  // auto-login if token present
  if (localStorage.getItem('token')) {
    afterLogin().catch(err => console.error('auto-login failed', err))
  }

  // geocode helper and handler (bound outside initMap so it works when user clicks)
  console.log('=== ALL EVENT LISTENERS REGISTERED ===')
  console.log('App initialization complete')

})
