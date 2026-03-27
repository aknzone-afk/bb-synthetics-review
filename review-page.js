const googleReviewUrl =
  "https://www.google.com/search?sca_esv=881c8779ce9071b0&si=AL3DRZHrmvnFAVQPOO2Bzhf8AX9KZZ6raUI_dT7DG_z0kV2_xwTE1fvL0q_rId43sAKjLfsAo_KArqqnvcAcOhd7wbGXyxyG_aBAPs5M7EhZUmxMxj8KkUle4Tpkvhga8YNFchkdNvC0&q=B.B.+Synthetics+Reviews&sa=X&ved=2ahUKEwj5zOu0pLuTAxWpRkEAHa9YDLwQ0bkNegQIIxAF&biw=1582&bih=755&dpr=1";

const reviewText = document.getElementById("reviewText");
const helperText = document.getElementById("helperText");
const leaveReviewBtn = document.getElementById("leaveReviewBtn");
const keywordRow = document.getElementById("keywordRow");

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

function setKeywordPills(keywords) {
  keywordRow.innerHTML = "";
  keywords.forEach((keyword) => {
    const pill = document.createElement("span");
    pill.className = "keyword-pill";
    pill.textContent = keyword;
    keywordRow.appendChild(pill);
  });
}

function setLoadingState(isLoading) {
  leaveReviewBtn.disabled = isLoading;
  leaveReviewBtn.textContent = isLoading ? "Loading Review..." : "Copy Review & Open Google";
}

function setHelperMessage(message) {
  helperText.textContent = message;
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

async function renderReview() {
  setLoadingState(true);
  setHelperMessage("Fetching a globally unique review draft...");

  try {
    currentReview = await loadReviewFromSupabase();
    reviewText.textContent = currentReview.review_text;
    setKeywordPills(currentReview.keywords || []);

    if (typeof currentReview.remaining_count === "number") {
      setHelperMessage(
        `Review copied from the global pool. ${currentReview.remaining_count} unique reviews are still unused.`
      );
    } else {
      setHelperMessage("This review is unique from the shared global review pool.");
    }
  } catch (error) {
    currentReview = null;
    reviewText.textContent =
      "No unique review is available right now. Please refresh later or refill the review pool in Supabase.";
    keywordRow.innerHTML = "";
    setHelperMessage(error.message || "Unable to load a unique review.");
  } finally {
    setLoadingState(false);
  }
}

async function copyReviewText() {
  const text = currentReview ? currentReview.review_text : "";

  if (!text) {
    setHelperMessage("No review is loaded yet.");
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    setHelperMessage("Review copied. Google will open next, and the customer can paste or edit it before posting.");
    return true;
  } catch (error) {
    setHelperMessage("Google will open now. If copy is blocked on this phone, the customer can manually copy the review text first.");
    return false;
  }
}

async function leaveReview() {
  await copyReviewText();
  window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
}

renderReview();
leaveReviewBtn.addEventListener("click", leaveReview);
