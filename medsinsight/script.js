import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCFIAKIH8LR8XqFY12XvI8_t9GdjH8yQ0I",
  authDomain: "healthcare-ml-assistant.firebaseapp.com",
  projectId: "healthcare-ml-assistant",
  appId: "1:927385061300:web:9d6dc59e354d2b39b194e1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


function renderChart(summary) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  const labels = Object.keys(summary);
  const values = labels.map((k) => summary[k]["mean"] || 0);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(129, 140, 248, 0.9)");
  gradient.addColorStop(1, "rgba(79, 70, 229, 0.9)");

  if (window._csvChartInstance) {
    window._csvChartInstance.destroy();
  }

  window._csvChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Mean Values",
          data: values,
          backgroundColor: gradient,
          borderColor: "rgba(49, 46, 129, 1)",
          borderWidth: 1,
          borderRadius: 8,
          hoverBackgroundColor: "rgba(129, 140, 248, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#111827",
            font: { family: "Poppins", size: 12 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleColor: "#e5e7eb",
          bodyColor: "#f9fafb",
          borderColor: "rgba(129, 140, 248, 0.7)",
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#4b5563" },
          grid: { color: "rgba(148, 163, 184, 0.2)" },
        },
        x: {
          ticks: { color: "#4b5563" },
          grid: { display: false },
        },
      },
    },
  });

  return window._csvChartInstance;
}

const email = document.getElementById("email");
const password = document.getElementById("password");
const msg = document.getElementById("msg");
const csvMsg = document.getElementById("csvMsg");
const result = document.getElementById("result");

const authBox = document.getElementById("authBox");
const modeBox = document.getElementById("modeBox");
const patientBox = document.getElementById("patientBox");
const resultBox = document.getElementById("resultBox");  
const csvBox = document.getElementById("csvBox");
const csvResult = document.getElementById("csvResult");
const csvFile = document.getElementById("csvFile");

let chartInstance = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    afterLogin(user);
  } else {
    authBox.classList.remove("hidden");
    modeBox.classList.add("hidden");
    patientBox.classList.add("hidden");
    if (resultBox) resultBox.classList.add("hidden");
    csvBox.classList.add("hidden");
    if (csvResult) csvResult.classList.add("hidden");
  }
});



function fadeInSection(section) {
  section.classList.add('fade-in');
  setTimeout(() => section.classList.remove('fade-in'), 800);
}

function showOnlyAuth(push = true) {
  authBox.classList.remove("hidden");
  fadeInSection(authBox);
  modeBox.classList.add("hidden");
  patientBox.classList.add("hidden");
  if (resultBox) resultBox.classList.add("hidden");
  csvBox.classList.add("hidden");
  if (csvResult) csvResult.classList.add("hidden");
  setActiveNav('nav-home');
  if (push) history.pushState({page: 'auth'}, '', '#auth');
}

function showOnlyMode(push = true) {
  authBox.classList.add("hidden");
  modeBox.classList.remove("hidden");
  fadeInSection(modeBox);
  patientBox.classList.add("hidden");
  if (resultBox) resultBox.classList.add("hidden");
  csvBox.classList.add("hidden");
  if (csvResult) csvResult.classList.add("hidden");
  setActiveNav('nav-home');
  if (push) history.pushState({page: 'mode'}, '', '#mode');
}

function showOnlyPatient(push = true) {
  // Only allow if modeBox is not hidden (step-by-step)
  if (modeBox.classList.contains('hidden')) return showOnlyMode();
  authBox.classList.add("hidden");
  modeBox.classList.add("hidden");
  patientBox.classList.remove("hidden");
  fadeInSection(patientBox);
  if (resultBox) resultBox.classList.add("hidden");
  csvBox.classList.add("hidden");
  if (csvResult) csvResult.classList.add("hidden");
  setActiveNav('nav-patient');
  if (push) history.pushState({page: 'patient'}, '', '#patient');
}

function showOnlyCsv(push = true) {
  // Only allow if modeBox is not hidden (step-by-step)
  if (modeBox.classList.contains('hidden')) return showOnlyMode();
  authBox.classList.add("hidden");
  modeBox.classList.add("hidden");
  patientBox.classList.add("hidden");
  if (resultBox) resultBox.classList.add("hidden");
  csvBox.classList.remove("hidden");
  fadeInSection(csvBox);
  if (csvResult) csvResult.classList.add("hidden");
  setActiveNav('nav-dataset');
  if (push) history.pushState({page: 'csv'}, '', '#csv');
}


window.openPatientMode = () => {
  showOnlyPatient();
};

window.openDatasetMode = () => {
  showOnlyCsv();
};

window.goBackToMode = () => {
  clearPatientForm();
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  if (window._csvChartInstance) {
    window._csvChartInstance.destroy();
    window._csvChartInstance = null;
  }
  history.back();
};

