const API_BASE = "http://localhost:8000"; // adjust to your backend

document.addEventListener("DOMContentLoaded", () => {
  applyStoredTheme();
  setupThemeToggle();
  setupHeroButtons();
  setupMatchModal();
  setupClickableCards();
  setupFeed();
  setupChats();
  setupAccount();
});

/* THEME: apply stored preference on each page */
function applyStoredTheme() {
  const saved = localStorage.getItem("pc-theme"); // "light" or "dark"
  const body = document.body;

  if (saved === "light") {
    body.classList.add("theme-light");
  } else if (saved === "dark") {
    body.classList.remove("theme-light");
  } else {
    // default: dark (no theme-light class)
    body.classList.remove("theme-light");
  }
}

/* THEME: set up the toggle button */
function setupThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return; // page doesn't have a toggle

  // Set initial icon based on current class
  const isLight = document.body.classList.contains("theme-light");
  btn.textContent = isLight ? "🌙" : "☀️";

  btn.addEventListener("click", () => {
    const nowLight = !document.body.classList.contains("theme-light");

    if (nowLight) {
      document.body.classList.add("theme-light");
      localStorage.setItem("pc-theme", "light");
      btn.textContent = "🌙"; // show moon (click to go dark)
    } else {
      document.body.classList.remove("theme-light");
      localStorage.setItem("pc-theme", "dark");
      btn.textContent = "☀️"; // show sun (click to go light)
    }
  });
}


/* TOAST */

let toastTimeout;
function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.add("hidden"), 2500);
}

/* HERO BUTTONS + NAV */

function setupHeroButtons() {
  const explore = document.getElementById("ctaExplore");
  const account = document.getElementById("ctaAccount");

  if (explore) {
    explore.addEventListener("click", () => {
      window.location.href = "feed.html";
    });
  }
  if (account) {
    account.addEventListener("click", () => {
      window.location.href = "account.html";
    });
  }
}

/* CLICKABLE CARDS (Home) */

function setupClickableCards() {
  document.querySelectorAll(".card.clickable").forEach((card) => {
    const link = card.getAttribute("data-link");
    if (!link) return;
    card.addEventListener("click", () => {
      window.location.href = link;
    });
  });
}

/* MATCH MODAL (Home) */

function setupMatchModal() {
  const openBtn = document.getElementById("joinBtn");
  const modal = document.getElementById("matchModal");
  const closeBtn = document.getElementById("closeModal");
  const form = document.getElementById("matchForm");

  // Steps elements (ensure these exist in your index.html as provided in the previous response)
  const step1 = document.getElementById("matchStep1");
  const step2 = document.getElementById("matchStep2");
  const step3 = document.getElementById("matchStep3");
  const confirmBtn = document.getElementById("confirmMatchBtn");

  if (!modal || !openBtn) return;

  // Open Modal - Reset to Step 1
  openBtn.addEventListener("click", () => {
    if(step1) step1.classList.remove("hidden");
    if(step2) step2.classList.add("hidden");
    if(step3) step3.classList.add("hidden");
    modal.classList.remove("hidden");
  });

  closeBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Handle Search Logic
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    // 1. Show Loading
    step1.classList.add("hidden");
    step2.classList.remove("hidden");

    // 2. Wait 1.5 seconds then show Result (Simulating backend search)
    setTimeout(() => {
        step2.classList.add("hidden");
        step3.classList.remove("hidden");
    }, 1500);
  });

  // Handle Confirm Match (Task 2 -> Task 3 Transition)
  confirmBtn?.addEventListener("click", () => {
      // 1. Close modal
      modal.classList.add("hidden");

      // 2. Tell the browser we want to open the "Sarah J" chat
      localStorage.setItem("openChatID", "new_match_sarah");

      // 3. Redirect to chats page
      window.location.href = "chats.html";
  });
}
/* FEED PAGE */

