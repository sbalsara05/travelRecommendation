// Function to search through travel data
function searchTravelData(query, travelData) {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Create an object to store matching results by category
    const results = {
      countries: [],
      temples: [],
      beaches: []
    };
    
    // Define keywords for categories
    const categoryKeywords = {
      beaches: ['beach', 'beaches', 'shore', 'coast'],
      temples: ['temple', 'temples', 'shrine', 'worship'],
      countries: ['country', 'countries', 'nation', 'destination']
    };
    
    // Check if the query matches any category keywords
    const hasBeachKeyword = categoryKeywords.beaches.some(keyword => normalizedQuery.includes(keyword));
    const hasTempleKeyword = categoryKeywords.temples.some(keyword => normalizedQuery.includes(keyword));
    const hasCountryKeyword = categoryKeywords.countries.some(keyword => normalizedQuery.includes(keyword));
    
    // Add all items from matching categories
    if (hasBeachKeyword) {
      results.beaches = [...travelData.beaches];
    }
    
    if (hasTempleKeyword) {
      results.temples = [...travelData.temples];
    }
    
    if (hasCountryKeyword) {
      results.countries = [...travelData.countries];
    }
    
    // If no category keywords matched, search for specific destinations
    if (!hasBeachKeyword && !hasTempleKeyword && !hasCountryKeyword) {
      // Search beaches
      travelData.beaches.forEach(beach => {
        if (beach.name.toLowerCase().includes(normalizedQuery) || 
            beach.description.toLowerCase().includes(normalizedQuery)) {
          results.beaches.push(beach);
        }
      });
      
      // Search temples
      travelData.temples.forEach(temple => {
        if (temple.name.toLowerCase().includes(normalizedQuery) || 
            temple.description.toLowerCase().includes(normalizedQuery)) {
          results.temples.push(temple);
        }
      });
      
      // Search countries and their cities
      travelData.countries.forEach(country => {
        // Check if country name matches
        const countryMatches = country.name.toLowerCase().includes(normalizedQuery);
        
        // Check if any cities match
        const matchingCities = country.cities.filter(city => 
          city.name.toLowerCase().includes(normalizedQuery) || 
          city.description.toLowerCase().includes(normalizedQuery)
        );
        
        if (countryMatches || matchingCities.length > 0) {
          // If country matches or has matching cities, include only matching cities
          if (matchingCities.length > 0) {
            results.countries.push({
              id: country.id,
              name: country.name,
              cities: matchingCities
            });
          } else if (countryMatches) {
            // Include the entire country with all cities
            results.countries.push({...country});
          }
        }
      });
    }
    
    return results;
  }
  
  // Function to display search results as cards
  function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Count total results
    let totalResults = 0;
    
    // For countries, we need to count cities
    results.countries.forEach(country => {
      totalResults += country.cities.length;
    });
    
    totalResults += results.beaches.length;
    totalResults += results.temples.length;
    
    // If no results, show a message
    if (totalResults === 0) {
      resultsContainer.innerHTML = '<p class="no-results">No destinations found matching your search.</p>';
      resultsContainer.style.display = 'block';
      return;
    }
    
    // Show results container
    resultsContainer.style.display = 'block';
    
    // Create and add destination cards for cities within countries
    results.countries.forEach(country => {
      country.cities.forEach(city => {
        const card = createDestinationCard(city);
        resultsContainer.appendChild(card);
      });
    });
    
    // Create and add destination cards for temples
    results.temples.forEach(temple => {
      const card = createDestinationCard(temple);
      resultsContainer.appendChild(card);
    });
    
    // Create and add destination cards for beaches
    results.beaches.forEach(beach => {
      const card = createDestinationCard(beach);
      resultsContainer.appendChild(card);
    });
  }
  
  // Helper function to create a destination card
  function createDestinationCard(destination) {
    const card = document.createElement('div');
    card.className = 'destination-card';
    
    card.innerHTML = `
      <h3>${destination.name}</h3>
      <img src="${destination.imageUrl}" alt="${destination.name}">
      <p>${destination.description}</p>
      <button class="select-btn">Select</button>
    `;
    
    // Add event listener to the select button
    setTimeout(() => {
      const selectBtn = card.querySelector('.select-btn');
      selectBtn.addEventListener('click', () => {
        alert(`You selected ${destination.name}! This is where you would redirect to a details page.`);
      });
    }, 0);
    
    return card;
  }
  
  // Load travel data from JSON file and initialize search functionality
  document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-btn');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    
    // Load travel data from JSON file
    let travelData = {};
    
    fetch('travel_data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Store the loaded data
        travelData = data;
        console.log('Travel data loaded successfully');
      })
      .catch(error => {
        console.error('Error loading travel data:', error);
        // Fallback message if data can't be loaded
        resultsContainer.innerHTML = '<p class="no-results">Error loading travel data. Please try again later.</p>';
        resultsContainer.style.display = 'block';
      });
    
    // Handle search button click
    searchBtn.addEventListener('click', function() {
      const query = searchInput.value;
      
      if (query.trim() === '') {
        alert('Please enter a search term');
        return;
      }
      
      // Check if travel data is loaded
      if (Object.keys(travelData).length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">Travel data is still loading. Please try again in a moment.</p>';
        resultsContainer.style.display = 'block';
        return;
      }
      
      const results = searchTravelData(query, travelData);
      displaySearchResults(results);
    });
    
    // Handle clear button click
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
    });
    
    // Handle pressing Enter in the search input
    searchInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchBtn.click();
      }
    });
    
    // Add event listeners to any initial select buttons
    document.querySelectorAll('.select-btn').forEach(button => {
      button.addEventListener('click', function() {
        const card = this.closest('.destination-card');
        const destinationName = card.querySelector('h3').textContent;
        alert(`You selected ${destinationName}! This is where you would redirect to a details page.`);
      });
    });
  });