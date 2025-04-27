async function fetchMarketData() {
  try {
    const response = await fetch('https://crypto-alerts-api.onrender.com/api/market');
    const data = await response.json();

    const tableBody = document.querySelector('#crypto-table tbody');
    tableBody.innerHTML = '';

    data.data.forEach((coin) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a href="https://www.binance.com/en/trade/${coin.symbol}" target="_blank">${coin.symbol}</a></td>
        <td>$${parseFloat(coin.price).toFixed(4)}</td>
        <td>Updating...</td>
        <td>Updating...</td>
        <td>Updating...</td>
        <td>Updating...</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error('Error fetching market data:', error);
  }
}

// Atualiza a cada 30 segundos
setInterval(fetchMarketData, 30000);

// Chama a primeira vez ao carregar
fetchMarketData();
