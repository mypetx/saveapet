// Internationalization module
const translations = {
  pt: {
    // Header
    appName: 'SaveAPet',
    profile: 'Perfil',
    myProfile: 'Meu Perfil',
    editProfile: 'Editar perfil',
    messages: 'Mensagens',
    logout: 'Sair',
    myPosts: 'Meus Posts',
    allPosts: 'Todos os Posts',
    
    // Auth
    login: 'Entrar',
    register: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    passwordConfirm: 'Confirmar Senha',
    name: 'Nome',
    phone: 'Telefone',
    city: 'Cidade',
    noAccount: 'Não tem conta?',
    hasAccount: 'Já tem conta?',
    clickHere: 'Clique aqui',
    
    // Pet Form
    reportLostPet: 'Reportar Pet Perdido',
    petName: 'Nome do Pet',
    species: 'Espécie',
    dog: 'Cachorro',
    cat: 'Gato',
    other: 'Outro',
    breed: 'Raça',
    color: 'Cor',
    dateLost: 'Data em que se perdeu',
    description: 'Descrição',
    address: 'Endereço',
    reference: 'Ponto de Referência',
    photo: 'Foto do Pet',
    clickOnMap: 'Clique no mapa onde o pet foi visto pela última vez',
    submit: 'Enviar',
    cancel: 'Cancelar',
    
    // Pet Status
    lost: 'Perdido',
    perdido: 'Perdido',
    found: 'Encontrado',
    encontrado: 'Encontrado',
    adoption: 'Adoção',
    adoção: 'Adoção',
    'adoção': 'Adoção',
    
    // Filters
    filters: 'Filtros',
    clear: 'Limpar',
    petType: 'Tipo de Pet',
    all: 'Todos',
    state: 'Estado',
    allStates: 'Todos os Estados',
    applyFilters: 'Aplicar Filtros',
    showingPetsFromRegion: 'Mostrando pets da sua região',
    showingPetsFrom: 'Mostrando pets de',
    
    // Create Pet
    createPost: 'Criar postagem',
    editPost: 'Editar postagem',
    location: 'Localização',
    clickMapToMark: 'Clique no mapa ao lado para marcar',
    selectState: 'Selecione o Estado',
    country: 'País',
    choosePhoto: 'Escolher foto',
    publish: 'Publicar',
    update: 'Atualizar',
    addressOrClickMap: 'Endereço (ou clique no mapa)',
    referenceOptional: 'Referência — opcional',
    continueWithoutLogin: 'Seguir sem login',
    continueWithoutLoginMsg: 'Você poderá visualizar pets, mas não poderá criar posts ou comentar.',
    
    // Profile
    saveProfile: 'Salvar',
    newPassword: 'Nova senha (deixe vazio para manter)',
    profileUpdated: 'Perfil atualizado',
    
    // Pet List
    status: 'Status',
    lastSeen: 'Visto pela última vez em',
    postedOn: 'Postado em',
    contact: 'Contato',
    viewDetails: 'Ver Detalhes',
    viewDetailsAndComments: 'Ver detalhes e comentários',
    petsAtLocation: 'pets neste local',
    edit: 'Editar',
    delete: 'Excluir',
    
    // Pet Detail Modal
    petDetails: 'Detalhes do Pet',
    ownerInfo: 'Informações do Dono',
    noName: 'Sem nome',
    noDescription: 'Sem descrição',
    contactInfoNotAvailable: 'Informações de contato não disponíveis',
    toCommentLoginRequired: 'Para comentar é necessário fazer login',
    makeLogin: 'Fazer Login',
    comments: 'Comentários',
    addComment: 'Adicionar Comentário',
    writeComment: 'Escreva um comentário...',
    comment: 'Comentar',
    noComments: 'Nenhum comentário ainda',
    noCommentsBeFirst: 'Nenhum comentário ainda. Seja o primeiro a comentar!',
    close: 'Fechar',
    send: 'Enviar',
    save: 'Salvar',
    contactInformation: 'Informações de Contato',
    
    // Messages
    sendMessage: 'Enviar Mensagem',
    messageTo: 'Mensagem para',
    typeMessage: 'Digite sua mensagem',
    inbox: 'Caixa de Entrada',
    noMessages: 'Nenhuma mensagem',
    from: 'De',
    
    // Alerts
    fillAllFields: 'Preencha todos os campos obrigatórios',
    passwordMismatch: 'As senhas não coincidem',
    passwordTooShort: 'A senha deve ter no mínimo 6 caracteres',
    loginSuccess: 'Login realizado com sucesso!',
    registerSuccess: 'Cadastro realizado com sucesso!',
    authError: 'Erro na autenticação',
    petReported: 'Pet reportado com sucesso!',
    petUpdated: 'Pet atualizado com sucesso!',
    petDeleted: 'Pet excluído com sucesso!',
    postCreated: 'Post criado com sucesso!',
    postUpdated: 'Post atualizado com sucesso!',
    postDeleted: 'Post excluído com sucesso!',
    confirmDelete: 'Tem certeza que deseja excluir este pet?',
    confirmDeletePost: 'Tem certeza que deseja excluir este post?',
    confirmDeleteComment: 'Tem certeza que deseja excluir este comentário?',
    error: 'Erro',
    success: 'Sucesso',
    clickMapFirst: 'Por favor, clique no mapa primeiro para definir a localização',
    
    // Map
    yourLocation: 'Sua Localização',
    petLocation: 'Localização do Pet',
    
    // Misc
    loading: 'Carregando...',
    noPetsFound: 'Nenhum pet encontrado',
    edited: 'editado',
    postedBy: 'Postado por',
    breed: 'Raça'
  },
  
  en: {
    // Header
    appName: 'SaveAPet',
    profile: 'Profile',
    myProfile: 'My Profile',
    editProfile: 'Edit profile',
    messages: 'Messages',
    logout: 'Logout',
    myPosts: 'My Posts',
    allPosts: 'All Posts',
    
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    passwordConfirm: 'Confirm Password',
    name: 'Name',
    phone: 'Phone',
    city: 'City',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    clickHere: 'Click here',
    
    // Pet Form
    reportLostPet: 'Report Lost Pet',
    petName: 'Pet Name',
    species: 'Species',
    dog: 'Dog',
    cat: 'Cat',
    other: 'Other',
    breed: 'Breed',
    color: 'Color',
    dateLost: 'Date Lost',
    description: 'Description',
    address: 'Address',
    reference: 'Reference Point',
    photo: 'Pet Photo',
    clickOnMap: 'Click on the map where the pet was last seen',
    submit: 'Submit',
    cancel: 'Cancel',
    
    // Pet Status
    lost: 'Lost',
    perdido: 'Lost',
    found: 'Found',
    encontrado: 'Found',
    adoption: 'Adoption',
    adoção: 'Adoption',
    'adoção': 'Adoption',
    
    // Filters
    filters: 'Filters',
    clear: 'Clear',
    petType: 'Pet Type',
    all: 'All',
    state: 'State',
    allStates: 'All States',
    applyFilters: 'Apply Filters',
    showingPetsFromRegion: 'Showing pets from your region',
    showingPetsFrom: 'Showing pets from',
    
    // Create Pet
    createPost: 'Create post',
    editPost: 'Edit post',
    location: 'Location',
    clickMapToMark: 'Click on the map to mark',
    selectState: 'Select State',
    country: 'Country',
    choosePhoto: 'Choose photo',
    publish: 'Publish',
    update: 'Update',
    addressOrClickMap: 'Address (or click on map)',
    referenceOptional: 'Reference — optional',
    continueWithoutLogin: 'Continue without login',
    continueWithoutLoginMsg: 'You can view pets, but you will not be able to create posts or comment.',
    
    // Profile
    saveProfile: 'Save',
    newPassword: 'New password (leave empty to keep)',
    profileUpdated: 'Profile updated',
    
    // Pet List
    status: 'Status',
    lastSeen: 'Last seen at',
    postedOn: 'Posted on',
    contact: 'Contact',
    viewDetails: 'View Details',
    viewDetailsAndComments: 'View details and comments',
    petsAtLocation: 'pets at this location',
    edit: 'Edit',
    delete: 'Delete',
    
    // Pet Detail Modal
    petDetails: 'Pet Details',
    ownerInfo: 'Owner Information',
    noName: 'No name',
    noDescription: 'No description',
    contactInfoNotAvailable: 'Contact information not available',
    toCommentLoginRequired: 'Login required to comment',
    makeLogin: 'Login',
    comments: 'Comments',
    addComment: 'Add Comment',
    writeComment: 'Write a comment...',
    comment: 'Comment',
    noComments: 'No comments yet',
    noCommentsBeFirst: 'No comments yet. Be the first to comment!',
    close: 'Close',
    send: 'Send',
    save: 'Save',
    contactInformation: 'Contact Information',
    
    // Messages
    sendMessage: 'Send Message',
    messageTo: 'Message to',
    typeMessage: 'Type your message',
    inbox: 'Inbox',
    noMessages: 'No messages',
    from: 'From',
    
    // Alerts
    fillAllFields: 'Please fill all required fields',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    loginSuccess: 'Login successful!',
    registerSuccess: 'Registration successful!',
    authError: 'Authentication error',
    petReported: 'Pet reported successfully!',
    petUpdated: 'Pet updated successfully!',
    petDeleted: 'Pet deleted successfully!',
    postCreated: 'Post created successfully!',
    postUpdated: 'Post updated successfully!',
    postDeleted: 'Post deleted successfully!',
    confirmDelete: 'Are you sure you want to delete this pet?',
    confirmDeletePost: 'Are you sure you want to delete this post?',
    confirmDeleteComment: 'Are you sure you want to delete this comment?',
    error: 'Error',
    success: 'Success',
    clickMapFirst: 'Please click on the map first to set the location',
    
    // Map
    yourLocation: 'Your Location',
    petLocation: 'Pet Location',
    
    // Misc
    loading: 'Loading...',
    noPetsFound: 'No pets found',
    edited: 'edited',
    postedBy: 'Posted by',
    breed: 'Breed'
  },
  
  es: {
    // Header
    appName: 'SaveAPet',
    profile: 'Perfil',
    myProfile: 'Mi Perfil',
    editProfile: 'Editar perfil',
    messages: 'Mensajes',
    logout: 'Salir',
    myPosts: 'Mis Publicaciones',
    allPosts: 'Todas las Publicaciones',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    passwordConfirm: 'Confirmar Contraseña',
    name: 'Nombre',
    phone: 'Teléfono',
    city: 'Ciudad',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    clickHere: 'Haz clic aquí',
    
    // Pet Form
    reportLostPet: 'Reportar Mascota Perdida',
    petName: 'Nombre de la Mascota',
    species: 'Especie',
    dog: 'Perro',
    cat: 'Gato',
    other: 'Otro',
    breed: 'Raza',
    color: 'Color',
    dateLost: 'Fecha de Pérdida',
    description: 'Descripción',
    address: 'Dirección',
    reference: 'Punto de Referencia',
    photo: 'Foto de la Mascota',
    clickOnMap: 'Haz clic en el mapa donde se vio la mascota por última vez',
    submit: 'Enviar',
    cancel: 'Cancelar',
    
    // Pet Status
    lost: 'Perdido',
    perdido: 'Perdido',
    found: 'Encontrado',
    encontrado: 'Encontrado',
    adoption: 'Adopción',
    adoção: 'Adopción',
    'adoção': 'Adopción',
    
    // Filters
    filters: 'Filtros',
    clear: 'Limpiar',
    petType: 'Tipo de Mascota',
    all: 'Todos',
    state: 'Estado',
    allStates: 'Todos los Estados',
    applyFilters: 'Aplicar Filtros',
    showingPetsFromRegion: 'Mostrando mascotas de tu región',
    showingPetsFrom: 'Mostrando mascotas de',
    
    // Create Pet
    createPost: 'Crear publicación',
    editPost: 'Editar publicación',
    location: 'Ubicación',
    clickMapToMark: 'Haz clic en el mapa para marcar',
    selectState: 'Seleccionar Estado',
    country: 'País',
    choosePhoto: 'Elegir foto',
    publish: 'Publicar',
    update: 'Actualizar',
    addressOrClickMap: 'Dirección (o haz clic en el mapa)',
    referenceOptional: 'Referencia — opcional',
    continueWithoutLogin: 'Continuar sin iniciar sesión',
    continueWithoutLoginMsg: 'Podrás ver mascotas, pero no podrás crear publicaciones ni comentar.',
    
    // Profile
    saveProfile: 'Guardar',
    newPassword: 'Nueva contraseña (dejar vacío para mantener)',
    profileUpdated: 'Perfil actualizado',
    
    // Pet List
    status: 'Estado',
    lastSeen: 'Visto por última vez en',
    postedOn: 'Publicado el',
    contact: 'Contacto',
    viewDetails: 'Ver Detalles',
    viewDetailsAndComments: 'Ver detalles y comentarios',
    petsAtLocation: 'mascotas en este lugar',
    edit: 'Editar',
    delete: 'Eliminar',
    
    // Pet Detail Modal
    petDetails: 'Detalles de la Mascota',
    ownerInfo: 'Información del Dueño',
    noName: 'Sin nombre',
    noDescription: 'Sin descripción',
    contactInfoNotAvailable: 'Información de contacto no disponible',
    toCommentLoginRequired: 'Se requiere iniciar sesión para comentar',
    makeLogin: 'Iniciar Sesión',
    comments: 'Comentarios',
    addComment: 'Agregar Comentario',
    writeComment: 'Escribe un comentario...',
    comment: 'Comentar',
    noComments: 'Aún no hay comentarios',
    noCommentsBeFirst: '¡Aún no hay comentarios. Sé el primero en comentar!',
    close: 'Cerrar',
    send: 'Enviar',
    save: 'Guardar',
    contactInformation: 'Información de Contacto',
    
    // Messages
    sendMessage: 'Enviar Mensaje',
    messageTo: 'Mensaje para',
    typeMessage: 'Escribe tu mensaje',
    inbox: 'Bandeja de Entrada',
    noMessages: 'No hay mensajes',
    from: 'De',
    
    // Alerts
    fillAllFields: 'Por favor, completa todos los campos obligatorios',
    passwordMismatch: 'Las contraseñas no coinciden',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    loginSuccess: '¡Inicio de sesión exitoso!',
    registerSuccess: '¡Registro exitoso!',
    authError: 'Error de autenticación',
    petReported: '¡Mascota reportada con éxito!',
    petUpdated: '¡Mascota actualizada con éxito!',
    petDeleted: '¡Mascota eliminada con éxito!',
    postCreated: '¡Publicación creada con éxito!',
    postUpdated: '¡Publicación actualizada con éxito!',
    postDeleted: '¡Publicación eliminada con éxito!',
    confirmDelete: '¿Estás seguro de que quieres eliminar esta mascota?',
    confirmDeletePost: '¿Estás seguro de que quieres eliminar esta publicación?',
    confirmDeleteComment: '¿Estás seguro de que quieres eliminar este comentario?',
    error: 'Error',
    success: 'Éxito',
    clickMapFirst: 'Por favor, haz clic en el mapa primero para establecer la ubicación',
    
    // Map
    yourLocation: 'Tu Ubicación',
    petLocation: 'Ubicación de la Mascota',
    
    // Misc
    loading: 'Cargando...',
    noPetsFound: 'No se encontraron mascotas',
    edited: 'editado',
    postedBy: 'Publicado por',
    breed: 'Raza'
  }
}

// I18n class
class I18n {
  constructor() {
    this.currentLang = this.detectLanguage()
    this.translations = translations
  }
  
  detectLanguage() {
    // Check localStorage first
    const saved = localStorage.getItem('language')
    if (saved && translations[saved]) {
      return saved
    }
    
    // Detect from browser
    const browserLang = navigator.language.split('-')[0]
    return translations[browserLang] ? browserLang : 'pt'
  }
  
  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang
      localStorage.setItem('language', lang)
      this.updatePage()
      
      // Trigger custom event for dynamic content updates
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }))
    }
  }
  
  t(key) {
    return this.translations[this.currentLang][key] || key
  }
  
  updatePage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder) {
          el.placeholder = this.t(key)
        }
      } else {
        el.textContent = this.t(key)
      }
    })
    
    // Update all placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder')
      el.placeholder = this.t(key)
    })
    
    // Update all values with data-i18n-value
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value')
      el.value = this.t(key)
    })
    
    // Update document title
    document.title = `${this.t('appName')} - ${this.t('reportLostPet')}`
  }
}

// Export singleton instance
const i18n = new I18n()
