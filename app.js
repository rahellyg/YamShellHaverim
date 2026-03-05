const STORAGE_KEY = "yam-shell-haverim-v1";
const USERS_DB_KEY = "yam-users-db";

// Predefined manager credentials
const MANAGER_CREDENTIALS = {
  email: "admin@yamshell.com",
  password: "Manager2026!",
  name: "מנהל ראשי"
};

// Firebase Configuration (replace with your own Firebase project config)
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey-ReplaceWithYourOwnKey",
  authDomain: "yamshell-demo.firebaseapp.com",
  projectId: "yamshell-demo",
  storageBucket: "yamshell-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Check if Firebase is properly configured (not using demo key)
const isFirebaseConfigured = !firebaseConfig.apiKey.includes("Demo");

// Initialize Firebase (check if already initialized)
let firebaseApp;
let auth;
if (isFirebaseConfigured) {
  try {
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    auth = firebase.auth();
  } catch (error) {
    console.warn("Firebase initialization failed:", error.message);
  }
}

const initialData = {
  role: null,
  isLoggedIn: false,
  userEmail: null,
  userName: null,
  friends: [
    { name: "נועה", city: "תל אביב", distance: 6, age: 24, interests: "ספורט, מוזיקה", profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=60" },
    { name: "יואב", city: "רמת גן", distance: 12, age: 26, interests: "טכנולוגיה, טבע", profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=60" },
    { name: "מאיה", city: "חולון", distance: 18, age: 23, interests: "אמנות, קריאה", profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=60" }
  ],
  meetings: [
    { title: "מפגש מחזור", date: "2026-04-12", location: "פארק הירקון" }
  ],
  photos: [
    {
      title: "טיול שנתי - כיתה א׳",
      url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=60"
    }
  ],
  volunteers: [
    { name: "רוני", skill: "צילום" }
  ],
  donations: [
    { donor: "משפחת כהן", amount: 250 }
  ],
  conversations: [
    {
      id: 1,
      participantName: "נועה",
      messages: [
        { sender: "נועה", text: "היי! מה קורה?", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { sender: "", text: "היי! הכל בסדר, איך אתך?", timestamp: new Date(Date.now() - 3000000).toISOString() },
        { sender: "נועה", text: "מעולה! רוצה להיפגש מחר?", timestamp: new Date(Date.now() - 2400000).toISOString() }
      ]
    }
  ],
  currentChatId: null
};

let state = loadState();

// Login screen elements
const loginScreen = document.querySelector("#login-screen");
const tabUser = document.querySelector("#tab-user");
const tabManager = document.querySelector("#tab-manager");
const authError = document.querySelector("#auth-error");

// Forms
const userLoginForm = document.querySelector("#user-login-form");
const userRegisterForm = document.querySelector("#user-register-form");
const managerLoginForm = document.querySelector("#manager-login-form");
const showRegisterLink = document.querySelector("#show-register");
const showLoginLink = document.querySelector("#show-login");
const googleSigninUser = document.querySelector("#google-signin-user");

// App content elements
const appContent = document.querySelector("#app-content");
const currentRoleLabel = document.querySelector("#current-role-label");
const logoutBtn = document.querySelector("#logout-btn");

// Form and list elements
const friendForm = document.querySelector("#friend-form");
const friendsList = document.querySelector("#friends-list");
const distanceFilter = document.querySelector("#distance-filter");
const distanceValue = document.querySelector("#distance-value");

const meetingForm = document.querySelector("#meeting-form");
const meetingsList = document.querySelector("#meetings-list");

const photoForm = document.querySelector("#photo-form");
const photosGrid = document.querySelector("#photos-grid");

const volunteerForm = document.querySelector("#volunteer-form");
const volunteersList = document.querySelector("#volunteers-list");

const donationForm = document.querySelector("#donation-form");
const donationsList = document.querySelector("#donations-list");
const donationsTotal = document.querySelector("#donations-total");

// Chat elements
const conversationsList = document.querySelector("#conversations-list");
const chatMessages = document.querySelector("#chat-messages");
const chatMessageForm = document.querySelector("#chat-message-form");
const chatMessageInput = document.querySelector("#chat-message-input");
const newConversationBtn = document.querySelector("#new-conversation-btn");

bootstrap();

function bootstrap() {
  // Setup tab switching
  tabUser.addEventListener("click", () => switchTab("user"));
  tabManager.addEventListener("click", () => switchTab("manager"));

  // Setup form handlers
  userLoginForm.addEventListener("submit", handleUserLogin);
  userRegisterForm.addEventListener("submit", handleUserRegister);
  managerLoginForm.addEventListener("submit", handleManagerLogin);
  
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    userLoginForm.classList.add("hidden");
    userRegisterForm.classList.remove("hidden");
  });
  
  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    userRegisterForm.classList.add("hidden");
    userLoginForm.classList.remove("hidden");
  });

  // Google Sign-In
  if (googleSigninUser) {
    googleSigninUser.addEventListener("click", handleGoogleSignIn);
    // Note: Button will show an error if Firebase is not properly configured
  }

  logoutBtn.addEventListener("click", logout);

  // Check if already logged in
  if (state.isLoggedIn && state.role) {
    showApp();
  } else {
    showLogin();
  }

  // Setup form handlers
  distanceValue.textContent = `${distanceFilter.value} ק״מ`;

  friendForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#friend-name").value.trim();
    const city = document.querySelector("#friend-city").value.trim();
    const distance = Number(document.querySelector("#friend-distance").value);
    const age = Number(document.querySelector("#friend-age").value);
    const interests = document.querySelector("#friend-interests").value.trim();
    const profilePic = document.querySelector("#friend-profile-pic").value.trim();
    if (!name || !city || Number.isNaN(distance) || Number.isNaN(age) || !interests) return;

    state.friends.push({ name, city, distance, age, interests, profilePic: profilePic || null });
    persist();
    friendForm.reset();
    renderFriends();
  });

  distanceFilter.addEventListener("input", () => {
    distanceValue.textContent = `${distanceFilter.value} ק״מ`;
    renderFriends();
  });

  const ageMin = document.querySelector("#age-min");
  const ageMax = document.querySelector("#age-max");
  const interestFilter = document.querySelector("#interest-filter");
  if (ageMin) ageMin.addEventListener("input", renderFriends);
  if (ageMax) ageMax.addEventListener("input", renderFriends);
  if (interestFilter) interestFilter.addEventListener("input", renderFriends);

  meetingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.role !== "admin") return;

    const title = document.querySelector("#meeting-title").value.trim();
    const date = document.querySelector("#meeting-date").value;
    const location = document.querySelector("#meeting-location").value.trim();
    if (!title || !date || !location) return;

    state.meetings.push({ title, date, location });
    state.meetings.sort((a, b) => a.date.localeCompare(b.date));
    persist();
    meetingForm.reset();
    renderMeetings();
  });

  photoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.querySelector("#photo-title").value.trim();
    const url = document.querySelector("#photo-url").value.trim();
    if (!title || !url) return;

    state.photos.unshift({ title, url });
    persist();
    photoForm.reset();
    renderPhotos();
  });

  volunteerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#volunteer-name").value.trim();
    const skill = document.querySelector("#volunteer-skill").value.trim();
    if (!name || !skill) return;

    state.volunteers.push({ name, skill });
    persist();
    volunteerForm.reset();
    renderVolunteers();
  });

  donationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const donor = document.querySelector("#donor-name").value.trim();
    const amount = Number(document.querySelector("#donation-amount").value);
    if (!donor || Number.isNaN(amount) || amount <= 0) return;

    state.donations.push({ donor, amount });
    persist();
    donationForm.reset();
    renderDonations();
  });

  // Chat event listeners
  chatMessageForm.addEventListener("submit", handleSendMessage);
  newConversationBtn.addEventListener("click", handleNewConversation);

  renderAll();
}

