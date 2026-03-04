const STORAGE_KEY = "yam-shell-haverim-v1";

const initialData = {
  role: "user",
  friends: [
    { name: "נועה", city: "תל אביב", distance: 6 },
    { name: "יואב", city: "רמת גן", distance: 12 },
    { name: "מאיה", city: "חולון", distance: 18 }
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
  ]
};

let state = loadState();

const roleSelect = document.querySelector("#role");
const friendForm = document.querySelector("#friend-form");
const friendsList = document.querySelector("#friends-list");
const distanceFilter = document.querySelector("#distance-filter");
const distanceValue = document.querySelector("#distance-value");

const meetingForm = document.querySelector("#meeting-form");
const meetingsList = document.querySelector("#meetings-list");
const meetingHint = document.querySelector("#meeting-hint");

const photoForm = document.querySelector("#photo-form");
const photosGrid = document.querySelector("#photos-grid");

const volunteerForm = document.querySelector("#volunteer-form");
const volunteersList = document.querySelector("#volunteers-list");

const donationForm = document.querySelector("#donation-form");
const donationsList = document.querySelector("#donations-list");
const donationsTotal = document.querySelector("#donations-total");

bootstrap();

function bootstrap() {
  roleSelect.value = state.role;
  distanceValue.textContent = `${distanceFilter.value} ק״מ`;

  roleSelect.addEventListener("change", () => {
    state.role = roleSelect.value;
    persist();
    renderAdminMode();
  });

  friendForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#friend-name").value.trim();
    const city = document.querySelector("#friend-city").value.trim();
    const distance = Number(document.querySelector("#friend-distance").value);
    if (!name || !city || Number.isNaN(distance)) return;

    state.friends.push({ name, city, distance });
    persist();
    friendForm.reset();
    renderFriends();
  });

  distanceFilter.addEventListener("input", () => {
    distanceValue.textContent = `${distanceFilter.value} ק״מ`;
    renderFriends();
  });

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

  renderAll();
}

function renderAll() {
  renderAdminMode();
  renderFriends();
  renderMeetings();
  renderPhotos();
  renderVolunteers();
  renderDonations();
}

function renderAdminMode() {
  const isAdmin = state.role === "admin";
  meetingForm.classList.toggle("disabled", !isAdmin);
  meetingHint.textContent = isAdmin
    ? "את/ה במצב מנהל ויכול/ה ליצור מפגשים חדשים."
    : "רק מנהל יכול ליצור מפגשים. כל המשתמשים יכולים לצפות ברשימה.";
}

function renderFriends() {
  const maxDistance = Number(distanceFilter.value);
  const visible = state.friends.filter((friend) => friend.distance <= maxDistance);

  friendsList.innerHTML = visible.length
    ? visible
        .sort((a, b) => a.distance - b.distance)
        .map(
          (friend) =>
            `<li><strong>${escapeHtml(friend.name)}</strong> · ${escapeHtml(friend.city)} · מרחק ${friend.distance} ק״מ</li>`
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