// Browser navigation support
window.onpopstate = function(event) {
  const page = (event.state && event.state.page) || location.hash.replace('#','');
  if (page === 'auth') showOnlyAuth(false);
  else if (page === 'mode') showOnlyMode(false);
  else if (page === 'patient') showOnlyPatient(false);
  else if (page === 'csv') showOnlyCsv(false);
  else showOnlyMode(false);
};

// Highlight nav link
window.setActiveNav = function(id) {
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function clearPatientForm() {
  const nameEl = document.getElementById("pname");
  const ageEl = document.getElementById("age");
  const genderEl = document.getElementById("gender");
  const symptomsEl = document.getElementById("symptoms");
  const diseaseEl = document.getElementById("disease");

  if (nameEl) nameEl.value = "";
  if (ageEl) ageEl.value = "";
  if (genderEl) genderEl.value = "";
  if (symptomsEl) symptomsEl.value = "";
  if (diseaseEl) diseaseEl.value = "";
  if (result) result.innerText = "";
}

window.login = async () => {
  showMsg("Logging in...", "error");
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    afterLogin(userCredential.user);
  } catch (error) {
    console.error("Email login error:", error);
    showMsg(error.code || "Login failed. Check email/password.", "error");
  }
};

window.signup = async () => {
  showMsg("Creating account...", "error");
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    showMsg("Account created! Please login.", "success");
  } catch (error) {
    console.error("Signup error:", error);
    showMsg(
      error.code || "Signup failed. Email might already exist.",
      "error"
    );
  }
};

window.googleLogin = async () => {
  showMsg("Signing in with Google...", "error");
  try {
    const result = await signInWithPopup(auth, provider);
    afterLogin(result.user);
  } catch (error) {
    console.error("Google login error:", error);
    showMsg(error.code || "Google login failed.", "error");
  }
};

async function afterLogin(user) {
  try {
    const token = await user.getIdToken();
    const response = await fetch("http://127.0.0.1:8000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      const name = user.email?.split("@")[0] || "User";
      showMsg(`Welcome back, ${name}!`, "success");

      setTimeout(() => {
        showOnlyMode(); // auth hide, sirf mode card show
      }, 1500);
    } else {
      showMsg("Token verification failed.", "error");
      showOnlyAuth();
    }
  } catch (error) {
    console.error("Verify error:", error);
    showMsg(
      "Server connection failed. Is backend running on port 8000?",
      "error"
    );
    showOnlyAuth();
  }
}


window.submitPatient = async () => {
  const required = ["pname", "age", "gender", "symptoms"];
  for (let id of required) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      showMsg("Please fill all required fields (*)", "error");
      return;
    }
  }

  result.innerText = "🔬 Analyzing with AI...";
  document.body.classList.add("loading");

  const payload = {
    name: document.getElementById("pname").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    symptoms: document.getElementById("symptoms").value,
    disease: document.getElementById("disease").value,
  };

  try {
    const res = await fetch("http://127.0.0.1:8000/analyze_patient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    patientBox.classList.add("hidden");
    if (resultBox) {
      resultBox.classList.remove("hidden");
    }
    document.body.classList.remove("loading");

    document
      .getElementById("cond")
      .querySelector(".result-content").textContent =
      data.condition || "No information available";
    document
      .getElementById("diet")
      .querySelector(".result-content").textContent =
      data.diet || "No information available";
    document
      .getElementById("med")
      .querySelector(".result-content").textContent =
      data.medication || "No information available";
    document
      .getElementById("prec")
      .querySelector(".result-content").textContent =
      data.precautions || "No information available";
    document
      .getElementById("hosp")
      .querySelector(".result-content").textContent =
      data.hospital_advice || "No information available";
  } catch (error) {
    console.error("Patient analysis error:", error);
    document.body.classList.remove("loading");
    showMsg(
      "Analysis failed. Check if backend is running on port 8000.",
      "error"
    );
  }
};