async function setupFeed() {
  const container = document.getElementById("posts-container");
  const form = document.getElementById("newPostForm");
  const input = document.getElementById("postContent");

  if (!container) return;

  // HARDCODED POSTS (Task: Feed Depth)
  const sample = [
    {
      id: 1,
      username: "Jordan Diaz",
      content: "Need 2 players for 3.0–3.5 doubles at Lincoln Courts tonight! 🏓",
      createdAt: "2 min ago",
      likes: 4,
    },
    {
      id: 2,
      username: "Aliyah Stone",
      content: "Just played the longest rally of my life... 31 hits 🤯 #PickleballAddict",
      createdAt: "1 hr ago",
      likes: 12,
    },
    {
      id: 3,
      username: "Coach Mike",
      content: "Tournament sign-ups for next Saturday are now OPEN. DM me for details.",
      createdAt: "3 hrs ago",
      likes: 25,
    },
    {
        id: 4,
        username: "Sarah J.",
        content: "Anyone up for a quick match at Pine Lake? I'm rated 3.5.",
        createdAt: "5 hrs ago",
        likes: 8,
    }
  ];

  // Render hardcoded posts immediately
  renderPosts(container, sample);

  if (form && input) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      const newPost = {
        id: Date.now(),
        username: "You", // In a real app, this is the logged in user
        content: text,
        createdAt: "Just now",
        likes: 0,
      };
      prependPost(container, newPost);
      input.value = "";
      showToast("Post created successfully!");
    });
  }
}

function renderPosts(container, posts) {
  container.innerHTML = "";
  posts.forEach((post) => prependPost(container, post, false));
}

function prependPost(container, post, toTop = true) {
  const card = document.createElement("article");
  card.className = "post-card";
  card.innerHTML = `
    <div class="post-header">
      <div>
        <div class="post-user">${post.username}</div>
        <div class="post-meta">${post.createdAt ?? ""}</div>
      </div>
    </div>
    <div class="post-body">${escapeHtml(post.content)}</div>
    <div class="post-actions">
      <button class="like-btn" data-likes="${post.likes ?? 0}">
        <span>💚</span>
        <span class="like-label">Rally</span>
        <span class="like-count">${post.likes ?? 0}</span>
      </button>
    </div>
  `;

  // like button behavior
  const likeBtn = card.querySelector(".like-btn");
  likeBtn.addEventListener("click", () => {
    const countSpan = likeBtn.querySelector(".like-count");
    let count = parseInt(likeBtn.dataset.likes || "0", 10);
    const liked = likeBtn.classList.toggle("liked");
    count = liked ? count + 1 : Math.max(0, count - 1);
    likeBtn.dataset.likes = count;
    countSpan.textContent = count;
  });

  if (toTop && container.firstChild) {
    container.prepend(card);
  } else {
    container.appendChild(card);
  }
}

/* CHATS PAGE */

async function setupChats() {
  const list = document.getElementById("chatList");
  const msgContainer = document.getElementById("chatMessages");
  const title = document.getElementById("chatTitle");
  const meta = document.getElementById("chatMeta");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatText");

  if (!list || !msgContainer) return;

  // 1. Define Hardcoded Chats (including our Match Opponent "Sarah J.")
  const chats = [
      {
        id: "new_match_sarah", // This ID matches what we set in setupMatchModal
        name: "Sarah J. (Match Opponent)",
        lastMessage: "Match Accepted! Let's play.",
        timestamp: "Just now",
        messages: [
          { from: "system", text: "You matched with Sarah J. (Rating 3.4)" },
          { from: "them", text: "Hey! I saw we matched at Lincoln Park. Does 6pm work?" },
        ],
      },
      {
        id: 1,
        name: "Doubles Crew",
        lastMessage: "Same time Thursday?",
        timestamp: "3m ago",
        messages: [
          { from: "them", text: "You free around 6?" },
          { from: "me", text: "Yep, let's do it." },
        ],
      },
      {
        id: 2,
        name: "League Captain",
        lastMessage: "Roster locked in.",
        timestamp: "1h ago",
        messages: [
          { from: "them", text: "You’re playing court 3 this week." },
        ],
      },
  ];

  // 2. Check if we need to auto-open a specific chat (from localStorage)
  const autoOpenID = localStorage.getItem("openChatID");

  // Render the list
  let activeChat = null;

  chats.forEach((chat) => {
    const li = document.createElement("li");
    li.className = "chat-item";
    li.dataset.id = chat.id;

    // If this is the new match, highlight it distinctively
    const isNew = (chat.id === "new_match_sarah");
    li.innerHTML = `
      <strong>${chat.name} ${isNew ? '✨' : ''}</strong>
      <small>${chat.lastMessage} • ${chat.timestamp}</small>
    `;

    // Click Handler
    li.addEventListener("click", () => {
      document.querySelectorAll(".chat-item").forEach((x) => x.classList.remove("active"));
      li.classList.add("active");
      activeChat = chat;
      renderChat(chat, title, meta, msgContainer, input, form);
    });

    list.appendChild(li);

    // AUTO-OPEN LOGIC: If this matches our redirect ID, click it automatically!
    if (autoOpenID === chat.id.toString()) {
        li.click(); // Simulate click
        localStorage.removeItem("openChatID"); // Clear it so it doesn't happen every time
    }
  });

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!activeChat) return;
      const text = input.value.trim();
      if (!text) return;

      const msg = { from: "me", text };
      activeChat.messages.push(msg);
      appendChatMessage(msgContainer, msg);
      input.value = "";
    });
  }
}

