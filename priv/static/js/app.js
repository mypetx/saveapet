document.addEventListener('DOMContentLoaded', () => {
  console.log('=== APP.JS LOADED ===')
  console.log('DOMContentLoaded event fired')
  
  // Initialize i18n
  if (typeof i18n !== 'undefined') {
    i18n.updatePage()
  }
  
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
  let userCity = null // Cidade do usuário baseada na geolocalização
  let currentPetDetail = null

  let isRegister = false

  // ensure only email/password shown on login
  function updateAuthFields(){
    const show = isRegister
    const elems = ['name','phone','city']
    elems.forEach(id => { const el = document.getElementById(id); if (!el) return; el.style.display = show ? 'block' : 'none' })
    
    // Show/hide password confirmation field
    const passwordConfirm = document.getElementById('password-confirm')
    if (passwordConfirm) {
      passwordConfirm.style.display = show ? 'block' : 'none'
    }
  }

  // initialize fields visibility
  updateAuthFields()

  btnToggleRegister.addEventListener('click', () => {
    isRegister = !isRegister
    document.getElementById('auth-title').innerText = isRegister ? i18n.t('register') : i18n.t('login')
    btnSubmitAuth.innerText = isRegister ? i18n.t('register') : i18n.t('login')
    btnToggleRegister.innerText = isRegister ? i18n.t('hasAccount') : i18n.t('noAccount')
    updateAuthFields()
  })

  btnSubmitAuth.addEventListener('click', async () => {
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value
    const phone = document.getElementById('phone') ? document.getElementById('phone').value : null
    const city = document.getElementById('city') ? document.getElementById('city').value : null

    if (!email || !password) return alert(i18n.t('fillAllFields'))

    if (isRegister) {
      // Validate password confirmation
      if (password !== passwordConfirm) {
        return alert(i18n.t('passwordMismatch'))
      }
      
      if (password.length < 6) {
        return alert(i18n.t('passwordTooShort') || 'Password must be at least 6 characters')
      }
      
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

  // Allow Enter key to submit login form
  formAuth.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      btnSubmitAuth.click()
    }
  })

  // Helper function to normalize text for comparison (remove accents, lowercase, trim)
  function normalizeText(text) {
    if (!text) return ''
    return text
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .trim()
  }

  // Helper function to get state abbreviation from full name
  function getStateAbbreviation(stateName) {
    if (!stateName) return null
    
    const stateMap = {
      'acre': 'AC',
      'alagoas': 'AL',
      'amapa': 'AP',
      'amazonas': 'AM',
      'bahia': 'BA',
      'ceara': 'CE',
      'distrito federal': 'DF',
      'espirito santo': 'ES',
      'goias': 'GO',
      'maranhao': 'MA',
      'mato grosso': 'MT',
      'mato grosso do sul': 'MS',
      'minas gerais': 'MG',
      'para': 'PA',
      'paraiba': 'PB',
      'parana': 'PR',
      'pernambuco': 'PE',
      'piaui': 'PI',
      'rio de janeiro': 'RJ',
      'rio grande do norte': 'RN',
      'rio grande do sul': 'RS',
      'rondonia': 'RO',
      'roraima': 'RR',
      'santa catarina': 'SC',
      'sao paulo': 'SP',
      'sergipe': 'SE',
      'tocantins': 'TO'
    }
    
    const normalized = normalizeText(stateName)
    return stateMap[normalized] || null
  }

  // Helper function to get current filter values from UI
  function getFilters() {
    const filters = {}
    
    // Get species filter
    const filterSpecies = document.getElementById('filter-species')
    if (filterSpecies && filterSpecies.value) {
      filters.species = filterSpecies.value
    }
    
    // Get city filter
    const filterCity = document.getElementById('filter-city')
    if (filterCity && filterCity.value.trim()) {
      filters.city = filterCity.value.trim()
    }
    
    // Get state filter
    const filterState = document.getElementById('filter-state')
    if (filterState && filterState.value) {
      filters.state = filterState.value
    }
    
    // Get status filters (only checked ones)
    const filterStatusCheckboxes = document.querySelectorAll('.filter-status')
    const checkedStatuses = Array.from(filterStatusCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value)
    
    if (checkedStatuses.length > 0 && checkedStatuses.length < 3) {
      filters.status = checkedStatuses
    }
    
    return filters
  }

  // Continue without login button
  const btnContinueWithoutLogin = document.getElementById('btn-continue-without-login')
  if (btnContinueWithoutLogin) {
    btnContinueWithoutLogin.addEventListener('click', () => {
      enterWithoutLogin()
    })
  }

  function enterWithoutLogin() {
    console.log('enterWithoutLogin: entering app without authentication')
    
    // Save state to persist across page reloads
    localStorage.setItem('viewMode', 'guest')
    
    // Clear saved filters when entering without login - always use current location
    localStorage.removeItem('lastFilterCity')
    localStorage.removeItem('lastFilterState')
    
    authSection.style.display = 'none'
    
    const mapSection = document.getElementById('map-section')
    const feedSection = document.getElementById('feed')
    const fabButton = document.getElementById('fab-add-pet')
    
    if (!mapSection || !feedSection) {
      console.error('enterWithoutLogin: missing elements', { mapSection, feedSection })
      alert('Erro: elementos da interface não encontrados')
      return
    }
    
    mapSection.style.display = 'block'
    feedSection.style.display = 'block'
    if (fabButton) fabButton.style.display = 'none' // Hide FAB button for non-logged users
    
    console.log('enterWithoutLogin: sections displayed')
    
    // Don't load user data
    currentUser = null
    
    // Render guest header with login button
    renderGuestHeaderButtons()
    
    // Clear filter inputs to ensure they don't show old values
    const filterCityInput = document.getElementById('filter-city')
    const filterStateSelect = document.getElementById('filter-state')
    const filterSpeciesInput = document.getElementById('filter-species')
    if (filterCityInput) filterCityInput.value = ''
    if (filterStateSelect) filterStateSelect.value = ''
    if (filterSpeciesInput) filterSpeciesInput.value = ''
    
    // Initialize map first
    console.log('enterWithoutLogin: calling initMap')
    
    // Wait for map initialization (which includes geolocation)
    initMap()
      .then(() => {
        console.log('enterWithoutLogin: map initialized, userCity:', userCity)
        
        // Build filters: use userCity directly if available
        const filters = {}
        if (userCity) {
          // Extract city only (without state)
          filters.city = userCity.split(',')[0].trim()
          console.log('enterWithoutLogin: auto-applying city filter:', filters.city)
        }
        
        console.log('enterWithoutLogin: loading pets with filters:', filters)
        loadPets(filters)
      })
      .catch(err => {
        console.error('enterWithoutLogin: map init error:', err)
        // Load all pets if map fails
        loadPets({})
      })
  }

  async function afterLogin(){
    console.log('afterLogin: called')
    
    // Clear guest mode and save authenticated state
    localStorage.removeItem('viewMode')
    // Clear saved filters when logging in - always use current location
    localStorage.removeItem('lastFilterCity')
    localStorage.removeItem('lastFilterState')
    
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
    
    // Clear filter inputs to ensure they don't show old values
    const filterCityInput = document.getElementById('filter-city')
    const filterStateSelect = document.getElementById('filter-state')
    const filterSpeciesInput = document.getElementById('filter-species')
    if (filterCityInput) filterCityInput.value = ''
    if (filterStateSelect) filterStateSelect.value = ''
    if (filterSpeciesInput) filterSpeciesInput.value = ''
    
    // Inicializar mapa primeiro
    console.log('afterLogin: calling initMap')
    await initMap().catch(err => console.error('map init error:', err))
    
    // Carregar pets após o mapa estar pronto
    console.log('afterLogin: loading pets, userCity:', userCity)
    
    // Always use current location when logging in
    const filters = {}
    if (userCity) {
      // Extract city only (without state)
      filters.city = userCity.split(',')[0].trim()
      console.log('afterLogin: auto-applying city filter from current location:', filters.city)
    }
    
    console.log('afterLogin: loading pets with filters:', filters)
    await loadPets(filters)
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
    
    // Preserve language selector
    const langSelector = actions.querySelector('.language-selector')
    actions.innerHTML = ''
    if (langSelector) {
      actions.appendChild(langSelector)
    }
    
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
    profLabel.innerText = i18n.t('myProfile')
    profLabel.addEventListener('click', (e) => {
      e.stopPropagation()
      const dd = profWrap.querySelector('.profile-dropdown')
      dd.style.display = dd.style.display === 'block' ? 'none' : 'block'
    })
    const dropdown = document.createElement('div')
    dropdown.className = 'profile-dropdown'
    dropdown.style.display = 'none'
    dropdown.innerHTML = `<div class='profile-item' id='hdr-edit-profile'>${i18n.t('editProfile')}</div><div class='profile-item' id='hdr-logout'>${i18n.t('logout')}</div>`
    profWrap.appendChild(profLabel)
    profWrap.appendChild(dropdown)
    actions.appendChild(profWrap)

    // dropdown handlers
    profWrap.querySelector('#hdr-edit-profile').addEventListener('click', (ev) => { ev.stopPropagation(); openProfile(); profWrap.querySelector('.profile-dropdown').style.display='none' })
    profWrap.querySelector('#hdr-logout').addEventListener('click', (ev) => { ev.stopPropagation(); doLogout(); profWrap.querySelector('.profile-dropdown').style.display='none' })
    // click outside to close dropdown
    document.addEventListener('click', () => { const dd = profWrap.querySelector('.profile-dropdown'); if (dd) dd.style.display='none' })
  }

  function renderGuestHeaderButtons(){
    const actions = ensureHeaderActions()
    
    // Preserve language selector
    const langSelector = actions.querySelector('.language-selector')
    actions.innerHTML = ''
    if (langSelector) {
      actions.appendChild(langSelector)
    }
    
    // Login button for guest users
    const loginBtn = document.createElement('button')
    loginBtn.className = 'btn primary'
    loginBtn.innerText = i18n.t('login')
    loginBtn.style.padding = '8px 20px'
    loginBtn.addEventListener('click', () => {
      returnToLogin()
    })
    actions.appendChild(loginBtn)
  }

  function returnToLogin(){
    // Clear guest mode
    localStorage.removeItem('viewMode')
    
    // Reset state
    currentUser = null
    const actions = document.querySelector('.header-actions')
    if (actions) {
      // Preserve language selector
      const langSelector = actions.querySelector('.language-selector')
      actions.innerHTML = ''
      if (langSelector) {
        actions.appendChild(langSelector)
      }
    }
    
    // Hide feed and map
    document.getElementById('map-section').style.display = 'none'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('fab-add-pet').style.display = 'none'
    
    // Show auth screen
    document.getElementById('auth').style.display = 'flex'
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
    localStorage.removeItem('viewMode')
    currentUser = null
    // hide profile modal if open
    const pm = document.getElementById('profile-modal')
    if (pm) pm.style.display = 'none'
    // hide create pet modal if open
    const cm = document.getElementById('create-pet-modal')
    if (cm) cm.style.display = 'none'
    document.getElementById('auth').style.display = 'flex'
    document.getElementById('map-section').style.display = 'none'
    document.getElementById('feed').style.display = 'none'
    document.getElementById('fab-add-pet').style.display = 'none'
    const actions = document.querySelector('.header-actions')
    if (actions) {
      // Preserve language selector
      const langSelector = actions.querySelector('.language-selector')
      actions.innerHTML = ''
      if (langSelector) {
        actions.appendChild(langSelector)
      }
    }
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
      
      const mapEl = document.getElementById('map')
      if (!mapEl) {
        console.error('initMap: map element not found')
        alert('Erro: Elemento do mapa não encontrado')
        return
      }
      
      // Se mapa já existe, resetar para localização atual
      if (map) {
        console.log('initMap: map exists, resetting to current location')
        
        // Get current location and update map
        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                console.log('initMap: geolocation success (map exists)', { lat, lng })
                
                // Move map to current location
                map.setView([lat, lng], 13)
                
                // Get city from reverse geocoding
                try {
                  const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`)
                  if (geoRes.ok) {
                    const geoData = await geoRes.json()
                    if (geoData.address) {
                      const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.municipality
                      const state = geoData.address.state
                      
                      if (city && state) {
                        userCity = `${city}, ${state}`
                      } else if (city) {
                        userCity = city
                      }
                      
                      console.log('initMap: user location updated:', userCity)
                    }
                  }
                } catch(e) {
                  console.warn('initMap: reverse geocoding failed', e)
                }
                
                resolve()
              },
              (error) => {
                console.error('initMap: geolocation failed', error)
                resolve()
              }
            )
          })
        }
        
        map.invalidateSize()
        return
      }
      
      console.log('initMap: creating map instance')
      // Coordenadas padrão (São Paulo) caso geolocalização falhe
      map = L.map('map').setView([-23.55, -46.63], 12)
      
      console.log('initMap: adding tile layer')
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)
      
      console.log('initMap: map created successfully')
      
      // Tentar obter localização atual do usuário
      if (navigator.geolocation) {
        console.log('initMap: requesting geolocation')
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude
              const lng = position.coords.longitude
              console.log('initMap: geolocation success', { lat, lng })
              
              // Centralizar mapa na localização atual
              map.setView([lat, lng], 13)
              
              // Adicionar marcador na localização atual (opcional)
              L.marker([lat, lng], {
                isCurrentLocation: true,
                icon: L.divIcon({
                  className: 'current-location-marker',
                  html: '📍',
                  iconSize: [30, 30]
                })
              }).addTo(map).bindPopup('Você está aqui')
              
              // Obter cidade através de geocodificação reversa (Nominatim)
              try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`)
                if (geoRes.ok) {
                  const geoData = await geoRes.json()
                  if (geoData.address) {
                    const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.municipality
                    const state = geoData.address.state
                    
                    // Build user city with state to be more specific
                    if (city && state) {
                      userCity = `${city}, ${state}`
                    } else if (city) {
                      userCity = city
                    }
                    
                    console.log('initMap: user location detected:', userCity)
                    
                    // Note: Filter inputs are NOT updated here
                    // They will be cleared in afterLogin() and only show current location
                  }
                }
              } catch (err) {
                console.warn('initMap: reverse geocoding failed', err)
              }
              
              resolve()
            },
            (error) => {
              console.warn('initMap: geolocation error', error.message)
              // Continua com localização padrão
              resolve()
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          )
        })
      } else {
        console.warn('initMap: geolocation not supported')
      }
      
      // Forçar re-render do mapa
      if (map) {
        console.log('initMap: forcing size recalculation')
        map.invalidateSize()
      }
      
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

  // Custom file input - show file name
  const photoInput = document.getElementById('photo-input')
  const fileNameSpan = document.getElementById('file-name')
  if (photoInput && fileNameSpan) {
    photoInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        fileNameSpan.textContent = this.files[0].name
      } else {
        fileNameSpan.textContent = ''
      }
    })
  }

  btnSubmitReport.addEventListener('click', async () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Faça login primeiro')
    
    const isEditing = currentEditingPet !== null
    
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
    
    // Add _method for Phoenix Plug.MethodOverride when editing
    if (isEditing) {
      fd.append('_method', 'PATCH')
    }
    
    const url = isEditing ? `${apiBase}/pets/${currentEditingPet.id}` : `${apiBase}/pets`
    const method = isEditing ? 'POST' : 'POST' // Use POST for both, _method will handle PATCH
    
    console.log('Submitting pet:', { isEditing, url, method })
    
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd })
    const data = await res.json()
    
    console.log('Response:', { status: res.status, data })
    
    if (data.pet) {
      alert(isEditing ? i18n.t('postUpdated') : i18n.t('postCreated'))
      formReport.reset()
      
      // Reset editing state
      currentEditingPet = null
      const modal = document.getElementById('create-pet-modal')
      const title = modal.querySelector('h3')
      const submitBtn = document.getElementById('btn-submit-report')
      if (title) title.textContent = 'Criar postagem'
      if (submitBtn) submitBtn.textContent = 'Criar'
      
      // Fechar modal e resetar UI
      modal.style.display = 'none'
      const hint = document.getElementById('location-hint')
      if (hint) hint.textContent = 'Clique no mapa ao lado para marcar'
      if (reportMarker) {
        map.removeLayer(reportMarker)
        reportMarker = null
      }
      
      // Recarregar pets com os filtros atuais
      const filters = getFilters()
      loadPets(filters)
    } else {
      const errorMsg = data.error || (isEditing ? 'Erro ao atualizar post' : 'Erro ao criar post')
      const details = data.details ? JSON.stringify(data.details) : ''
      alert(errorMsg + (details ? '\n' + details : ''))
      console.error('Submit error:', data)
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
      const modal = document.getElementById('create-pet-modal')
      modal.style.display = 'none'
      formReport.reset()
      
      // Reset editing state
      currentEditingPet = null
      const title = modal.querySelector('h3')
      const submitBtn = document.getElementById('btn-submit-report')
      if (title) title.textContent = 'Criar postagem'
      if (submitBtn) submitBtn.textContent = 'Criar'
      
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

  window.loadPets = async function(filters = {}){
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiBase}/pets`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!res.ok) {
      console.error('loadPets: fetch failed', res.status)
      return
    }
    const data = await res.json()
    
    console.log(`loadPets: fetched ${data.pets.length} pets from API`)
    console.log('loadPets: filters received =', filters)
    
    // Atualizar campos de filtro na UI se filtros foram passados
    if (filters.city) {
      const cityFilterInput = document.getElementById('filter-city')
      if (cityFilterInput && !cityFilterInput.value) {
        cityFilterInput.value = filters.city
      }
    }
    
    if (filters.state) {
      const stateFilterSelect = document.getElementById('filter-state')
      if (stateFilterSelect && !stateFilterSelect.value) {
        stateFilterSelect.value = filters.state
      }
    }
    
    // Mostrar mensagem informativa se tem filtro ativo
    const filterInfo = document.getElementById('filter-info')
    if (filterInfo) {
      if (filters.city || filters.state || filters.species) {
        const parts = []
        if (filters.city) parts.push(filters.city)
        if (filters.state && !filters.city) parts.push(filters.state)
        if (filters.species) parts.push(filters.species)
        filterInfo.textContent = `📍 ${i18n.t('showingPetsFrom')} ${parts.join(', ')}`
        filterInfo.style.display = 'block'
      } else {
        filterInfo.style.display = 'none'
      }
    }
    
    // Apply filters
    let filteredPets = data.pets
    
    // Filter by species
    if (filters.species) {
      filteredPets = filteredPets.filter(p => p.species && p.species.toLowerCase().includes(filters.species.toLowerCase()))
    }
    
    // Filter by city (with normalization to handle accents and case)
    // Also searches in state to differentiate cities with same name (e.g., "Bonito, MS" vs "Bonito, PE")
    if (filters.city) {
      const normalizedFilterCity = normalizeText(filters.city)
      filteredPets = filteredPets.filter(p => {
        if (!p.city && !p.state) return false
        
        // Build full location string: "city, state"
        const locationParts = []
        if (p.city) locationParts.push(p.city)
        if (p.state) locationParts.push(p.state)
        const fullLocation = locationParts.join(', ')
        
        const normalizedFullLocation = normalizeText(fullLocation)
        const normalizedPetCity = normalizeText(p.city || '')
        const normalizedPetState = normalizeText(p.state || '')
        
        // Match if filter appears in city, state, or full location
        return normalizedFullLocation.includes(normalizedFilterCity) ||
               normalizedPetCity.includes(normalizedFilterCity) ||
               normalizedPetState.includes(normalizedFilterCity)
      })
      console.log(`loadPets: filtered by city '${filters.city}': ${filteredPets.length} pets`)
    }
    
    // Filter by state
    if (filters.state) {
      filteredPets = filteredPets.filter(p => p.state && p.state === filters.state)
      console.log(`loadPets: filtered by state '${filters.state}': ${filteredPets.length} pets`)
    }
    
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filteredPets = filteredPets.filter(p => filters.status.includes(p.status))
    }
    
    petsDiv.innerHTML = ''
    
    // Clear existing pet markers (but keep current location marker)
    if (map) {
      map.eachLayer(function (layer) {
        if (layer instanceof L.Marker && !layer.options.icon && !layer.options.isCurrentLocation) {
          map.removeLayer(layer)
        }
      })
    }
    
    // Group pets by location for markers
    const petsByLocation = {}
    
    filteredPets.forEach(p => {
      const card = document.createElement('div')
      card.className = 'pet-card'
      card.dataset.petId = p.id
      card.style.position = 'relative'
      
      const img = document.createElement('img')
      img.src = p.photo_url || '/favicon.ico'
      
      // Check if current user is the owner
      const isOwner = currentUser && currentUser.id === p.user_id
      
      // Add menu button if owner
      if (isOwner) {
        const menuBtn = document.createElement('button')
        menuBtn.className = 'card-menu-btn'
        menuBtn.innerHTML = '⋮'
        menuBtn.onclick = function(e) {
          e.stopPropagation()
          toggleCardMenu(p.id)
        }
        
        const menuDropdown = document.createElement('div')
        menuDropdown.className = 'card-menu-dropdown'
        menuDropdown.id = `menu-${p.id}`
        menuDropdown.style.display = 'none'
        menuDropdown.innerHTML = `
          <div class="card-menu-item" data-action="edit" data-pet-id="${p.id}">✏️ ${i18n.t('edit')}</div>
          <div class="card-menu-item card-menu-danger" data-action="delete" data-pet-id="${p.id}">🗑️ ${i18n.t('delete')}</div>
        `
        
        card.appendChild(menuBtn)
        card.appendChild(menuDropdown)
      }
      
      const meta = document.createElement('div')
      meta.className = 'pet-meta'
      
      // Build location string
      let locationStr = ''
      if (p.city) {
        locationStr = p.city
        if (p.state) locationStr += `, ${p.state}`
        if (p.country && p.country !== 'Brasil') locationStr += ` - ${p.country}`
      }
      
      // Status badge styling based on status
      let statusClass = 'status-badge'
      let statusEmoji = '📌'
      if (p.status && p.status.toLowerCase().includes('encontrado')) {
        statusClass += ' status-found'
        statusEmoji = '✅'
      } else if (p.status && p.status.toLowerCase().includes('perdido')) {
        statusClass += ' status-lost'
        statusEmoji = '🔍'
      }
      
      meta.innerHTML = `
        <strong>${p.name || i18n.t('noName')}</strong>
        <div class='muted'>${p.species || ''} • ${p.breed || i18n.t('breed')}</div>
        <div class='${statusClass}'>${statusEmoji} ${i18n.t(p.status?.toLowerCase()) || p.status || i18n.t('noStatus')}</div>
        ${locationStr ? `<div class='muted' style='margin-top:4px'>📍 ${locationStr}</div>` : ''}
        <div style='margin-top:8px; padding-top:8px; border-top:1px solid #e6e6ee'>
          <span style='font-size:13px; color:#6b7280'>💬 ${i18n.t('viewDetailsAndComments')}</span>
        </div>
      `
      card.appendChild(img)
      card.appendChild(meta)
      card.addEventListener('click', function(e) {
        // Don't open detail if clicking on menu
        if (e.target.closest('.card-menu-btn') || e.target.closest('.card-menu-dropdown')) {
          return
        }
        console.log('CARD CLICKED for pet:', p.name, p.id)
        openPetDetail(p)
      })
      petsDiv.appendChild(card)
      console.log('Card added for pet:', p.name)

      // Group pets by location for markers
      if (p.last_seen_lat && p.last_seen_lng && map) {
        const locationKey = `${p.last_seen_lat.toFixed(6)},${p.last_seen_lng.toFixed(6)}`
        if (!petsByLocation[locationKey]) {
          petsByLocation[locationKey] = {
            lat: p.last_seen_lat,
            lng: p.last_seen_lng,
            pets: []
          }
        }
        petsByLocation[locationKey].pets.push(p)
      }
    })
    
    // Create markers for each location with grouped pets
    Object.values(petsByLocation).forEach(location => {
      const { lat, lng, pets } = location
      
      console.log(`Creating marker at ${lat},${lng} for ${pets.length} pet(s)`)
      
      const marker = L.marker([lat, lng]).addTo(map)
      
      // Build popup content
      let popupContent = '<div style="max-width:250px;">'
      
      if (pets.length === 1) {
        const p = pets[0]
        let locationStr = ''
        if (p.city) {
          locationStr = p.city
          if (p.state) locationStr += `, ${p.state}`
        }
        
        popupContent += `
          <div style="text-align:center;">
            <b>${p.name||'Pet'}</b><br>
            ${p.species||''} ${p.breed ? '• ' + p.breed : ''}<br>
            <span style="color:#666;">${i18n.t('status')}: ${i18n.t(p.status?.toLowerCase()) || p.status || ''}</span><br>
            ${locationStr ? `<span style="color:#666; font-size:12px;">📍 ${locationStr}</span><br>` : ''}
            <button onclick="window.openPetFromMap(${p.id})" style="margin-top:8px; padding:6px 12px; background:#ff6f61; color:white; border:none; border-radius:6px; cursor:pointer; font-size:13px;">${i18n.t('viewDetails')}</button>
          </div>
        `
      } else {
        // Multiple pets at same location
        popupContent += `<div style="text-align:center; margin-bottom:10px;"><b>${pets.length} ${i18n.t('petsAtLocation')}</b></div>`
        
        pets.forEach((p, idx) => {
          popupContent += `
            <div style="border-top:${idx > 0 ? '1px solid #eee' : 'none'}; padding:8px 0; text-align:center;">
              <b>${p.name||'Pet'}</b><br>
              <span style="font-size:13px; color:#666;">${p.species||''} ${p.breed ? '• ' + p.breed : ''}</span><br>
              <span style="font-size:12px; color:#999;">${i18n.t('status')}: ${i18n.t(p.status?.toLowerCase()) || p.status || ''}</span><br>
              <button onclick="window.openPetFromMap(${p.id})" style="margin-top:6px; padding:4px 10px; background:#ff6f61; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">${i18n.t('viewDetails')}</button>
            </div>
          `
        })
      }
      
      popupContent += '</div>'
      
      marker.bindPopup(popupContent)
      
      // Click on marker opens popup
      marker.on('click', function() {
        this.openPopup()
      })
    })
    
    console.log(`loadPets: rendered ${filteredPets.length} pet cards and markers`)
    
    // Attach menu item handlers
    document.querySelectorAll('.card-menu-item').forEach(item => {
      item.addEventListener('click', async function(e) {
        e.stopPropagation()
        const action = this.getAttribute('data-action')
        const petId = parseInt(this.getAttribute('data-pet-id'))
        const pet = data.pets.find(p => p.id === petId)
        
        // Close menu
        document.querySelectorAll('.card-menu-dropdown').forEach(m => m.style.display = 'none')
        
        if (action === 'edit' && pet) {
          openEditPetModal(pet)
        } else if (action === 'delete' && pet) {
          if (!confirm(i18n.t('confirmDeletePost'))) return
          
          const token = localStorage.getItem('token')
          if (!token) { alert('Faça login'); return }
          
          try {
            const res = await fetch(`${apiBase}/pets/${petId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            })
            
            if (res.ok) {
              alert(i18n.t('postDeleted'))
              // Recarregar pets com os filtros atuais
              const filters = getFilters()
              await loadPets(filters)
            } else {
              const data = await res.json()
              alert(data.error || 'Erro ao excluir post')
            }
          } catch (e) {
            console.error('Delete error:', e)
            alert('Erro ao excluir post')
          }
        }
      })
    })
  }
  
  function toggleCardMenu(petId) {
    const menu = document.getElementById(`menu-${petId}`)
    const isVisible = menu.style.display === 'block'
    
    // Close all menus first
    document.querySelectorAll('.card-menu-dropdown').forEach(m => m.style.display = 'none')
    
    // Toggle current menu
    if (!isVisible) {
      menu.style.display = 'block'
    }
  }
  
  // Close menus when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.card-menu-btn') && !e.target.closest('.card-menu-dropdown')) {
      document.querySelectorAll('.card-menu-dropdown').forEach(m => m.style.display = 'none')
    }
  })

  // Global function to open pet from map marker
  window.openPetFromMap = async function(petId) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiBase}/pets/${petId}`, { 
      headers: token ? { Authorization: `Bearer ${token}` } : {} 
    })
    if (res.ok) {
      const data = await res.json()
      openPetDetail(data.pet)
    } else {
      alert('Erro ao carregar detalhes do pet')
    }
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
    
    // Build location string
    let locationStr = ''
    if (pet.city) {
      locationStr = pet.city
      if (pet.state) locationStr += `, ${pet.state}`
      if (pet.country) locationStr += ` - ${pet.country}`
    }
    
    // Build contact info
    let contactInfo = '<div style="background:#f0f9ff; padding:12px; border-radius:8px; margin-top:12px; border-left:3px solid var(--accent)">'
    contactInfo += `<h3 style="margin:0 0 8px 0; font-size:16px; color:#0369a1">📞 ${i18n.t('contactInformation')}</h3>`
    
    if (pet.owner_name) {
      contactInfo += `<p style="margin:4px 0"><strong>${i18n.t('name')}:</strong> ${pet.owner_name}</p>`
    }
    
    if (pet.owner_email) {
      contactInfo += `<p style="margin:4px 0"><strong>${i18n.t('email')}:</strong> <a href="mailto:${pet.owner_email}" style="color:var(--accent)">${pet.owner_email}</a></p>`
    }
    if (pet.owner_phone) {
      contactInfo += `<p style="margin:4px 0"><strong>${i18n.t('phone')}:</strong> <a href="tel:${pet.owner_phone}" style="color:var(--accent)">${pet.owner_phone}</a></p>`
    }
    
    if (!pet.owner_name && !pet.owner_email && !pet.owner_phone) {
      contactInfo += `<p style="margin:4px 0; color:#6b7280">${i18n.t('contactInfoNotAvailable')}</p>`
    }
    
    contactInfo += '</div>'
    
    content.innerHTML = `
      <img src="${pet.photo_url||'/favicon.ico'}" style="width:100%; max-height:300px; object-fit:cover; border-radius:8px; margin-bottom:12px"/>
      <h2>${pet.name || i18n.t('noName')}</h2>
      <p><strong>${i18n.t('species')}:</strong> ${pet.species||'N/A'} • <strong>${i18n.t('breed')}:</strong> ${pet.breed||'N/A'}</p>
      <p><strong>${i18n.t('color')}:</strong> ${pet.color||'N/A'}</p>
      <p><strong>${i18n.t('status')}:</strong> ${i18n.t(pet.status?.toLowerCase()) || pet.status || 'N/A'}</p>
      ${locationStr ? `<p><strong>${i18n.t('location')}:</strong> ${locationStr}</p>` : ''}
      <p><strong>${i18n.t('description')}:</strong> ${pet.description || i18n.t('noDescription')}</p>
      <p><strong>${i18n.t('address')}:</strong> ${pet.address||'N/A'} ${pet.reference ? '('+pet.reference+')' : ''}</p>
      ${contactInfo}
    `
    
    console.log('Content populated, setting modal display to flex')
    modal.style.display = 'flex'
    console.log('Modal display set. Current style:', modal.style.display)
    
    // Hide comment input if user not logged in
    const commentInput = document.getElementById('pet-detail-comment-input')
    const commentButton = document.getElementById('btn-add-pet-comment')
    
    if (!currentUser) {
      if (commentInput) commentInput.style.display = 'none'
      if (commentButton) commentButton.style.display = 'none'
      
      // Show login button
      const commentSection = commentInput?.parentElement
      if (commentSection && !document.getElementById('login-comment-msg')) {
        const loginMsg = document.createElement('div')
        loginMsg.id = 'login-comment-msg'
        loginMsg.style.cssText = 'background:#fef3c7; padding:16px; border-radius:8px; text-align:center; margin-top:12px'
        loginMsg.innerHTML = `
          <p style="margin:0 0 12px 0; color:#92400e; font-weight:500">🔒 ${i18n.t('toCommentLoginRequired')}</p>
          <button onclick="goToLogin()" class="btn primary" style="padding:8px 24px; font-size:14px">${i18n.t('makeLogin')}</button>
        `
        commentSection.appendChild(loginMsg)
      }
    } else {
      if (commentInput) commentInput.style.display = 'block'
      if (commentButton) commentButton.style.display = 'inline-block'
      const loginMsg = document.getElementById('login-comment-msg')
      if (loginMsg) loginMsg.remove()
    }
    
    console.log('Loading comments for pet:', pet.id)
    await loadPetComments(pet.id)
    
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
    
    // Atualizar contador de comentários
    const countBadge = document.getElementById('comments-count')
    if (countBadge) {
      countBadge.textContent = comments.length === 0 ? '' : `${comments.length}`
    }
    
    if (comments.length === 0) {
      list.innerHTML = `<p class="muted" style="text-align:center; padding:20px">${i18n.t('noCommentsBeFirst')} 💭</p>`
      return
    }
    
    comments.forEach(c => {
      const el = document.createElement('div')
      el.className = 'comment-bubble'
      el.setAttribute('data-comment-id', c.id)
      
      // Verificar se o comentário pertence ao usuário atual
      const isOwner = currentUser && c.user_id === currentUser.id
      
      // Mostrar indicador de editado se o comentário foi modificado
      const editedLabel = c.edited ? '<span class="comment-edited">(editado)</span>' : ''
      
      el.innerHTML = `
        <div>
          <div class="comment-header">
            <span class="comment-author">${c.user_name || 'Usuário ' + c.user_id}</span>
            <span class="comment-time">${new Date(c.inserted_at).toLocaleString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit',
              hour: '2-digit', 
              minute: '2-digit' 
            })} ${editedLabel}</span>
            ${isOwner ? `
              <div class="comment-actions">
                <button class="btn-comment-action" onclick="editComment(${c.id}, '${c.body.replace(/'/g, "\\'")}')">✏️</button>
                <button class="btn-comment-action" onclick="deleteComment(${c.id})">🗑️</button>
              </div>
            ` : ''}
          </div>
          <div class="comment-body" id="comment-body-${c.id}">${c.body}</div>
        </div>
      `
      list.appendChild(el)
    })
    console.log('loadPetComments: comments rendered')
    
    // Auto scroll para o final
    setTimeout(() => {
      list.scrollTop = list.scrollHeight
    }, 100)
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

  // Edit pet functionality
  let currentEditingPet = null

  function openEditPetModal(pet) {
    currentEditingPet = pet
    const modal = document.getElementById('create-pet-modal')
    const title = modal.querySelector('h3')
    const submitBtn = document.getElementById('btn-submit-report')
    
    // Change modal title
    if (title) title.textContent = i18n.t('editPost')
    if (submitBtn) submitBtn.textContent = i18n.t('update')
    
    // Pre-fill form with pet data
    formReport.querySelector('[name="name"]').value = pet.name || ''
    formReport.querySelector('[name="species"]').value = pet.species || ''
    formReport.querySelector('[name="breed"]').value = pet.breed || ''
    formReport.querySelector('[name="color"]').value = pet.color || ''
    formReport.querySelector('[name="status"]').value = pet.status || ''
    formReport.querySelector('[name="description"]').value = pet.description || ''
    formReport.querySelector('[name="address"]').value = pet.address || ''
    formReport.querySelector('[name="reference"]').value = pet.reference || ''
    formReport.querySelector('[name="city"]').value = pet.city || ''
    formReport.querySelector('[name="state"]').value = pet.state || ''
    formReport.querySelector('[name="country"]').value = pet.country || 'Brasil'
    formReport.querySelector('[name="last_seen_lat"]').value = pet.last_seen_lat || ''
    formReport.querySelector('[name="last_seen_lng"]').value = pet.last_seen_lng || ''
    
    // Clear file name display
    const fileNameSpan = document.getElementById('file-name')
    if (fileNameSpan) fileNameSpan.textContent = ''
    
    // Update location hint
    const hint = document.getElementById('location-hint')
    if (hint && pet.last_seen_lat && pet.last_seen_lng) {
      hint.textContent = `${pet.last_seen_lat}, ${pet.last_seen_lng}`
    }
    
    // Add marker on map if coordinates exist
    if (pet.last_seen_lat && pet.last_seen_lng && map) {
      if (reportMarker) {
        map.removeLayer(reportMarker)
      }
      reportMarker = L.marker([pet.last_seen_lat, pet.last_seen_lng]).addTo(map)
      map.setView([pet.last_seen_lat, pet.last_seen_lng], 15)
    }
    
    modal.style.display = 'flex'
  }

  // Filters functionality
  const btnApplyFilters = document.getElementById('btn-apply-filters')
  const btnClearFilters = document.getElementById('btn-clear-filters')
  const filterSpecies = document.getElementById('filter-species')
  const filterCity = document.getElementById('filter-city')
  const filterStatusCheckboxes = document.querySelectorAll('.filter-status')

  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', async () => {
      const filters = getFilters()
      console.log('Applying filters:', filters)
      
      // Save filters to localStorage for persistence
      if (filters.city) {
        localStorage.setItem('lastFilterCity', filters.city)
      }
      if (filters.state) {
        localStorage.setItem('lastFilterState', filters.state)
      }
      
      loadPets(filters)
      
      // Move map to filtered city
      if (filters.city) {
        try {
          const cityQuery = filters.state 
            ? `${filters.city}, ${filters.state}, Brasil`
            : `${filters.city}, Brasil`
          const q = encodeURIComponent(cityQuery)
          const gres = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}`, {
            headers: {
              'User-Agent': 'SaveAPet/1.0'
            }
          })
          if (gres.ok) {
            const results = await gres.json()
            if (results && results.length > 0) {
              const place = results[0]
              map.setView([parseFloat(place.lat), parseFloat(place.lon)], 12)
              console.log(`Map moved to ${filters.city}`)
            }
          }
        } catch(e) {
          console.warn('Failed to geocode city for map:', e)
        }
      }
    })
  }

  if (btnClearFilters) {
    btnClearFilters.addEventListener('click', () => {
      // Clear all filters
      if (filterSpecies) filterSpecies.value = ''
      if (filterCity) filterCity.value = ''
      
      const filterState = document.getElementById('filter-state')
      if (filterState) filterState.value = ''
      
      filterStatusCheckboxes.forEach(cb => cb.checked = true)
      
      // Clear saved filters from localStorage
      localStorage.removeItem('lastFilterCity')
      localStorage.removeItem('lastFilterState')
      
      // Reload pets with only the city (without state filter)
      const filters = {}
      
      if (userCity) {
        // Extract only city name (without state)
        const cityOnly = userCity.split(',')[0].trim()
        filters.city = cityOnly
        
        // Set city in the filter input
        if (filterCity) filterCity.value = cityOnly
        
        // Save the cleared city to localStorage
        localStorage.setItem('lastFilterCity', cityOnly)
      }
      
      // Note: State filter is left empty (showing "Todos")
      
      loadPets(filters)
    })
  }

  // Apply filters on Enter key in city input
  if (filterCity) {
    filterCity.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const filters = getFilters()
        loadPets(filters)
      }
    })
  }

  // auto-login if token present, restore guest mode, or show auth screen
  const token = localStorage.getItem('token')
  const viewMode = localStorage.getItem('viewMode')
  
  if (token) {
    // User has token, attempt auto-login
    afterLogin().catch(err => {
      console.error('auto-login failed', err)
      // If auto-login fails, clear token and show auth screen
      localStorage.removeItem('token')
      localStorage.removeItem('viewMode')
    })
  } else if (viewMode === 'guest') {
    // User was viewing as guest, restore that state
    console.log('Restoring guest view mode')
    enterWithoutLogin()
  } else {
    // Show auth screen by default
    console.log('No token found, showing auth screen')
  }

  // geocode helper and handler (bound outside initMap so it works when user clicks)
  console.log('=== ALL EVENT LISTENERS REGISTERED ===')
  console.log('App initialization complete')

})

