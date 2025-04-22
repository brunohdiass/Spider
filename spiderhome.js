// Configurações da API
const API_ENDPOINTS = {
    posts: 'https://back-spider.vercel.app/publicacoes/listarPublicacoes',
    commentPost: 'https://back-spider.vercel.app/publicacoes/commentPublicacao', // Corrigido
    likePost: 'https://back-spider.vercel.app/publicacoes/likePublicacao', // Novo endpoint para curtir
  };
  
  // Estado da aplicação
  const appState = {
    posts: [],
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || { id: 1 } // Usuário fictício, mas pode ser alterado para o logado
  };
  
  // Função principal para inicializar o app
  async function initApp() {
    try {
      showLoading(true);
      const postsData = await fetchPosts();
      appState.posts = processPostsData(postsData);
      renderPosts();
      setupEventListeners();
    } catch (error) {
      showError('Erro ao carregar posts: ' + error.message);
    } finally {
      showLoading(false);
    }
  }
  
  async function fetchPosts() {
    try {
      const response = await fetch(API_ENDPOINTS.posts);
      if (!response.ok) throw new Error('Falha ao carregar posts');
      return await response.json();
    } catch (error) {
      throw new Error('Erro ao buscar posts: ' + error.message);
    }
  }
  
  function processPostsData(postsData) {
    return postsData.map(post => ({
      id: post.id,
      userId: post.idUsuario,
      username: `user_${post.idUsuario}`,
      userAvatar: `https://randomuser.me/api/portraits/${post.idUsuario % 2 === 0 ? 'women' : 'men'}/${post.idUsuario % 50}.jpg`,
      description: post.descricao,
      image: post.imagem,
      location: post.local,
      publishDate: post.dataPublicacao,
      likes: {
        count: post.curtidas?.length || 0,
        users: post.curtidas?.map(like => like.idUsuario) || []
      },
      comments: post.comentarios?.map(comment => ({
        id: comment.id,
        userId: comment.idUsuario,
        text: comment.descricao,
        username: `user_${comment.idUsuario}`
      })) || [],
      timeAgo: formatTimeAgo(post.dataPublicacao),
      isLiked: post.curtidas?.some(like => like.idUsuario === appState.currentUser.id) || false,
      isSaved: false
    }));
  }
  
  function formatTimeAgo(dateString) {
    const now = new Date();
    const pubDate = new Date(dateString.split('/').reverse().join('-'));
    const diffHours = Math.floor((now - pubDate) / (1000 * 60 * 60));
    if (diffHours < 24) return `HÁ ${diffHours} HORAS`;
    const diffDays = Math.floor(diffHours / 24);
    return `HÁ ${diffDays} DIAS`;
  }
  
  function renderPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = appState.posts.map(post => `
      <div class="post" data-post-id="${post.id}">
        <div class="post-header">
          <div class="post-avatar">
            <img src="${post.userAvatar}" alt="${post.username}">
          </div>
          <div class="post-user-info">
            <span class="post-username">${post.username}</span>
            ${post.location ? `<span class="post-location">${post.location}</span>` : ''}
          </div>
          <button class="post-more"><i class="fas fa-ellipsis-h"></i></button>
        </div>
  
        <div class="post-content">
          ${post.image ? `
          <div class="post-image-container">
            <img src="${post.image}" alt="Post" class="post-image" loading="lazy">
          </div>` : ''}
          <p class="post-text">${post.description}</p>
        </div>
  
        <div class="post-actions">
          <button class="like-button ${post.isLiked ? 'liked' : ''}">
            <i class="${post.isLiked ? 'fas' : 'far'} fa-heart"></i>
          </button>
          <button class="comment-button"><i class="far fa-comment"></i></button>
          <button class="share-button"><i class="far fa-paper-plane"></i></button>
          <button class="save-button ${post.isSaved ? 'saved' : ''}">
            <i class="${post.isSaved ? 'fas' : 'far'} fa-bookmark"></i>
          </button>
        </div>
  
        <div class="post-stats">
          <div class="post-likes">${formatNumber(post.likes.count)} curtidas</div>
          ${post.comments.length > 0 ? `
          <div class="post-comments-preview">
            <span class="comment-username">${post.comments[0].username}</span>
            <span class="comment-text">${post.comments[0].text}</span>
          </div>` : ''}
          ${post.comments.length > 1 ? `
          <div class="post-view-comments">
            Ver todos os ${post.comments.length} comentários
          </div>` : ''}
        </div>
  
        <div class="post-time">${post.timeAgo}</div>
  
        <div class="post-add-comment">
          <input type="text" placeholder="Adicione um comentário..." class="comment-input">
          <button class="comment-submit" disabled>Publicar</button>
        </div>
      </div>
    `).join('');
  }
  
  function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  }
  
  function setupEventListeners() {
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.like-button')) {
        const button = e.target.closest('.like-button');
        const postId = parseInt(button.closest('.post').dataset.postId);
        const post = appState.posts.find(p => p.id === postId);
        post.isLiked = !post.isLiked;
        post.likes.count += post.isLiked ? 1 : -1;
        const icon = button.querySelector('i');
        button.classList.toggle('liked');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
        button.closest('.post').querySelector('.post-likes').textContent =
          `${formatNumber(post.likes.count)} curtidas`;
  
        // Envia o like para a API
        await likePost(postId);
      }
  
      if (e.target.closest('.save-button')) {
        const button = e.target.closest('.save-button');
        const postId = parseInt(button.closest('.post').dataset.postId);
        const post = appState.posts.find(p => p.id === postId);
        post.isSaved = !post.isSaved;
        const icon = button.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
        button.classList.toggle('saved');
      }
  
      if (e.target.classList.contains('comment-submit')) {
        (async () => {
          const input = e.target.previousElementSibling;
          const commentText = input.value.trim();
          if (commentText) {
            const postId = parseInt(input.closest('.post').dataset.postId);
            const post = appState.posts.find(p => p.id === postId);
  
            const newComment = {
              id: Date.now(),
              userId: appState.currentUser.id,
              text: commentText,
              username: `user_${appState.currentUser.id}`
            };
  
            post.comments.unshift(newComment);
            input.value = '';
            e.target.disabled = true;
            renderPosts();
            setupEventListeners();
  
            // Envia o comentário para a API
            await addComment(postId, commentText);
          }
        })();
      }
    });
  
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('comment-input')) {
        const button = e.target.nextElementSibling;
        button.disabled = e.target.value.trim() === '';
      }
    });
  
    document.addEventListener('keypress', (e) => {
      if (e.target.classList.contains('comment-input') && e.key === 'Enter' && e.target.value.trim()) {
        e.preventDefault();
        e.target.nextElementSibling.click();
      }
    });
  }
  
  async function likePost(postId) {
    try {
      const response = await fetch(`${API_ENDPOINTS.likePost}/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idUser: appState.currentUser.id
        })
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Erro ao curtir a publicação:', errorResponse);
        throw new Error(errorResponse.message || 'Erro desconhecido ao curtir a publicação');
      }
  
      return await response.json();
    } catch (error) {
      showError('Erro ao curtir a publicação: ' + error.message);
    }
  }
  
  async function addComment(postId, commentText) {
    try {
      const response = await fetch(`${API_ENDPOINTS.commentPost}/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idUser: appState.currentUser.id,
          descricao: commentText
        })
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Erro ao salvar comentário:', errorResponse);
        throw new Error(errorResponse.message || 'Erro desconhecido ao salvar comentário');
      }
  
      return await response.json();
    } catch (error) {
      showError('Erro ao publicar comentário: ' + error.message);
    }
  }
  
  function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.style.display = show ? 'block' : 'none';
  }
  
  function showError(message) {
    console.error(message);
    alert(message);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  
    const style = document.createElement('style');
    style.textContent = `
      .post {
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 20px;
        padding: 12px;
        background: white;
      }
      .post-image {
        width: 100%;
        max-height: 600px;
        object-fit: cover;
        border-radius: 4px;
      }
      .post-image-container {
        margin: 12px -12px;
      }
      .liked i {
        color: #ed4956;
      }
      .saved i {
        color: #262626;
      }
      .post-actions button {
        margin-right: 15px;
        font-size: 24px;
        background: none;
        border: none;
        cursor: pointer;
      }
      .comment-input {
        flex: 1;
        border: none;
        outline: none;
      }
      .comment-submit {
        color: #0095f6;
        font-weight: bold;
        background: none;
        border: none;
        cursor: pointer;
      }
      .comment-submit:disabled {
        opacity: 0.5;
        cursor: default;
      }
    `;
    document.head.appendChild(style);
  });
  