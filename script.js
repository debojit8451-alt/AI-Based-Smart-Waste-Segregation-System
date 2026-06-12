const imageInput = document.querySelector("#wasteImage");
const preview = document.querySelector("#preview");
const emptyPreview = document.querySelector("#emptyPreview");
const classifyBtn = document.querySelector("#classifyBtn");
const itemName = document.querySelector("#itemName");
const category = document.querySelector("#category");
const confidenceText = document.querySelector("#confidenceText");
const confidenceBar = document.querySelector("#confidenceBar");
const reason = document.querySelector("#reason");
const resultCard = document.querySelector("#resultCard");
const recommendations = document.querySelector("#recommendations");

const categories = {
  organic: {
    title: "Organic / Compostable Waste",
    bin: "Green bin",
    color: "#247a4b",
    tips: [
      "Put it in the green compost bin.",
      "Avoid mixing plastic packaging with food waste.",
      "Use compost output for gardening or soil enrichment."
    ]
  },
  recyclable: {
    title: "Recyclable Waste",
    bin: "Blue bin",
    color: "#276b9f",
    tips: [
      "Rinse and dry the item before disposal.",
      "Flatten bottles or cardboard to reduce storage volume.",
      "Keep recyclables separate from food or medical waste."
    ]
  },
  hazardous: {
    title: "Hazardous / E-Waste",
    bin: "Red safety bin",
    color: "#b03a2e",
    tips: [
      "Do not throw this into general household waste.",
      "Send batteries, electronics, or sharp items to authorized collection points.",
      "Use gloves or safe packaging while handling hazardous items."
    ]
  },
  residual: {
    title: "Residual / Mixed Waste",
    bin: "Yellow or dry mixed bin",
    color: "#b87612",
    tips: [
      "Separate recyclable parts if possible.",
      "Avoid mixing wet and dry waste.",
      "Send contaminated mixed waste to controlled disposal."
    ]
  }
};

const keywordMap = [
  ["hazardous", ["battery", "cell", "wire", "charger", "medicine", "syringe", "blade", "needle", "glass tube", "e-waste"]],
  ["organic", ["banana", "peel", "food", "vegetable", "fruit", "leaf", "tea", "coffee", "egg", "bread"]],
  ["recyclable", ["plastic", "bottle", "paper", "cardboard", "newspaper", "can", "metal", "tin", "glass", "jar"]],
  ["residual", ["dirty", "mixed", "wrapper", "chips", "packet", "thermocol", "foam"]]
];

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  emptyPreview.style.display = "none";
});

classifyBtn.addEventListener("click", () => {
  const selected = [...document.querySelectorAll(".feature-grid input:checked")].map(input => input.value);
  const text = itemName.value.trim().toLowerCase();
  const scores = scoreWaste(selected, text);
  const predicted = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const [key, score] = predicted;
  const confidence = Math.min(96, Math.max(52, Math.round(score)));
  renderResult(key, confidence, selected, text);
});

function scoreWaste(selected, text) {
  const scores = { organic: 8, recyclable: 8, hazardous: 8, residual: 8 };

  for (const feature of selected) {
    if (feature === "organic") scores.organic += 46;
    if (["paper", "plastic", "metal", "glass"].includes(feature)) scores.recyclable += 36;
    if (["battery", "medical"].includes(feature)) scores.hazardous += 54;
    if (feature === "dirty") scores.residual += 38;
  }

  for (const [categoryKey, words] of keywordMap) {
    if (words.some(word => text.includes(word))) scores[categoryKey] += 34;
  }

  if (selected.includes("dirty") && selected.some(value => ["paper", "plastic", "metal", "glass"].includes(value))) {
    scores.residual += 18;
    scores.recyclable -= 10;
  }

  if (!selected.length && !text) {
    scores.residual = 45;
  }

  return scores;
}

function renderResult(key, confidence, selected, text) {
  const data = categories[key];
  resultCard.className = `result-card ${key}`;
  category.textContent = data.title;
  confidenceText.textContent = `${confidence}%`;
  confidenceBar.style.width = `${confidence}%`;
  confidenceBar.style.background = data.color;

  const evidence = [];
  if (selected.length) evidence.push(`features selected: ${selected.join(", ")}`);
  if (text) evidence.push(`item name: "${text}"`);

  reason.textContent = `Recommended disposal: ${data.bin}. The system predicted this category using ${evidence.join(" and ") || "default waste-safety logic"}.`;

  recommendations.innerHTML = "";
  for (const tip of data.tips) {
    const li = document.createElement("li");
    li.textContent = tip;
    recommendations.appendChild(li);
  }
}
