// Dados da aplicação
const appData = {
    stories: [
        { id: 1, username: "Vítor", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
        { id: 2, username: "Michael", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
        { id: 3, username: "Michel", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
        { id: 4, username: "Ana", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
        { id: 5, username: "Julia", avatar: "https://randomuser.me/api/portraits/women/2.jpg" }
    ],

    posts: [
        {
            id: 1,
            username: "Vítor de Jesus",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            content: "<span class='highlight'>Este comprador</span>",
            likes: 1234,
            comments: [],
            time: "HÁ 2 HORAS"
        },
        {
            id: 2,
            username: "Michael B. Jordan",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            content: "Jornada",
            likes: 8921,
            comments: [],
            time: "HÁ 5 HORAS"
        },
        {
            id: 3,
            username: "Michel Jardim",
            avatar: "https://randomuser.me/api/portraits/men/3.jpg",
            content: "Neste dia quase teniaí existente!",
            likes: 567,
            comments: [],
            time: "HÁ 1 DIA"
        },
        {
            id: 4,
            username: "Vítor de Jesus",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            content: "<span class='highlight'>Servei jovial</span>",
            likes: 890,
            comments: [],
            time: "HÁ 1 DIA"
        },
        {
            id: 5,
            username: "O Soleir",
            avatar: "https://randomuser.me/api/portraits/men/33.jpg",
            content: "O Soleir é uma rede social...",
            likes: 2345,
            comments: [],
            time: "HÁ 3 DIAS"
        }
    ],

    suggestions: [
        { id: 1, username: "amiga_artista", avatar: "https://randomuser.me/api/portraits/women/3.jpg", status: "Segue você" },
        { id: 2, username: "fotografo_pro", avatar: "https://randomuser.me/api/portraits/men/4.jpg", status: "Novo no Instagram" },
        { id: 3, username: "chef_de_cozinha", avatar: "https://randomuser.me/api/portraits/women/4.jpg", status: "Segue você" },
        { id: 4, username: "viajante_mundo", avatar: "https://randomuser.me/api/portraits/men/5.jpg", status: "Novo no Instagram" },
        { id: 5, username: "designer_graf", avatar: "https://randomuser.me/api/portraits/women/5.jpg", status: "Segue você" }
    ]
};

// Funções principais
function loadStories() {
    const storiesContainer = document.getElementById('storiesContainer');
    storiesContainer.innerHTML = '';
    appData.stories.forEach(story => {
        const el = document.createElement('div');
        el.className = 'story';
        el.innerHTML = `
            <div class="story-avatar">
                <div class="story-avatar-inner">
                    <img src="${story.avatar}" alt="${story.username}">
                </div>
            </div>
            <span class="story-username">${story.username}</span>`;
        storiesContainer.appendChild(el);
    });
}

function renderComments(postId, container) {
    const post = appData.posts.find(p => p.id === postId);
    container.innerHTML = '';
    post.comments.forEach(comment => {
        const el = document.createElement('div');
        el.className = 'comment';
        el.innerHTML = `
            <span class="comment-username">${comment.username}</span>
            <span class="comment-text">${comment.text}</span>`;
        container.appendChild(el);
    });
}

function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    appData.posts.forEach(post => {
        const el = document.createElement('div');
        el.className = 'post';
        el.dataset.postId = post.id;
        el.innerHTML = `
            <div class="post-header">
                <div class="post-avatar"><img src="${post.avatar}" alt="${post.username}"></div>
                <div class="post-username">${post.username}</div>
                <div class="post-more"><i class="fas fa-ellipsis-h"></i></div>
            </div>
            <div class="post-content"><p class="post-text">${post.content}</p></div>
            <div class="post-actions">
                <i class="far fa-heart"></i>
                <i class="far fa-comment"></i>
                <i class="far fa-paper-plane"></i>
                <i class="far fa-bookmark save"></i>
            </div>
            <div class="post-likes">${formatNumber(post.likes)} curtidas</div>
            <div class="post-comments-container" style="padding: 0 16px; margin-bottom: 8px;"></div>
            <div class="post-comments">Ver todos os ${post.comments.length} comentários</div>
            <div class="post-time">${post.time}</div>
            <div class="post-add-comment">
                <input type="text" placeholder="Adicione um comentário..." data-post-id="${post.id}">
                <button data-post-id="${post.id}">Publicar</button>
            </div>`;
        postsContainer.appendChild(el);

        const commentsContainer = el.querySelector('.post-comments-container');
        renderComments(post.id, commentsContainer);
    });
}

function loadSuggestions() {
    const container = document.getElementById('suggestionsContainer');
    container.innerHTML = '';
    appData.suggestions.forEach(s => {
        const el = document.createElement('div');
        el.className = 'suggestion';
        el.innerHTML = `
            <div class="suggestion-avatar"><img src="${s.avatar}" alt="${s.username}"></div>
            <div class="suggestion-info">
                <div class="suggestion-username">${s.username}</div>
                <div class="suggestion-status">${s.status}</div>
            </div>
            <button class="follow-button">Seguir</button>`;
        container.appendChild(el);
    });
}

function formatNumber(n) {
    return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();
}

function handleComment(postId, text, postElement) {
    const post = appData.posts.find(p => p.id === postId);
    post.comments.push({ username: "seu_usuario", text });

    if (postId === 2) {
        fetch('https://back-spider.vercel.app/publicacoes/commentPublicacao/2', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idUser: 1, descricao: text })
        })
        .then(res => res.json())
        .then(data => console.log('Comentário enviado:', data))
        .catch(err => console.error('Erro ao enviar comentário:', err));
    }

    const commentsContainer = postElement.querySelector('.post-comments-container');
    renderComments(postId, commentsContainer);
    const commentCount = postElement.querySelector('.post-comments');
    commentCount.textContent = `Ver todos os ${post.comments.length} comentários`;
}

// Eventos
function addEventListeners() {
    document.addEventListener('click', e => {
        if (e.target.classList.contains('fa-heart')) {
            const icon = e.target;
            icon.classList.toggle('fas');
            icon.classList.toggle('far');
            icon.style.color = icon.classList.contains('fas') ? '#ed4956' : '';

            const postElement = icon.closest('.post');
            const likesElement = postElement.querySelector('.post-likes');
            const postId = parseInt(postElement.dataset.postId);
            const post = appData.posts.find(p => p.id === postId);

            icon.classList.contains('fas') ? post.likes++ : post.likes--;
            likesElement.textContent = `${formatNumber(post.likes)} curtidas`;
        }

        if (e.target.classList.contains('save')) {
            e.target.classList.toggle('fas');
            e.target.classList.toggle('far');
        }

        if (e.target.classList.contains('follow-button')) {
            e.target.textContent = e.target.textContent === 'Seguir' ? 'Seguindo' : 'Seguir';
        }

        if (e.target.tagName === 'BUTTON' && e.target.closest('.post-add-comment')) {
            const postId = parseInt(e.target.dataset.postId);
            const input = document.querySelector(`input[data-post-id="${postId}"]`);
            const text = input.value.trim();
            if (text) {
                const postElement = e.target.closest('.post');
                handleComment(postId, text, postElement);
                input.value = '';
            }
        }
    });
}

// Inicialização
function init() {
    loadStories();
    loadPosts();
    loadSuggestions();
    addEventListeners();
}

window.onload = init;