window.uploadCSV = async () => {
  const file = csvFile.files[0];
  if (!file) {
    showCSVMsg("Please select a CSV file first", "error");
    return;
  }

  showCSVMsg("🔬 Analyzing dataset with AI...");
  document.body.classList.add("loading");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://127.0.0.1:8000/upload_csv", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    csvBox.classList.add("hidden");
    if (csvResult) {
      csvResult.classList.remove("hidden");
    }
    document.body.classList.remove("loading");

    document.getElementById("csvPrediction").innerText =
      data.prediction || "No prediction available";

    const columns = data.columns || [];
    const summary = data.summary || {};
    const firstSummaryKey = Object.keys(summary)[0];
    let rowCount = 0;

    if (
      firstSummaryKey &&
      summary[firstSummaryKey] &&
      summary[firstSummaryKey].count !== undefined
    ) {
      rowCount = summary[firstSummaryKey].count;
    }

    const numericColumns = Object.keys(summary);
    const metaText = `Rows: ${rowCount || "unknown"} • Columns: ${
      columns.length
    } • Numeric columns: ${numericColumns.length}`;
    document.getElementById("csvMeta").innerText = metaText;

    const highlightsUl = document.getElementById("csvHighlights");
    highlightsUl.innerHTML = "";

    if (numericColumns.length > 0) {
      let maxCol = numericColumns[0];
      let maxMean = summary[maxCol].mean || 0;

      numericColumns.forEach((col) => {
        const meanVal = summary[col].mean || 0;
        if (meanVal > maxMean) {
          maxMean = meanVal;
          maxCol = col;
        }
      });

      const li1 = document.createElement("li");
      li1.textContent = `Highest mean: ${maxCol} ≈ ${maxMean.toFixed(2)}`;
      highlightsUl.appendChild(li1);

      const li2 = document.createElement("li");
      li2.textContent = `Columns analyzed: ${numericColumns.join(", ")}`;
      highlightsUl.appendChild(li2);
    }

    if (summary && Object.keys(summary).length > 0) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      chartInstance = renderChart(summary);
    } else {
      showCSVMsg("No summary data returned from backend", "error");
    }
  } catch (error) {
    console.error("CSV analysis error:", error);
    document.body.classList.remove("loading");
    showCSVMsg(
      "CSV analysis failed. Check backend endpoint /upload_csv",
      "error"
    );
  }
};

window.downloadReport = () => {
  const prediction = document.getElementById("csvPrediction").innerText;
  const report = `Healthcare ML Analysis Report\n\nPrediction: ${prediction}\n\nGenerated: ${new Date().toLocaleString()}`;
  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "health_analysis_report.txt";
  a.click();
  URL.revokeObjectURL(url);
};


function showMsg(text, type = "") {
  msg.textContent = text;
  msg.className = `msg ${type}`;
}

function showCSVMsg(text, type = "") {
  csvMsg.textContent = text;
  csvMsg.className = `msg ${type}`;
}


const btn = document.getElementById("chatbot-button");
const win = document.getElementById("chatbot-window");
const closeBtn = document.getElementById("chatbot-close");
const input = document.getElementById("chatbot-input");
const sendBtn = document.getElementById("chatbot-send");
const messages = document.getElementById("chatbot-messages");

btn.onclick = () => {
  win.style.display = "flex";
  input.focus();
};

closeBtn.onclick = () => {
  win.style.display = "none";
};

function addMessage(text, sender = "bot") {
  const wrapper = document.createElement("div");
  wrapper.classList.add("chat-msg");
  wrapper.classList.add(sender === "user" ? "chat-user" : "chat-bot");

  const bubble = document.createElement("span");
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const question = input.value.trim();
  if (!question) return;

  addMessage(question, "user");
  input.value = "";
  input.focus();

  addMessage("Thinking...", "bot");
  const thinkingBubble = messages.lastChild.querySelector("span");

  sendBtn.disabled = true;

  try {
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    thinkingBubble.textContent =
      data.answer || "Sorry, I could not generate a response.";
  } catch (err) {
    thinkingBubble.textContent = "Error: unable to reach chatbot.";
    console.error(err);
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

addMessage(
  "Hi! Ask me anything about your health or data dashboard.",
  "bot"
);

let hospitalMap;
let hospitalMarkers = [];

function initHospitalMap() {
  const mapDiv = document.getElementById("osm-map");
  if (!mapDiv) return;

  hospitalMap = L.map("osm-map").setView([26.9124, 75.7873], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(hospitalMap);

  const marker = L.marker([26.9124, 75.7873]).addTo(hospitalMap);
  marker.bindPopup("Default location: Jaipur").openPopup();
  hospitalMarkers.push(marker);
}

async function searchHospitals() {
  const input = document.getElementById("map-query");
  if (!input || !hospitalMap) return;

  const query = input.value.trim();
  if (!query) return;

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=15&q=" +
    encodeURIComponent(query + " hospital");

  try {
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
      },
    });

    const data = await res.json();

    hospitalMarkers.forEach((m) => hospitalMap.removeLayer(m));
    hospitalMarkers = [];

    if (!data.length) {
      alert("No hospitals found for this search.");
      return;
    }

    const bounds = [];
    data.forEach((place) => {
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      const name = place.display_name || "Hospital";

      const marker = L.marker([lat, lon]).addTo(hospitalMap);
      marker.bindPopup(name);
      hospitalMarkers.push(marker);
      bounds.push([lat, lon]);
    });

    if (bounds.length) {
      hospitalMap.fitBounds(bounds, { padding: [20, 20] });
    }
  } catch (err) {
    console.error("Hospital search error:", err);
    alert("Error while searching hospitals. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHospitalMap();

  const mapSearchBtn = document.getElementById("map-search-btn");
  const mapQueryInput = document.getElementById("map-query");

  if (mapSearchBtn) {
    mapSearchBtn.addEventListener("click", searchHospitals);
  }
  if (mapQueryInput) {
    mapQueryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchHospitals();
      }
    });
  }
});