// Tab Switching
function switchTab(tab) {
  hideError();
  
  if (tab === "user") {
    tabUser.classList.add("active");
    tabManager.classList.remove("active");
    userLoginForm.classList.remove("hidden");
    userRegisterForm.classList.add("hidden");
    managerLoginForm.classList.add("hidden");
  } else {
    tabManager.classList.add("active");
    tabUser.classList.remove("active");
    userLoginForm.classList.add("hidden");
    userRegisterForm.classList.add("hidden");
    managerLoginForm.classList.remove("hidden");
  }
}

// Error Display
function showError(message) {
  authError.textContent = message;
  authError.classList.remove("hidden");
}

function hideError() {
  authError.classList.add("hidden");
}

// User Login
function handleUserLogin(e) {
  e.preventDefault();
  hideError();
  
  const email = document.querySelector("#user-email").value.trim();
  const password = document.querySelector("#user-password").value;
  
  const users = getUsersDB();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    login("user", email, user.name);
  } else {
    showError("אימייל או סיסמה שגויים");
  }
}

// User Registration
function handleUserRegister(e) {
  e.preventDefault();
  hideError();
  
  const name = document.querySelector("#register-name").value.trim();
  const email = document.querySelector("#register-email").value.trim();
  const password = document.querySelector("#register-password").value;
  
  const users = getUsersDB();
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    showError("משתמש עם אימייל זה כבר קיים");
    return;
  }
  
  // Add new user
  users.push({ name, email, password, createdAt: new Date().toISOString() });
  saveUsersDB(users);
  
  // Auto login after registration
  login("user", email, name);
}

