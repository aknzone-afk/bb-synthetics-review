const googleReviewUrl =
  "https://www.google.com/search?sca_esv=881c8779ce9071b0&si=AL3DRZHrmvnFAVQPOO2Bzhf8AX9KZZ6raUI_dT7DG_z0kV2_xwTE1fvL0q_rId43sAKjLfsAo_KArqqnvcAcOhd7wbGXyxyG_aBAPs5M7EhZUmxMxj8KkUle4Tpkvhga8YNFchkdNvC0&q=B.B.+Synthetics+Reviews&sa=X&ved=2ahUKEwj5zOu0pLuTAxWpRkEAHa9YDLwQ0bkNegQIIxAF&biw=1582&bih=755&dpr=1";

const reviewText = document.getElementById("reviewText");
const helperText = document.getElementById("helperText");
const leaveReviewBtn = document.getElementById("leaveReviewBtn");
const keywordRow = document.getElementById("keywordRow");

const recentReviewStorageKey = "bb-synthetics-recent-reviews";
const recentReviewLimit = 12;

const openers = [
  "B.B. Synthetics is one of the most trusted saree manufacturers in Surat for",
  "Amazing experience with B.B. Synthetics for",
  "Very happy with B.B. Synthetics for",
  "Highly satisfied with B.B. Synthetics for",
  "B.B. Synthetics stands out as a reliable saree manufacturer for",
  "Strongly recommend B.B. Synthetics for",
  "B.B. Synthetics has built a strong name since 1988 for",
];

const productPhrases = [
  "dyed work sarees, designer sarees, and wholesale saree collections",
  "Banarasi sarees, Bandhej sarees, and printed sarees",
  "top dyed sarees and premium designer saree manufacturing",
  "organza, vichitra, georgette, and chiffon saree collections",
  "satin, crepe, net, and fancy fabric saree manufacturing",
  "wholesale sarees with embroidery work, gota patti work, and sequence work",
  "designer sarees from grey level to finish with premium quality and strong value",
  "global wholesale saree supply with premium quality and unbeatable pricing",
];

const craftsmanshipPhrases = [
  "Their embroidery work, gota patti work, and sequence detailing were beautifully finished.",
  "The dyed work sarees had excellent craftsmanship with neat embroidery and premium finishing.",
  "The collection quality, design sense, and detailed work in each saree were very impressive.",
  "Their designer sarees showed strong finishing quality with rich detailing and elegant styling.",
  "The saree designs, color combinations, and work quality gave a premium market feel.",
  "The Banarasi, Bandhej, and printed saree options looked fresh, stylish, and professionally finished.",
  "The premium finishing, design development, and overall quality control were excellent from start to finish.",
  "The final sarees looked premium in quality while still offering strong value in pricing.",
];

const specialtyPhrases = [
  "They offer beautiful work in siroski, jharkhan, embroidery, and fancy designer patterns.",
  "Their range across organza, georgette, fendi satin, fendi chiffon, satin, and net is impressive.",
  "The variety across fabrics and work styles makes them a strong choice for wholesale buyers.",
  "Their collections cover both traditional and modern saree designs with strong fabric quality.",
  "The fabric selection and surface work are ideal for buyers looking for premium designer sarees.",
  "They handle multiple saree styles and fabrics with consistent quality and attractive finishing.",
  "Their fabric range across dola, chocolate, jimi chu, burberry, georgette, cotton, silk, vichitra, shimmer, satin, viscose, organza, chiffon, and linen is impressive.",
  "They offer embroidery, printed sarees, Rappier, Banarasi, Swarovski work, handwork, Jharkan sarees, and many more value additions.",
];

const servicePhrases = [
  "Their team was cooperative, professional, and easy to work with.",
  "The service was smooth, responsive, and very professional.",
  "The team handled everything professionally and with good support.",
  "Communication, support, and service quality were all very good.",
  "They were reliable, professional, and helpful throughout the process.",
  "Their response time and customer handling were excellent.",
  "They understand wholesale requirements well and are experienced in serving buyers globally.",
  "Their wholesale support, pricing clarity, and business handling were very professional.",
];

const seoPhrases = [
  "A dependable choice for anyone looking for a trusted saree manufacturer in Surat.",
  "Highly recommended for buyers searching for designer saree manufacturers in Surat.",
  "A great option for wholesale sarees, dyed work sarees, and premium saree manufacturing in India.",
  "Perfect for businesses searching for Banarasi sarees, Bandhej sarees, and designer saree wholesale.",
  "A trusted name for fancy sarees, premium fabrics, and professional wholesale saree service.",
  "One of the best options for quality sarees, fabric variety, and dependable manufacturing support.",
  "Ideal for wholesalers looking for premium designer sarees for weddings, festivals, parties, and daily wear collections.",
  "A strong choice for bridal sarees, party wear sarees, formal collections, and cultural occasion saree supply.",
];

const keywordSets = [
  ["saree manufacturer Surat", "dyed work sarees", "designer sarees", "wholesale sarees"],
  ["Banarasi sarees", "Bandhej sarees", "printed sarees", "Surat manufacturer"],
  ["organza sarees", "georgette sarees", "vichitra sarees", "premium fabrics"],
  ["gota patti work", "embroidery work", "sequence work", "designer collection"],
  ["fendi satin", "fendi chiffon", "chiffon sarees", "saree wholesale"],
  ["premium sarees", "trusted supplier", "Surat textile", "quality manufacturing"],
  ["bridal sarees", "festival sarees", "party wear sarees", "global wholesalers"],
  ["grey to finish", "Swarovski work", "Jharkan sarees", "unbeatable price"],
];

let currentReview = null;

function randomIndex(length) {
  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % length;
  }
  return Math.floor(Math.random() * length);
}

function randomItem(items) {
  return items[randomIndex(items.length)];
}

function getRecentReviews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(recentReviewStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentReview(text) {
  const recent = getRecentReviews().filter((item) => item !== text);
  recent.unshift(text);
  localStorage.setItem(recentReviewStorageKey, JSON.stringify(recent.slice(0, recentReviewLimit)));
}

function buildReview() {
  return {
    text: `${randomItem(openers)} ${randomItem(productPhrases)}. ${randomItem(craftsmanshipPhrases)} ${randomItem(specialtyPhrases)} ${randomItem(servicePhrases)} ${randomItem(seoPhrases)}`,
    keywords: randomItem(keywordSets),
  };
}

function generateUniqueReview() {
  const recent = new Set(getRecentReviews());

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = buildReview();
    if (!recent.has(candidate.text)) {
      return candidate;
    }
  }

  return buildReview();
}

function renderReview() {
  currentReview = generateUniqueReview();
  reviewText.textContent = currentReview.text;
  keywordRow.innerHTML = "";

  currentReview.keywords.forEach((keyword) => {
    const pill = document.createElement("span");
    pill.className = "keyword-pill";
    pill.textContent = keyword;
    keywordRow.appendChild(pill);
  });

  saveRecentReview(currentReview.text);
}

async function copyReviewText() {
  const text = currentReview ? currentReview.text : "";
  try {
    await navigator.clipboard.writeText(text);
    helperText.textContent = "Review copied. Google will open next, and the customer can paste or edit it before posting.";
  } catch (error) {
    helperText.textContent = "Google will open now. If copy is blocked on this phone, the customer can manually copy the review text first.";
  }
}

async function leaveReview() {
  await copyReviewText();
  window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
}

renderReview();
leaveReviewBtn.addEventListener("click", leaveReview);
