const googleReviewUrl =
  "https://www.google.com/search?sca_esv=881c8779ce9071b0&si=AL3DRZHrmvnFAVQPOO2Bzhf8AX9KZZ6raUI_dT7DG_z0kV2_xwTE1fvL0q_rId43sAKjLfsAo_KArqqnvcAcOhd7wbGXyxyG_aBAPs5M7EhZUmxMxj8KkUle4Tpkvhga8YNFchkdNvC0&q=B.B.+Synthetics+Reviews&sa=X&ved=2ahUKEwj5zOu0pLuTAxWpRkEAHa9YDLwQ0bkNegQIIxAF&biw=1582&bih=755&dpr=1";

const reviews = [
  {
    text: "B.B. Synthetics is one of the best saree manufacturers for premium quality sarees, elegant designs, and reliable wholesale service. The fabric quality, finishing, colors, and packaging were excellent. Highly recommended for anyone looking for a trusted saree manufacturer in Surat.",
    keywords: ["saree manufacturer", "premium quality sarees", "wholesale", "Surat"],
  },
  {
    text: "Amazing experience with B.B. Synthetics. Their designer saree collection, fabric quality, and timely delivery were impressive. If you are searching for a reliable saree manufacturer with trendy designs and professional service, this is a great choice.",
    keywords: ["designer sarees", "fabric quality", "timely delivery", "reliable manufacturer"],
  },
  {
    text: "B.B. Synthetics offers beautiful sarees with rich colors, clean finishing, and excellent material quality. The team is cooperative and professional, making them a dependable partner for wholesale sarees and premium saree manufacturing requirements.",
    keywords: ["beautiful sarees", "wholesale sarees", "premium manufacturing", "professional team"],
  },
  {
    text: "Very satisfied with B.B. Synthetics. Their saree collection is stylish, quality-focused, and perfect for buyers looking for trusted saree manufacturers in India. Great service, excellent product quality, and a smooth overall experience.",
    keywords: ["trusted in India", "stylish sarees", "product quality", "great service"],
  },
];

const reviewText = document.getElementById("reviewText");
const helperText = document.getElementById("helperText");
const leaveReviewBtn = document.getElementById("leaveReviewBtn");
const keywordRow = document.getElementById("keywordRow");
const lastReviewStorageKey = "bb-synthetics-last-review-index";

let currentIndex = 0;

function getRandomIndexExcluding(excludedIndex) {
  if (reviews.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * reviews.length);
  while (nextIndex === excludedIndex) {
    nextIndex = Math.floor(Math.random() * reviews.length);
  }
  return nextIndex;
}

function initializeReview() {
  const storedIndex = Number.parseInt(localStorage.getItem(lastReviewStorageKey) || "", 10);
  const lastIndex = Number.isInteger(storedIndex) ? storedIndex : -1;
  currentIndex = getRandomIndexExcluding(lastIndex);
  localStorage.setItem(lastReviewStorageKey, String(currentIndex));
}

function renderReview() {
  const selected = reviews[currentIndex];
  reviewText.textContent = selected.text;
  keywordRow.innerHTML = "";
  selected.keywords.forEach((keyword) => {
    const pill = document.createElement("span");
    pill.className = "keyword-pill";
    pill.textContent = keyword;
    keywordRow.appendChild(pill);
  });
}

function nextReview() {
  currentIndex = (currentIndex + 1) % reviews.length;
  localStorage.setItem(lastReviewStorageKey, String(currentIndex));
  renderReview();
}

async function copyReviewText() {
  const text = reviews[currentIndex].text;
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

initializeReview();
renderReview();
leaveReviewBtn.addEventListener("click", leaveReview);
