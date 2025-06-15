document.addEventListener('DOMContentLoaded', () => {
  const countrySelect = document.getElementById('country');
  const stateSelect = document.getElementById('state');
  const citySelect = document.getElementById('area_city');

  // Fetch countries
  async function fetchCountries() {
    const res = await fetch('/countries');
    const countries = await res.json();
    countrySelect.innerHTML = `<option value="">Select Country</option>`;
    countries.forEach(country => {
      countrySelect.innerHTML += `<option value="${country.isoCode}">${country.name}</option>`;
    });
  }

  // Fetch states
  async function fetchStates(countryCode) {
    const res = await fetch(`/states/${countryCode}`);
    const states = await res.json();
    stateSelect.innerHTML = `<option value="">Select State</option>`;
    citySelect.innerHTML = `<option value="">Select City</option>`;
    states.forEach(state => {
      stateSelect.innerHTML += `<option value="${state.isoCode}">${state.name}</option>`;
    });
  }

  // Fetch cities
  async function fetchCities(countryCode, stateCode) {
    const res = await fetch(`/cities/${countryCode}/${stateCode}`);
    const cities = await res.json();
    citySelect.innerHTML = `<option value="">Select Area/City</option>`;
    cities.forEach(city => {
      citySelect.innerHTML += `<option value="${city.name}">${city.name}</option>`;
    });
  }

  countrySelect.addEventListener('change', () => {
    const countryCode = countrySelect.value;
    if (countryCode) fetchStates(countryCode);
  });

  stateSelect.addEventListener('change', () => {
    const countryCode = countrySelect.value;
    const stateCode = stateSelect.value;
    if (countryCode && stateCode) fetchCities(countryCode, stateCode);
  });

  fetchCountries(); // Initial call
});
