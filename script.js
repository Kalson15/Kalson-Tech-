document.addEventListener('DOMContentLoaded', () => {
    // Console greeting
    console.log('Kalson Tech - System Online.');

    // Configure Marked.js for Code Highlighting
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

    // Check Authentication State on Load
    checkAuth();

    // Initialize UI Interactions
    initScrollAnimations();
    initAuthModal();
    initSettingsModal();
    initMobileMenu();
    initChatInterface();
});

// --- AUTHENTICATION LOGIC (SIMULATED BACKEND) ---
const USERS_KEY = 'kalson_users';
const SESSION_KEY = 'kalson_session';

function checkAuth() {
    const session = localStorage.getItem(SESSION_KEY);
    const landingView = document.getElementById('landing-view');
    const dashboardView = document.getElementById('dashboard-view');
    
    if (!landingView || !dashboardView) return;

    if (session) {
        try {
            // User is logged in
            const user = JSON.parse(session);
            console.log('User logged in:', user.email);
            
            landingView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            
            // Update Profile Info
            const displayUserName = document.getElementById('displayUserName');
            if(displayUserName) displayUserName.textContent = user.name;
        } catch (e) {
            console.error('Session parse error', e);
            localStorage.removeItem(SESSION_KEY);
            landingView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        }
    } else {
        // User is guest
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
    
    // Simple check if user exists
    if (users.find(u => u.email === email)) {
        showToast('Email already registered!', 'error');
        return false;
    }

    const newUser = { name, email, password }; 
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after signup
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

// --- UI & INTERACTION LOGIC ---

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

    // Ensure forms are in correct state
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
        // Force reflow to ensure transition happens
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
            openModal(false); // Open Signup
        });
    }

    if (navLoginBtn) {
        navLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(true); // Open Login
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
                }র্শ
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
    const apiKeyForm = document.getElementById('apiKeyForm');
    const apiKeyInput = document.getElementById('geminiKey');

    if (!modal) return;

    // Load saved key
    if(apiKeyInput) {
        const savedKey = localStorage.getItem('kalson_gemini_api_key');
        if(savedKey) apiKeyInput.value = savedKey;
    }

    const openModal = () => {
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

    if(openBtn) openBtn.addEventListener('click', openModal);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    if(apiKeyForm) {
        apiKeyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if(apiKeyInput) {
                const key = apiKeyInput.value.trim();
                if(key) {
                    localStorage.setItem('kalson_gemini_api_key', key);
                    showToast('Gemini API Key saved successfully!');
                    closeModal();
                } else {
                    localStorage.removeItem('kalson_gemini_api_key');
                    showToast('API Key removed.', 'error');
                    closeModal();
                }
            }
        });
    }
}

// --- CHAT LOGIC ---

let currentChatId = null;

function initChatInterface() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const messagesContainer = document.getElementById('messagesContainer');
    const newChatBtn = document.getElementById('newChatBtn');
    const historyList = document.getElementById('chatHistoryList');

    // Load History to Sidebar
    loadChatHistory();

    if(newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            currentChatId = null;
            clearMessages();
            // Remove active class from sidebar items
            if(historyList) {
                historyList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            }
        });
    }

    // Improved Mobile Sidebar Toggle with Animation
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

    // Event delegation for dynamic buttons (Copy Code, Actions)
    if (messagesContainer) {
        messagesContainer.addEventListener('click', (e) => {
            // Copy Code Block
            if (e.target.closest('.copy-code-btn')) {
                const btn = e.target.closest('.copy-code-btn');
                const code = decodeURIComponent(btn.dataset.code);
                navigator.clipboard.writeText(code).then(() => {
                    const original = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => btn.innerHTML = original, 2000);
                });
            }
            
            // Copy Message Text
            if (e.target.closest('.copy-msg-btn')) {
                const btn = e.target.closest('.copy-msg-btn');
                const messageContent = btn.closest('.message').querySelector('.message-content').innerText;
                // Remove artifacts like "Copy" from code blocks for clean text
                const cleanText = messageContent.replace(/code\s+Copy/g, '');
                navigator.clipboard.writeText(cleanText).then(() => {
                   showToast('Message copied to clipboard');
                });
            }

            // Regenerate Response
            if (e.target.closest('.regen-msg-btn')) {
                const aiMsg = e.target.closest('.message');
                // Find the preceding user message
                let prevSibling = aiMsg.previousElementSibling;
                while(prevSibling && !prevSibling.classList.contains('user-message')) {
                    prevSibling = prevSibling.previousElementSibling;
                }
                
                if (prevSibling) {
                    const userText = prevSibling.querySelector('.message-content p').textContent;
                    aiMsg.remove(); // Remove failed/old response
                    processMessage(userText, true); // Resend
                }
            }
        });
    }

    const processMessage = async (text, isRegen = false) => {
        if (!text) return;
        
        // Disable Input
        if (sendBtn) sendBtn.disabled = true;
        if (chatInput) chatInput.disabled = true;

        if (!isRegen) {
            addMessage(text, 'user');
            if(chatInput) chatInput.value = '';
        }

        // Create AI Message placeholder
        const aiMsgElement = addMessage('', 'ai');
        const aiContentDiv = aiMsgElement.querySelector('.message-content');
        const p = document.createElement('p');
        p.classList.add('typing-cursor');
        aiContentDiv.appendChild(p);

        try {
            const responseText = await fetchRealTimeResponse(text);
            
            // Process Markdown and Code
            p.classList.remove('typing-cursor');
            
            if (typeof marked !== 'undefined') {
                aiContentDiv.innerHTML = marked.parse(responseText);
            } else {
                // Fallback if marked didn't load
                p.textContent = responseText;
                aiContentDiv.innerHTML = linkify(responseText);
            }
            
            // Add Actions (Copy / Regenerate)
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.innerHTML = `
                <button class="action-btn copy-msg-btn" title="Copy Message"><i class="far fa-copy"></i></button>
                <button class="action-btn regen-msg-btn" title="Regenerate Response"><i class="fas fa-redo-alt"></i></button>
            `;
            aiMsgElement.querySelector('.message-content').appendChild(actionsDiv);

            // Save to History
            saveToHistory(text, responseText);

        } catch (error) {
            p.textContent = "I'm having trouble connecting to the network right now.";
            p.classList.remove('typing-cursor');
        } finally {
            // Re-enable Input
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
        
        // User message is plain text, AI uses markdown (processed later)
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
        // Keep only the welcome message or remove all
        messagesContainer.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <p>Hello! I'm your ultimate coding companion. How can I help you today?</p>
                </div>
            </div>`;
    }

    // API Function
    async function fetchRealTimeResponse(userQuery) {
        const apiKey = localStorage.getItem('kalson_gemini_api_key');
        
        if (!apiKey) {
            return "Please configure your Gemini API Key in Settings to start coding with AI assistance.";
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "contents": [{
                        "parts": [{
                            "text": "You are Kalson Tech AI, an expert coding assistant. Use Markdown for code blocks.\n\nUser: " + userQuery
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 2048
                    }
                })
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && 
                data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "No response generated. Please try again.";
            }
        } catch (e) {
            return `Error: ${e.message}. Please check your connection.`;
        }
    }

    // Linkify helper
    function linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    }
}

// --- HISTORY MANAGEMENT ---
function getHistoryKey() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session ? `kalson_chats_${session.email}` : null;
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

        chats.reverse().forEach(chat => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="far fa-comment-alt"></i> ${chat.title}`;
            li.onclick = () => loadChat(chat.id);
            if (chat.id === currentChatId) li.classList.add('active');
            historyList.appendChild(li);
        });
    } catch (e) {
        console.error('Error loading history', e);
    }
}