// Manager Login
function handleManagerLogin(e) {
  e.preventDefault();
  hideError();
  
  const email = document.querySelector("#manager-email").value.trim();
  const password = document.querySelector("#manager-password").value;
  
  if (email === MANAGER_CREDENTIALS.email && password === MANAGER_CREDENTIALS.password) {
    login("admin", email, MANAGER_CREDENTIALS.name);
  } else {
    showError("פרטי כניסה שגויים למנהל");
  }
}

// Google Sign-In
async function handleGoogleSignIn() {
  hideError();
  
  if (!isFirebaseConfigured || !auth) {
    showError("Google Sign-In לא זמין. הגדר את Firebase או השתמש בהרשמה רגילה.");
    return;
  }
  
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    
    // Add to users DB if not exists
    const users = getUsersDB();
    if (!users.find(u => u.email === user.email)) {
      users.push({
        name: user.displayName || "משתמש Google",
        email: user.email,
        password: null, // Google auth users don't have password
        googleAuth: true,
        createdAt: new Date().toISOString()
      });
      saveUsersDB(users);
    }
    
    login("user", user.email, user.displayName || "משתמש Google");
  } catch (error) {
    // Only show error if it's not about Firebase config
    if (!error.message.includes("api-key")) {
      console.error("Google sign-in error:", error);
      showError("שגיאה בכניסה עם Google. אנא נסה שוב.");
    }
  }
}

// Login Function
function login(role, email, name) {
  state.role = role;
  state.isLoggedIn = true;
  state.userEmail = email;
  state.userName = name;
  persist();
  showApp();
}

function logout() {
  // Sign out from Firebase if applicable
  if (auth && auth.currentUser) {
    try {
      auth.signOut();
    } catch (error) {
      // Silently ignore Firebase sign-out errors
    }
  }
  
  state.role = null;
  state.isLoggedIn = false;
  state.userEmail = null;
  state.userName = null;
  persist();
  showLogin();
  
  // Reset forms
  userLoginForm.reset();
  userRegisterForm.reset();
  managerLoginForm.reset();
  switchTab("user");
}

function showLogin() {
  loginScreen.classList.remove("hidden");
  appContent.classList.add("hidden");
  hideError();
}

function showApp() {
  loginScreen.classList.add("hidden");
  appContent.classList.remove("hidden");
  
  // Update role label
  const roleText = state.role === "admin" ? `מנהל: ${state.userName}` : `משתמש: ${state.userName}`;
  currentRoleLabel.textContent = roleText;
  
  // Show/hide sections based on role
  filterSectionsByRole();
  
  // Render content
  renderAll();
}