function renderChat(chat, title, meta, msgContainer, input, form) {
  title.textContent = chat.name;
  meta.textContent = `${chat.messages.length} message(s)`;
  msgContainer.innerHTML = "";

  chat.messages.forEach((m) => appendChatMessage(msgContainer, m));

  if (input && form) {
    input.disabled = false;
    form.querySelector("button").disabled = false;
  }
}

function appendChatMessage(container, msg) {
  const div = document.createElement("div");
  div.className = `chat-message ${msg.from}`;
  div.textContent = msg.text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/* ACCOUNT PAGE */

async function setupAccount() {
  const list = document.getElementById("settingList");
  if (!list) return;

  try {
    const res = await fetch(`${API_BASE}/api/account`);
    if (!res.ok) throw new Error();
    const account = await res.json();
    renderAccount(list, account);
  } catch {
    const sample = [
      {
        id: 1,
        Setting: "Name",
        CurrentData: "John Doe",
      },
      {
        id: 2,
        Setting: "Username",
        CurrentData: "JohnDoe123",
      },
      {
        id: 3,
        Setting: "Mobile Number",
        CurrentData: "(123) 456-7890",
      },
      {
        id: 4,
        Setting: "Email",
        CurrentData: "picklecloud@gmail.com",
      },
      {
        id: 5,
        Setting: "Birthday",
        CurrentData: "09-11-2001",
      },
      {
        id: 6,
        Setting: "Password",
        CurrentData: "********",
      },
      {
        id: 7,
        Setting: "Notification",
        CurrentData: "Yes",
      },
      {
        id: 8,
        Setting: "Delete Account",
        CurrentData: "",
      },
    ];
    renderAccount(list, sample);
  }
}

function renderAccount(list, items) {
  list.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("article");
    div.className = "post-card";

    // Special UI for Notification toggle
    if (item.Setting === "Notification") {
      div.innerHTML = `
        <div class="post-header">
          <div class="post-user">${item.Setting}</div>
        </div>
        <div class="post-body">
          <label class="switch">
            <input type="checkbox" id="notifToggle" ${item.CurrentData === "Yes" ? "checked" : ""}>
            <span class="slider"></span>
          </label>
        </div>
      `;
    }

    // Special UI for Delete Account button
    else if (item.Setting === "Delete Account") {
      div.innerHTML = `
        <div class="post-header">
          <div class="post-user">${item.Setting}</div>
        </div>
        <div class="post-body">
          <button id="deleteAccountBtn" class="danger-btn">Delete Account</button>
        </div>
      `;
    }

    // Default standard rows
    else {
      div.innerHTML = `
        <div class="post-header">
          <div class="post-user">${item.Setting}</div>
        </div>
        <div class="post-body">${item.CurrentData ?? ""}</div>
      `;
    }

    list.appendChild(div);
  });

  // Event handlers (if needed)
  document.getElementById("notifToggle")?.addEventListener("change", (e) => {
    const enabled = e.target.checked;
    showToast(`Notifications ${enabled ? "enabled" : "disabled"}`);
    // POST/PATCH to backend here when wired
  });

  document.getElementById("deleteAccountBtn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to permanently delete your account?")) {
      showToast("Request to delete account sent");
      // DELETE /api/account  <-- backend eventually
    }
  });
}


/* UTIL */

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function selectCourt(element, courtName) {
    // Remove active class from others
    document.querySelectorAll('.court-item').forEach(el => el.style.borderColor = 'var(--border)');
    document.querySelectorAll('.court-item').forEach(el => el.style.background = 'transparent');

    // Add active style to clicked
    element.style.borderColor = 'var(--accent)';
    element.style.background = 'rgba(34, 197, 94, 0.1)';

    showToast(`Home court set to: ${courtName}`);
}
