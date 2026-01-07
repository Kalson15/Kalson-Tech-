document.addEventListener('DOMContentLoaded', () => {
    console.log('Kalson Tech - System Online.');

    if (typeof marked !== 'undefined') {
        const renderer = new marked.Renderer();
        renderer.code = function(code, language) {
            const validLang = !!(language && hljs.getLanguage(language));
            const highlighted = validLang ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value;
            return `<div class="code-wrapper">
                      <div class="code-header">
                          <span class="code-lang">${language || 'code'}</span>
                          <button class="copy-code-btn" data-code="${encodeURIComponent(code)}"><i class="fas fa-copy"></i> Copy</button>
                      </div>
                      <pre><code class="hljs ${language}">${highlighted}</code></pre>
                    </div>`;
        };
        marked.use({ renderer });
    }

    checkAuth();
    initScrollAnimations();
    initAuthModal();
    initSettingsModal();
    initMobileMenu();
    initChatInterface();
});

const USERS_KEY = 'kalson_users';
const SESSION_KEY = 'kalson_session';

function checkAuth() {
    const session = localStorage.getItem(SESSION_KEY);
    const landingView = document.getElementById('landing-view');
    const dashboardView = document.getElementById('dashboard-view');
    
    if (!landingView || !dashboardView) return;

    if (session) {
        try {
            const user = JSON.parse(session);
            console.log('User logged in:', user.email);
            
            landingView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            
            const displayUserName = document.getElementById('displayUserName');
            if(displayUserName) displayUserName.textContent = user.name;
        } catch (e) {
            console.error('Session parse error', e);
            localStorage.removeItem(SESSION_KEY);
            landingView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        }
    } else {
        landingView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }
}

function handleSignup(name, email, password) {
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        if (!Array.isArray(users)) users = [];
    } catch (e) {
        users = [];
    }
    
    if (users.find(u => u.email === email)) {
        showToast('Email already registered!', 'error');
        return false;
    }

    const newUser = { name, email, password }; 
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email }));
    showToast('Account created successfully!');
    return true;
}

function handleLogin(email, password) {
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        if (!Array.isArray(users)) users = [];
    } catch (e) {
        users = [];
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
        showToast('Welcome back!');
        return true;
    } else {
        showToast('Invalid credentials!', 'error');
        return false;
    }
}

function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function initScrollAnimations() {
    // Add any scroll animations here
}

function initMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !mobileMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenu.classList.remove('is-active');
            }
        });
    }
}

function initAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    const exploreBtn = document.getElementById('exploreBtn');
    const navLoginBtn = document.getElementById('navLoginBtn');
    const closeBtn = document.getElementById('closeAuth');
    const showLogin = document.getElementById('showLogin');
    const showSignup = document.getElementById('showSignup');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    const resetForms = (isLogin = false) => {
        if (!signupForm || !loginForm) return;
        if (isLogin) {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } else {
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    };

    const openModal = (showLoginView = false) => {
        resetForms(showLoginView);
        modal.classList.remove('hidden');
        modal.style.display = "flex";
        void modal.offsetWidth;
        setTimeout(() => modal.classList.add('show'), 10);
    };

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    };

    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(false);
        });
    }

    if (navLoginBtn) {
        navLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(true);
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            resetForms(true);
        });
    }

    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            resetForms(false);
        });
    }

    const formSignup = document.getElementById('formSignup');
    if (formSignup) {
        formSignup.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('signupName');
            const emailInput = document.getElementById('signupEmail');
            const passInput = document.getElementById('signupPassword');
            
            if (nameInput && emailInput && passInput) {
                if(handleSignup(nameInput.value, emailInput.value, passInput.value)) {
                    closeModal();
                    checkAuth();
                }
            }
        });
    }

    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail');
            const passInput = document.getElementById('loginPassword');
            
            if (emailInput && passInput) {
                if(handleLogin(emailInput.value, passInput.value)) {
                    closeModal();
                    checkAuth();
                } 
            }
        });
    }
}

function initSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const openBtn = document.getElementById('openSettingsBtn');
    const closeBtn = document.getElementById('closeSettings');

    if (!modal) return;

    // Hide the settings button since we don't need API key input anymore
    if (openBtn) {
        openBtn.style.display = 'none';
    }

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    };

    if(closeBtn) closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
}

let currentChatId = null;