// Global functions for comment actions
window.editComment = function(commentId, currentBody) {
  const commentBody = document.getElementById(`comment-body-${commentId}`)
  if (!commentBody) return
  
  // Verificar se já está em modo de edição
  if (commentBody.querySelector('textarea')) return
  
  const originalText = commentBody.textContent
  
  // Criar textarea e botões de ação
  commentBody.innerHTML = `
    <textarea id="edit-textarea-${commentId}" style="width:100%; min-height:60px; resize:vertical; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:14px; font-family:inherit">${originalText}</textarea>
    <div style="display:flex; gap:8px; margin-top:8px">
      <button onclick="saveEditComment(${commentId})" class="btn primary" style="padding:6px 16px; font-size:13px">${i18n.t('save')}</button>
      <button onclick="cancelEditComment(${commentId}, '${originalText.replace(/'/g, "\\'")}' )" class="btn" style="padding:6px 16px; font-size:13px">${i18n.t('cancel')}</button>
    </div>
  `
  
  // Focar no textarea
  const textarea = document.getElementById(`edit-textarea-${commentId}`)
  if (textarea) {
    textarea.focus()
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
  }
}

window.cancelEditComment = function(commentId, originalText) {
  const commentBody = document.getElementById(`comment-body-${commentId}`)
  if (commentBody) {
    commentBody.textContent = originalText
  }
}