// Users Database (localStorage)
function getUsersDB() {
  try {
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsersDB(users) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

function filterSectionsByRole() {
  const sections = document.querySelectorAll(".card");
  sections.forEach(section => {
    if (state.role === "admin") {
      // Admin sees everything
      section.style.display = "";
    } else if (state.role === "user") {
      // User sees only sections marked with section-user
      if (section.classList.contains("section-admin") && !section.classList.contains("section-user")) {
        section.style.display = "none";
      } else {
        section.style.display = "";
      }
    }
  });
}

function renderAll() {
  renderFriends();
  renderMeetings();
  renderPhotos();
  renderVolunteers();
  renderDonations();
  renderConversations();
  renderChatMessages();
}

function renderAdminMode() {
  // No longer needed as we filter sections
}

function renderFriends() {
  const maxDistance = Number(distanceFilter.value);
  const ageMin = Number(document.querySelector("#age-min")?.value || 0) || 0;
  const ageMax = Number(document.querySelector("#age-max")?.value || 120) || 120;
  const interestSearch = document.querySelector("#interest-filter")?.value.trim().toLowerCase() || "";

  const visible = state.friends.filter((friend) => {
    const matchDistance = friend.distance <= maxDistance;
    const matchAge = (!friend.age) || (friend.age >= ageMin && friend.age <= ageMax);
    const matchInterest = !interestSearch || (friend.interests && friend.interests.toLowerCase().includes(interestSearch));
    return matchDistance && matchAge && matchInterest;
  });

  friendsList.innerHTML = visible.length
    ? visible
        .sort((a, b) => a.distance - b.distance)
        .map(
          (friend) => {
            const profileImg = friend.profilePic ? `<img src="${escapeAttribute(friend.profilePic)}" alt="${escapeAttribute(friend.name)}" class="friend-profile-pic" />` : '<div class="friend-profile-pic placeholder">📷</div>';
            return `<li class="friend-card">
              ${profileImg}
              <div class="friend-info">
                <strong>${escapeHtml(friend.name)}</strong>
                <div class="friend-details">
                  <span>${escapeHtml(friend.city)}</span>
                  ${friend.age ? `<span>גיל ${friend.age}</span>` : ''}
                  <span>${friend.distance} ק״מ</span>
                </div>
                ${friend.interests ? `<div class="friend-interests">תחומי עניין: ${escapeHtml(friend.interests)}</div>` : ''}
              </div>
            </li>`;
          }
        )
        .join("")
    : "<li>לא נמצאו חברים בטווח שנבחר.</li>";
}

function renderMeetings() {
  meetingsList.innerHTML = state.meetings.length
    ? state.meetings
        .map(
          (meeting) =>
            `<li><strong>${escapeHtml(meeting.title)}</strong> · ${formatDate(meeting.date)} · ${escapeHtml(meeting.location)}</li>`
        )
        .join("")
    : "<li>אין מפגשים כרגע.</li>";
}

function renderPhotos() {
  photosGrid.innerHTML = state.photos.length
    ? state.photos
        .map(
          (photo) => `
            <article class="photo-card">
              <img src="${escapeAttribute(photo.url)}" alt="${escapeAttribute(photo.title)}" loading="lazy" />
              <p>${escapeHtml(photo.title)}</p>
            </article>`
        )
        .join("")
    : "<p>אין תמונות בארכיון עדיין.</p>";
}

function renderVolunteers() {
  volunteersList.innerHTML = state.volunteers.length
    ? state.volunteers
        .map(
          (volunteer) =>
            `<li><strong>${escapeHtml(volunteer.name)}</strong> · עזרה ב${escapeHtml(volunteer.skill)}</li>`
        )
        .join("")
    : "<li>עדיין אין מתנדבים.</li>";
}

function renderDonations() {
  donationsList.innerHTML = state.donations.length
    ? state.donations
        .map(
          (donation) =>
            `<li><strong>${escapeHtml(donation.donor)}</strong> · ${donation.amount.toLocaleString("he-IL")} ₪</li>`
        )
        .join("")
    : "<li>עדיין אין תרומות.</li>";

  const total = state.donations.reduce((sum, item) => sum + item.amount, 0);
  donationsTotal.textContent = `סה״כ תרומות: ${total.toLocaleString("he-IL")} ₪`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(initialData);

    const parsed = JSON.parse(raw);
    return {
      role: parsed.role ?? initialData.role,
      isLoggedIn: parsed.isLoggedIn ?? initialData.isLoggedIn,
      userEmail: parsed.userEmail ?? initialData.userEmail,
      userName: parsed.userName ?? initialData.userName,
      friends: Array.isArray(parsed.friends) ? parsed.friends : initialData.friends,
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings : initialData.meetings,
      photos: Array.isArray(parsed.photos) ? parsed.photos : initialData.photos,
      volunteers: Array.isArray(parsed.volunteers) ? parsed.volunteers : initialData.volunteers,
      donations: Array.isArray(parsed.donations) ? parsed.donations : initialData.donations
    };
  } catch {
    return structuredClone(initialData);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDate(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return dateInput;
  return date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

// Chat functions
function handleSendMessage(e) {
  e.preventDefault();
  
  const messageText = chatMessageInput.value.trim();
  if (!messageText) return;
  
  if (!state.currentChatId) {
    alert("אנא בחר שיחה");
    return;
  }
  
  const conversation = state.conversations.find(c => c.id === state.currentChatId);
  if (!conversation) return;
  
  conversation.messages.push({
    sender: "",
    text: messageText,
    timestamp: new Date().toISOString()
  });
  
  chatMessageInput.value = "";
  
  // Simulate other person's response after a short delay
  setTimeout(() => {
    conversation.messages.push({
      sender: conversation.participantName,
      text: "תודה על ההודעה! " + getRandomResponse(),
      timestamp: new Date().toISOString()
    });
    renderChatMessages();
  }, 1500);
  
  persist();
  renderChatMessages();
}

function getRandomResponse() {
  const responses = [
    "מעניין!",
    "בטוח!",
    "כן, הסכמתי!",
    "תיקח בחשבון 😊",
    "יופי!",
    "זה מעולה!",
    "נשמע טוב!",
    "אני מסכים!",
    "יופי, נחזור אל זה מאוחר יותר"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function handleNewConversation() {
  if (state.friends.length === 0) {
    alert("אין חברים זמינים");
    return;
  }
  
  const friendName = state.friends[Math.floor(Math.random() * state.friends.length)].name;
  
  const newConvo = {
    id: Date.now(),
    participantName: friendName,
    messages: [
      {
        sender: friendName,
        text: "שלום! איך קורה?",
        timestamp: new Date().toISOString()
      }
    ]
  };
  
  state.conversations.push(newConvo);
  state.currentChatId = newConvo.id;
  persist();
  renderConversations();
  renderChatMessages();
}

function renderConversations() {
  conversationsList.innerHTML = "";
  
  if (state.conversations.length === 0) {
    conversationsList.innerHTML = '<p class="no-conversations">אין שיחות עדיין</p>';
    return;
  }
  
  state.conversations.forEach(convo => {
    const div = document.createElement("div");
    div.className = "conversation-item";
    if (convo.id === state.currentChatId) {
      div.classList.add("active");
    }
    
    const unreadCount = convo.messages.filter(m => m.sender !== "").length;
    const lastMessage = convo.messages[convo.messages.length - 1];
    const preview = lastMessage.text.substring(0, 30) + (lastMessage.text.length > 30 ? "..." : "");
    
    div.innerHTML = `
      ${convo.participantName}
      ${unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : ""}
    `;
    
    div.addEventListener("click", () => {
      state.currentChatId = convo.id;
      persist();
      renderConversations();
      renderChatMessages();
    });
    
    conversationsList.appendChild(div);
  });
}

function renderChatMessages() {
  chatMessages.innerHTML = "";
  
  if (!state.currentChatId) {
    chatMessages.innerHTML = '<div class="no-messages">בחר שיחה מהרשימה</div>';
    return;
  }
  
  const conversation = state.conversations.find(c => c.id === state.currentChatId);
  if (!conversation || conversation.messages.length === 0) {
    chatMessages.innerHTML = '<div class="no-messages">אין הודעות עדיין</div>';
    return;
  }
  
  conversation.messages.forEach(msg => {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    
    if (msg.sender === "") {
      messageDiv.classList.add("own");
    } else {
      messageDiv.classList.add("other");
    }
    
    const time = new Date(msg.timestamp);
    const timeStr = time.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    
    const contentDiv = `
      <div class="chat-message-content">
        <div class="chat-message-bubble">${escapeHtml(msg.text)}</div>
        <span class="chat-message-time">${timeStr}</span>
      </div>
    `;
    
    if (msg.sender !== "") {
      messageDiv.innerHTML = `
        <span class="chat-message-sender">${escapeHtml(msg.sender)}</span>
        ${contentDiv}
      `;
    } else {
      messageDiv.innerHTML = contentDiv;
    }
    
    chatMessages.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;
}
