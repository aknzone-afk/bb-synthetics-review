const googleReviewUrl =
  "https://www.google.com/search?sca_esv=881c8779ce9071b0&si=AL3DRZHrmvnFAVQPOO2Bzhf8AX9KZZ6raUI_dT7DG_z0kV2_xwTE1fvL0q_rId43sAKjLfsAo_KArqqnvcAcOhd7wbGXyxyG_aBAPs5M7EhZUmxMxj8KkUle4Tpkvhga8YNFchkdNvC0&q=B.B.+Synthetics+Reviews&sa=X&ved=2ahUKEwj5zOu0pLuTAxWpRkEAHa9YDLwQ0bkNegQIIxAF&biw=1582&bih=755&dpr=1";
const aiReviewEndpoint = "/.netlify/functions/generate-review";

const assistantConfig = {
  businessName: "B.B. Synthetics",
  category: "saree manufacturer and textile brand",
  location: "Surat, India",
  tone: "warm, trustworthy, polished, and premium",
  highlights: [
    "saree quality",
    "fabric finish",
    "design variety",
    "wholesale professionalism",
    "reliable service",
  ],
};

const variationProfiles = [
  {
    angle: "fabric quality and finishing",
    voice: "confident wholesale buyer",
    focus: ["fabric quality", "finishing", "durability"],
  },
  {
    angle: "design variety and trend relevance",
    voice: "retailer who values fresh collections",
    focus: ["design variety", "trendy patterns", "customer response"],
  },
  {
    angle: "service reliability and communication",
    voice: "business customer praising professionalism",
    focus: ["timely support", "clear communication", "trust"],
  },
  {
    angle: "premium look at fair pricing",
    voice: "buyer impressed by value",
    focus: ["pricing", "premium feel", "value for money"],
  },
  {
    angle: "consistent quality across repeat orders",
    voice: "repeat customer",
    focus: ["consistency", "repeat orders", "reliability"],
  },
  {
    angle: "bridal and festive saree appeal",
    voice: "customer focused on occasion wear",
    focus: ["bridal styles", "festive appeal", "elegance"],
  },
];

const reviewText = document.getElementById("reviewText");
const leaveReviewBtn = document.getElementById("leaveReviewBtn");
const statusPill = document.getElementById("statusPill");

const deviceIdStorageKey = "bb-synthetics-device-id-v1";

let currentReview = null;
let supabaseClient = null;

function getDeviceId() {
  let deviceId = localStorage.getItem(deviceIdStorageKey);
  if (deviceId) {
    return deviceId;
  }

  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    deviceId = window.crypto.randomUUID();
  } else {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  localStorage.setItem(deviceIdStorageKey, deviceId);
  return deviceId;
}

function setStatus(label, tone) {
  statusPill.textContent = label;
  statusPill.className = "status-pill";

  if (tone) {
    statusPill.classList.add(tone);
  }
}

function setButtonsDisabled(isDisabled) {
  leaveReviewBtn.disabled = isDisabled;
}

function setActionLabels(primaryLabel) {
  leaveReviewBtn.textContent = primaryLabel;
}

async function loadReviewFromSupabase() {
  if (!window.BBReviewConfig || !window.supabase) {
    throw new Error("Supabase config is missing.");
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      window.BBReviewConfig.supabaseUrl,
      window.BBReviewConfig.supabaseAnonKey
    );
  }

  const { data, error } = await supabaseClient.rpc("claim_next_review", {
    p_device_id: getDeviceId(),
  });

  if (error) {
    throw error;
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No reviews are currently available.");
  }

  return data[0];
}

async function loadReviewFromAI() {
  const variationProfile = variationProfiles[Math.floor(Math.random() * variationProfiles.length)];
  const response = await fetch(aiReviewEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...assistantConfig,
      variation: variationProfile,
      nonce:
        window.crypto && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Unable to generate an AI review.");
  }

  if (!payload.review_text) {
    throw new Error("The AI review service returned an empty draft.");
  }

  return payload;
}

async function renderReview(options = {}) {
  setButtonsDisabled(true);
  setActionLabels("Loading Review...");
  setStatus("Loading draft", "");

  try {
    currentReview = await loadReviewFromAI();
    reviewText.textContent = currentReview.review_text;
    setStatus("Ready", "ready");
  } catch (error) {
    try {
      currentReview = await loadReviewFromSupabase();
      reviewText.textContent = currentReview.review_text;
      setStatus("Ready", "ready");
    } catch (fallbackError) {
      currentReview = null;
      reviewText.textContent =
        "No review draft is available right now. Check the AI function configuration or refill the Supabase pool, then reload this page.";
      setStatus("Needs attention", "warning");
    }
  } finally {
    setButtonsDisabled(false);
    setActionLabels("Copy Review & Open Google");
  }
}

async function copyCurrentReview() {
  const text = currentReview ? currentReview.review_text : "";

  if (!text) {
    setStatus("No draft loaded", "warning");
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied", "ready");
    return true;
  } catch (error) {
    setStatus("Copy blocked", "warning");
    return false;
  }
}

async function leaveReview() {
  const copied = await copyCurrentReview();

  if (!copied && !currentReview) {
    return;
  }

  window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
}

renderReview();
leaveReviewBtn.addEventListener("click", leaveReview);