window.saveEditComment = async function(commentId) {
  const textarea = document.getElementById(`edit-textarea-${commentId}`)
  if (!textarea) return
  
  const newBody = textarea.value.trim()
  if (!newBody) return alert('O comentário não pode estar vazio')
  
  const token = localStorage.getItem('token')
  if (!token) return alert('Você precisa estar logado')
  
  // Desabilitar textarea e botão durante o salvamento
  textarea.disabled = true
  const saveBtn = textarea.nextElementSibling?.querySelector('button')
  if (saveBtn) saveBtn.disabled = true
  
  const res = await fetch(`/api/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ comment: { body: newBody } })
  })
  
  if (res.ok) {
    const updatedComment = await res.json()
    // Atualizar o comentário na tela
    const commentBody = document.getElementById(`comment-body-${commentId}`)
    if (commentBody) {
      commentBody.textContent = updatedComment.body
      
      // Adicionar indicador de editado
      const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`)
      if (commentEl) {
        const timeSpan = commentEl.querySelector('.comment-time')
        if (timeSpan && !timeSpan.innerHTML.includes('(editado)')) {
          timeSpan.innerHTML += ' <span class="comment-edited">(editado)</span>'
        }
      }
    }
  } else {
    const error = await res.json()
    alert(error.error || 'Erro ao editar comentário')
    
    // Reabilitar em caso de erro
    textarea.disabled = false
    if (saveBtn) saveBtn.disabled = false
  }
}

