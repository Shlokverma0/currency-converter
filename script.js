const API_KEY = "a741a2e2500a609f451da87c";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");
const resultDiv = document.getElementById("result");
const lastUpdatedDiv = document.getElementById("lastUpdated");
const themeToggle = document.getElementById("themeToggle");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const spinner = document.getElementById("spinner");

let exchangeRates = {};

const currencyToCountry = {
  USD: "us", EUR: "eu", GBP: "gb", INR: "in", JPY: "jp",
  AUD: "au", CAD: "ca", CHF: "ch", CNY: "cn", HKD: "hk",
  NZD: "nz", SEK: "se", KRW: "kr", SGD: "sg", NOK: "no",
  MXN: "mx", ZAR: "za", TRY: "tr", BRL: "br", AED: "ae",
  SAR: "sa", RUB: "ru", THB: "th", MYR: "my", IDR: "id",
  PHP: "ph", PLN: "pl", DKK: "dk", ILS: "il", VND: "vn"
};

async function fetchRates(base = "USD") {
  spinner.classList.add("active");
  try {
    const response = await fetch(`${BASE_URL}/${base}`);
    const data = await response.json();

    if (data.result === "success") {
      exchangeRates = data.conversion_rates;
      populateDropdowns();
      updateLastUpdated(data.time_last_update_utc);
      updateFlags();
    } else {
      resultDiv.textContent = "Error fetching rates.";
    }
  } catch (error) {
    console.error(error);
    resultDiv.textContent = "Failed to connect to API.";
  } finally {
    spinner.classList.remove("active");
  }
}

function populateDropdowns() {
  const currencies = Object.keys(exchangeRates);

  currencies.forEach(currency => {
    const option1 = document.createElement("option");
    option1.value = currency;
    option1.textContent = currency;
    fromCurrency.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = currency;
    option2.textContent = currency;
    toCurrency.appendChild(option2);
  });

  fromCurrency.value = "USD";
  toCurrency.value = "INR";
}

function updateLastUpdated(dateString) {
  lastUpdatedDiv.textContent = `Last updated: ${dateString}`;
}

function updateFlags() {
  const fromCode = currencyToCountry[fromCurrency.value];
  const toCode = currencyToCountry[toCurrency.value];

  if (fromCode) {
    fromFlag.src = `https://flagcdn.com/24x18/${fromCode}.png`;
    fromFlag.style.display = "inline-block";
  } else {
    fromFlag.style.display = "none";
  }

  if (toCode) {
    toFlag.src = `https://flagcdn.com/24x18/${toCode}.png`;
    toFlag.style.display = "inline-block";
  } else {
    toFlag.style.display = "none";
  }
}

function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || amount < 0) {
    resultDiv.textContent = "Please enter a valid amount.";
    return;
  }

  const rateFrom = exchangeRates[from];
  const rateTo = exchangeRates[to];

  const convertedAmount = (amount / rateFrom) * rateTo;

  resultDiv.textContent = `${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}`;
}

fromCurrency.addEventListener("change", updateFlags);
toCurrency.addEventListener("change", updateFlags);

swapBtn.addEventListener("click", () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;

  updateFlags();

  if (resultDiv.textContent) {
    convertCurrency();
  }
});

convertBtn.addEventListener("click", convertCurrency);

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeToggle.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
});

// Load saved theme on page load
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "☀️";
}

// Run on page load
fetchRates();