function saveToHistory(userText, aiText) {
    const key = getHistoryKey();
    if (!key) return;

    let chats = [];
    try {
        chats = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {}

    const timestamp = Date.now();
    
    if (!currentChatId) {
        // New Chat
        currentChatId = timestamp.toString();
        const newChat = {
            id: currentChatId,
            title: userText.substring(0, 30) + (userText.length > 30 ? '...' : ''),
            messages: [
                { role: 'user', content: userText },
                { role: 'ai', content: aiText }
            ],
            lastUpdated: timestamp
        };
        chats.push(newChat);
    } else {
        // Existing Chat
        const chatIndex = chats.findIndex(c => c.id === currentChatId);
        if (chatIndex !== -1) {
            chats[chatIndex].messages.push({ role: 'user', content: userText });
            chats[chatIndex].messages.push({ role: 'ai', content: aiText });
            chats[chatIndex].lastUpdated = timestamp;
        } else {
            // Fallback if ID not found
            currentChatId = timestamp.toString();
            chats.push({
                id: currentChatId,
                title: userText.substring(0, 30) + '...',
                messages: [{ role: 'user', content: userText }, { role: 'ai', content: aiText }],
                lastUpdated: timestamp
            });
        }
    }

    localStorage.setItem(key, JSON.stringify(chats));
    loadChatHistory();
}

function loadChat(chatId) {
    const key = getHistoryKey();
    if (!key) return;
    
    const chats = JSON.parse(localStorage.getItem(key) || '[]');
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
        currentChatId = chatId;
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
        
        // Re-render messages
        chat.messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', msg.role === 'user' ? 'user-message' : 'ai-message');
            
            const avatar = document.createElement('div');
            avatar.classList.add('message-avatar');
            avatar.innerHTML = msg.role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
            
            const content = document.createElement('div');
            content.classList.add('message-content');
            
            if (msg.role === 'user') {
                content.innerHTML = `<p>${msg.content}</p>`;
            } else {
                 if (typeof marked !== 'undefined') {
                    content.innerHTML = marked.parse(msg.content);
                } else {
                    content.innerHTML = `<p>${msg.content}</p>`;
                }
                // Add Actions
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'message-actions';
                actionsDiv.innerHTML = `
                    <button class="action-btn copy-msg-btn" title="Copy Message"><i class="far fa-copy"></i></button>
                    <button class="action-btn regen-msg-btn" title="Regenerate Response"><i class="fas fa-redo-alt"></i></button>
                `;
                content.appendChild(actionsDiv);
            }

            msgDiv.appendChild(avatar);
            msgDiv.appendChild(content);
            messagesContainer.appendChild(msgDiv);
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Update active state in sidebar
        loadChatHistory();
    }
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(el);
    });
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if(menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu li a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('is-active');
                navMenu.classList.remove('active');
            });
        });
    }
}