function initChatInterface() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const messagesContainer = document.getElementById('messagesContainer');
    const newChatBtn = document.getElementById('newChatBtn');
    const historyList = document.getElementById('chatHistoryList');

    loadChatHistory();

    if(newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            currentChatId = null;
            clearMessages();
            if(historyList) {
                historyList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            }
        });
    }

    const chatMobileMenu = document.getElementById('chatMobileMenu');
    const sidebar = document.querySelector('.sidebar');
    
    if(chatMobileMenu && sidebar) {
        chatMobileMenu.addEventListener('click', () => {
            chatMobileMenu.classList.toggle('is-active');
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if(sidebar.classList.contains('active') && 
               !sidebar.contains(e.target) && 
               !chatMobileMenu.contains(e.target)) {
                sidebar.classList.remove('active');
                chatMobileMenu.classList.remove('is-active');
            }
        });
    }

    if (messagesContainer) {
        messagesContainer.addEventListener('click', (e) => {
            if (e.target.closest('.copy-code-btn')) {
                const btn = e.target.closest('.copy-code-btn');
                const code = decodeURIComponent(btn.dataset.code);
                navigator.clipboard.writeText(code).then(() => {
                    const original = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => btn.innerHTML = original, 2000);
                });
            }
            
            if (e.target.closest('.copy-msg-btn')) {
                const btn = e.target.closest('.copy-msg-btn');
                const messageContent = btn.closest('.message').querySelector('.message-content').innerText;
                const cleanText = messageContent.replace(/code\s+Copy/g, '');
                navigator.clipboard.writeText(cleanText).then(() => {
                   showToast('Message copied to clipboard');
                });
            }

            if (e.target.closest('.regen-msg-btn')) {
                const aiMsg = e.target.closest('.message');
                let prevSibling = aiMsg.previousElementSibling;
                while(prevSibling && !prevSibling.classList.contains('user-message')) {
                    prevSibling = prevSibling.previousElementSibling;
                }
                
                if (prevSibling) {
                    const userText = prevSibling.querySelector('.message-content p').textContent;
                    aiMsg.remove();
                    processMessage(userText, true);
                }
            }
        });
    }

    const processMessage = async (text, isRegen = false) => {
        if (!text) return;
        
        if (sendBtn) sendBtn.disabled = true;
        if (chatInput) chatInput.disabled = true;

        if (!isRegen) {
            addMessage(text, 'user');
            if(chatInput) chatInput.value = '';
        }

        const aiMsgElement = addMessage('', 'ai');
        const aiContentDiv = aiMsgElement.querySelector('.message-content');
        const p = document.createElement('p');
        p.classList.add('typing-cursor');
        aiContentDiv.appendChild(p);

        try {
            const responseText = await fetchRealTimeResponse(text);
            
            p.classList.remove('typing-cursor');
            
            if (typeof marked !== 'undefined') {
                aiContentDiv.innerHTML = marked.parse(responseText);
            } else {
                p.textContent = responseText;
                aiContentDiv.innerHTML = linkify(responseText);
            }
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.innerHTML = `
                <button class="action-btn copy-msg-btn" title="Copy Message"><i class="far fa-copy"></i></button>
                <button class="action-btn regen-msg-btn" title="Regenerate Response"><i class="fas fa-redo-alt"></i></button>
            `;
            aiMsgElement.querySelector('.message-content').appendChild(actionsDiv);

            saveToHistory(text, responseText);

        } catch (error) {
            p.textContent = "I'm having trouble connecting right now. Please try again.";
            p.classList.remove('typing-cursor');
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (chatInput) {
                chatInput.disabled = false;
                chatInput.focus();
            }
        }
    };

    if (sendBtn) sendBtn.addEventListener('click', () => processMessage(chatInput.value.trim()));
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                processMessage(chatInput.value.trim());
            }
        });
    }

    function addMessage(text, sender) {
        if (!messagesContainer) return;

        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.classList.add('message-content');
        
        if (sender === 'user') {
            content.innerHTML = `<p>${text}</p>`;
        }

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(content);
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return msgDiv;
    }

    function clearMessages() {
        if (!messagesContainer) return;
        messagesContainer.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <p>Hello! I'm your ultimate coding companion. How can I help you today?</p>
                </div>
            </div>`;
    }

    // UPDATED: Use serverless function instead of direct API call
    async function fetchRealTimeResponse(userQuery) {
        try {
            const response = await fetch('/api/chat', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userQuery })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const data = await response.json();
            return data.response || "No response generated. Please try again.";
            
        } catch (e) {
            console.error('Fetch error:', e);
            return `Error: ${e.message}. Please check your connection and try again.`;
        }
    }

    function linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    }
}

function getHistoryKey() {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? `kalson_chats_${JSON.parse(session).email}` : null;
}

function loadChatHistory() {
    const key = getHistoryKey();
    if (!key) return;

    const historyList = document.getElementById('chatHistoryList');
    if (!historyList) return;

    try {
        const chats = JSON.parse(localStorage.getItem(key) || '[]');
        historyList.innerHTML = '';
        
        if (chats.length === 0) {
            historyList.innerHTML = '<li style="cursor: default; opacity: 0.5;">No recent chats</li>';
            return;
        }

        chats.reverse().slice(0, 10).forEach((chat, idx) => {
            const li = document.createElement('li');
            const preview = chat.userMsg.substring(0, 30) + (chat.userMsg.length > 30 ? '...' : '');
            li.innerHTML = `<i class="fas fa-comment"></i> ${preview}`;
            li.addEventListener('click', () => {
                loadChat(chat);
                historyList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
            });
            historyList.appendChild(li);
        });
    } catch (e) {
        console.error('Error loading history:', e);
    }
}

function saveToHistory(userMsg, aiMsg) {
    const key = getHistoryKey();
    if (!key) return;

    try {
        let chats = JSON.parse(localStorage.getItem(key) || '[]');
        chats.push({ userMsg, aiMsg, timestamp: Date.now() });
        if (chats.length > 50) chats = chats.slice(-50);
        localStorage.setItem(key, JSON.stringify(chats));
        loadChatHistory();
    } catch (e) {
        console.error('Error saving to history:', e);
    }
}

function loadChat(chat) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = `
        <div class="message ai-message">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>Hello! I'm your ultimate coding companion. How can I help you today?</p>
            </div>
        </div>`;

    const userMsgDiv = document.createElement('div');
    userMsgDiv.classList.add('message', 'user-message');
    userMsgDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-user"></i></div>
        <div class="message-content"><p>${chat.userMsg}</p></div>
    `;
    messagesContainer.appendChild(userMsgDiv);

    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.classList.add('message', 'ai-message');
    const aiContent = typeof marked !== 'undefined' ? marked.parse(chat.aiMsg) : chat.aiMsg;
    aiMsgDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">${aiContent}</div>
    `;
    messagesContainer.appendChild(aiMsgDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
