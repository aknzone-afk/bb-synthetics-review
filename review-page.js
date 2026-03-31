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
const helperText = document.getElementById("helperText");
const leaveReviewBtn = document.getElementById("leaveReviewBtn");
const copyOnlyBtn = document.getElementById("copyOnlyBtn");
const newDraftBtn = document.getElementById("newDraftBtn");
const keywordRow = document.getElementById("keywordRow");
const statusPill = document.getElementById("statusPill");
const poolStatus = document.getElementById("poolStatus");

const deviceIdStorageKey = "bb-synthetics-device-id-v1";
const recentReviewsStorageKey = "bb-synthetics-recent-reviews-v1";

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

function setKeywordPills(keywords) {
  keywordRow.innerHTML = "";

  if (!Array.isArray(keywords) || keywords.length === 0) {
    const fallbackPill = document.createElement("span");
    fallbackPill.className = "keyword-pill";
    fallbackPill.textContent = "Premium customer feedback";
    keywordRow.appendChild(fallbackPill);
    return;
  }

  keywords.forEach((keyword) => {
    const pill = document.createElement("span");
    pill.className = "keyword-pill";
    pill.textContent = keyword;
    keywordRow.appendChild(pill);
  });
}

function setButtonsDisabled(isDisabled) {
  leaveReviewBtn.disabled = isDisabled;
  copyOnlyBtn.disabled = isDisabled;
  newDraftBtn.disabled = isDisabled;
}

function setActionLabels(primaryLabel, secondaryLabel, tertiaryLabel) {
  leaveReviewBtn.textContent = primaryLabel;
  copyOnlyBtn.textContent = secondaryLabel;
  newDraftBtn.textContent = tertiaryLabel;
}

function setHelperMessage(message) {
  helperText.textContent = message;
}

function getRecentReviews() {
  try {
    const raw = localStorage.getItem(recentReviewsStorageKey);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()) : [];
  } catch (error) {
    return [];
  }
}

function rememberReview(text) {
  if (!text) {
    return;
  }

  const trimmed = text.trim();
  const recent = getRecentReviews().filter((item) => item !== trimmed);
  recent.unshift(trimmed);
  localStorage.setItem(recentReviewsStorageKey, JSON.stringify(recent.slice(0, 8)));
}

function isRecentDuplicate(text) {
  return getRecentReviews().includes((text || "").trim());
}

function pickVariationProfile() {
  const index = Math.floor(Math.random() * variationProfiles.length);
  return variationProfiles[index];
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
  const variationProfile = pickVariationProfile();
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
      avoidReviews: getRecentReviews(),
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

async function loadUniqueAIReview() {
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const review = await loadReviewFromAI();

      if (isRecentDuplicate(review.review_text)) {
        lastError = new Error("Generated a duplicate AI review.");
        continue;
      }

      return review;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to generate a unique AI review.");
}

async function renderReview(options = {}) {
  const reason = options.reason || "initial";
  setButtonsDisabled(true);
  setActionLabels("Loading Review...", "Loading...", "Generating...");
  setStatus("Loading draft", "");
  poolStatus.textContent = "Generating with AI";
  setHelperMessage(
    reason === "refresh"
      ? "Generating a fresh AI review draft with a different angle..."
      : "Generating a polished AI review draft for B.B. Synthetics..."
  );

  try {
    currentReview = await loadUniqueAIReview();
    reviewText.textContent = currentReview.review_text;
    setKeywordPills(currentReview.keywords || []);
    rememberReview(currentReview.review_text);
    setStatus("Draft ready", "ready");
    poolStatus.textContent = "Fresh AI draft";
    setHelperMessage("This AI-generated draft is ready to copy. Tap the button, then paste or edit it on Google.");
  } catch (error) {
    try {
      currentReview = await loadReviewFromSupabase();
      reviewText.textContent = currentReview.review_text;
      setKeywordPills(currentReview.keywords || []);
      rememberReview(currentReview.review_text);
      setStatus("Fallback ready", "ready");
      poolStatus.textContent = "Shared backup pool";

      if (typeof currentReview.remaining_count === "number") {
        setHelperMessage(
          `The AI service is unavailable right now, so this backup draft was loaded from the shared pool. ${currentReview.remaining_count} drafts remain.`
        );
      } else {
        setHelperMessage("The AI service is unavailable right now, so a backup draft was loaded from the shared pool.");
      }
    } catch (fallbackError) {
      currentReview = null;
      reviewText.textContent =
        "No review draft is available right now. Check the AI function configuration or refill the Supabase pool, then reload this page.";
      setKeywordPills([]);
      setStatus("Needs attention", "warning");
      poolStatus.textContent = "No draft source available";
      setHelperMessage(
        fallbackError.message || error.message || "Unable to load a review draft."
      );
    }
  } finally {
    setButtonsDisabled(false);
    setActionLabels("Copy Review & Open Google", "Copy Only", "New Draft");
  }
}

async function copyCurrentReview() {
  const text = currentReview ? currentReview.review_text : "";

  if (!text) {
    setStatus("No draft loaded", "warning");
    setHelperMessage("A review draft needs to load before it can be copied.");
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied", "ready");
    setHelperMessage("Review copied successfully. The customer can now paste, edit, and post.");
    return true;
  } catch (error) {
    setStatus("Copy blocked", "warning");
    setHelperMessage(
      "Copying was blocked on this device. The customer can still select the text manually before posting."
    );
    return false;
  }
}

async function handleCopyOnly() {
  await copyCurrentReview();
}

async function handleNewDraft() {
  await renderReview({ reason: "refresh" });
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
copyOnlyBtn.addEventListener("click", handleCopyOnly);
newDraftBtn.addEventListener("click", handleNewDraft);