window.deleteComment = async function(commentId) {
  if (!confirm(i18n.t('confirmDeleteComment'))) return
  
  const token = localStorage.getItem('token')
  if (!token) return alert('Você precisa estar logado')
  
  const res = await fetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  
  if (res.ok) {
    // Remover o comentário da tela
    const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`)
    if (commentEl) {
      commentEl.remove()
      
      // Atualizar contador
      const list = document.getElementById('pet-detail-comments')
      const remaining = list.querySelectorAll('.comment-bubble').length
      const countBadge = document.getElementById('comments-count')
      if (countBadge) {
        countBadge.textContent = remaining === 0 ? '' : `${remaining}`
      }
      
      // Mostrar mensagem se não houver mais comentários
      if (remaining === 0) {
        list.innerHTML = '<p class="muted" style="text-align:center; padding:20px">Nenhum comentário ainda. Seja o primeiro a comentar! 💭</p>'
      }
    }
  } else {
    const error = await res.json()
    alert(error.error || 'Erro ao excluir comentário')
  }
}

// Global function to go back to login
window.goToLogin = function() {
  // Close any open modals
  const petDetailModal = document.getElementById('pet-detail-modal')
  if (petDetailModal) petDetailModal.style.display = 'none'
  
  const createPetModal = document.getElementById('create-pet-modal')
  if (createPetModal) createPetModal.style.display = 'none'
  
  // Hide feed and map
  const feedSection = document.getElementById('feed')
  const mapSection = document.getElementById('map-section')
  const fabButton = document.getElementById('fab-add-pet')
  
  if (feedSection) feedSection.style.display = 'none'
  if (mapSection) mapSection.style.display = 'none'
  if (fabButton) fabButton.style.display = 'none'
  
  // Show auth section
  const authSection = document.getElementById('auth')
  if (authSection) authSection.style.display = 'flex'
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Listen for language changes
window.addEventListener('languageChanged', () => {
  // Update auth button states
  const authTitle = document.getElementById('auth-title')
  const btnSubmitAuth = document.getElementById('btn-submit-auth')
  const btnToggleRegister = document.getElementById('btn-toggle-register')
  
  if (authTitle && btnSubmitAuth && btnToggleRegister) {
    const isReg = btnSubmitAuth.innerText !== i18n.t('login')
    authTitle.innerText = isReg ? i18n.t('register') : i18n.t('login')
    btnSubmitAuth.innerText = isReg ? i18n.t('register') : i18n.t('login')
    btnToggleRegister.innerText = isReg ? i18n.t('hasAccount') : i18n.t('noAccount')
  }
  
  // Update header buttons (this recreates the menu with new translations)
  const token = localStorage.getItem('token')
  const viewMode = localStorage.getItem('viewMode')
  
  const actions = document.querySelector('.header-actions')
  if (!actions) return
  
  // Save language selector
  const langSelector = actions.querySelector('.language-selector')
  
  if (token) {
    // User is logged in - recreate profile menu
    const profWrap = actions.querySelector('.profile-menu')
    if (profWrap) {
      const profLabel = profWrap.querySelector('.btn.profile-btn')
      if (profLabel) {
        profLabel.innerText = i18n.t('myProfile')
      }
      
      const editProfileBtn = profWrap.querySelector('#hdr-edit-profile')
      if (editProfileBtn) {
        editProfileBtn.innerText = i18n.t('editProfile')
      }
      
      const logoutBtn = profWrap.querySelector('#hdr-logout')
      if (logoutBtn) {
        logoutBtn.innerText = i18n.t('logout')
      }
    }
  } else if (viewMode === 'guest') {
    // Guest mode - update login button
    const loginBtn = actions.querySelector('.btn.primary')
    if (loginBtn) {
      loginBtn.innerText = i18n.t('login')
    }
  }
  
  // Update filter info text if visible
  const filterInfo = document.getElementById('filter-info')
  if (filterInfo && filterInfo.style.display !== 'none') {
    const currentText = filterInfo.textContent
    // Extract the location part (after the emoji and text)
    const patterns = [
      /📍\s*(?:Mostrando pets de|Showing pets from|Mostrando mascotas de)\s+(.+)/,
      /📍\s*(.+)/
    ]
    
    for (const pattern of patterns) {
      const match = currentText.match(pattern)
      if (match && match[1]) {
        // Check if we have a recognized pattern
        if (currentText.includes('Mostrando') || currentText.includes('Showing')) {
          filterInfo.textContent = `📍 ${i18n.t('showingPetsFrom')} ${match[1]}`
          break
        }
      }
    }
  }
  
  // Reload pets to update card menus, status translations, and map popups
  const petsDiv = document.getElementById('pets')
  if (petsDiv) {
    window.loadPets()
  }
})

// Language selector dropdown functionality
const languageSelector = document.getElementById('language-selector')
const langBtn = document.getElementById('lang-btn')
const currentFlag = document.getElementById('current-flag')
const languageOptions = document.querySelectorAll('.language-option')

// Flag emojis
const flags = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸'
}

// Toggle dropdown
if (langBtn) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    languageSelector.classList.toggle('open')
  })
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (languageSelector && !languageSelector.contains(e.target)) {
    languageSelector.classList.remove('open')
  }
})

// Handle language selection
languageOptions.forEach(option => {
  option.addEventListener('click', () => {
    const lang = option.getAttribute('data-lang')
    
    // Update active state
    languageOptions.forEach(opt => opt.classList.remove('active'))
    option.classList.add('active')
    
    // Update flag
    if (currentFlag) {
      currentFlag.textContent = flags[lang]
    }
    
    // Change language
    i18n.setLanguage(lang)
    
    // Close dropdown
    languageSelector.classList.remove('open')
  })
})

// Set initial flag based on current language
if (currentFlag && i18n) {
  currentFlag.textContent = flags[i18n.currentLang] || '🇧🇷'
  
  // Set initial active state
  languageOptions.forEach(opt => {
    if (opt.getAttribute('data-lang') === i18n.currentLang) {
      opt.classList.add('active')
    } else {
      opt.classList.remove('active')
    }
  })
}

