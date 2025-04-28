// URL da API da Binance para buscar todas as moedas
const apiUrl = 'https://api.binance.com/api/v3/ticker/24hr';

// WebSocket para atualizações ao vivo
const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

// Elemento da tabela
const marketTableBody = document.getElementById('marketTableBody');

// Banco local para armazenar moedas
let marketData = {};

// Função para atualizar a tabela
function renderMarket() {
  marketTableBody.innerHTML = '';
  Object.values(marketData).forEach((coin) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${coin.symbol}</td>
      <td>$${parseFloat(coin.price).toFixed(4)}</td>
      <td>${coin.change1m}%</td>
      <td>${coin.change3m}%</td>
      <td>${coin.change5m}%</td>
      <td>${coin.change15m}%</td>
    `;
    marketTableBody.appendChild(row);
  });
}

// Pega todas as moedas ao abrir a página
async function fetchInitialMarket() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    data.forEach((item) => {
      marketData[item.symbol] = {
        symbol: item.symbol,
        price: item.lastPrice,
        change1m: '0.00',
        change3m: '0.00',
        change5m: '0.00',
        change15m: '0.00',
      };
    });

    renderMarket();
  } catch (error) {
    console.error('Erro ao buscar moedas iniciais:', error);
  }
}

// Atualiza as moedas com dados recebidos via WebSocket
ws.onmessage = (event) => {
  const updates = JSON.parse(event.data);

  updates.forEach((update) => {
    const symbol = update.s;
    const price = parseFloat(update.c);

    if (marketData[symbol]) {
      const lastPrice = parseFloat(marketData[symbol].price);
      const change = ((price - lastPrice) / lastPrice) * 100;

      marketData[symbol].price = price.toFixed(4);
      marketData[symbol].change1m = change.toFixed(2);
      marketData[symbol].change3m = change.toFixed(2);
      marketData[symbol].change5m = change.toFixed(2);
      marketData[symbol].change15m = change.toFixed(2);
    } else {
      marketData[symbol] = {
        symbol: symbol,
        price: price.toFixed(4),
        change1m: '0.00',
        change3m: '0.00',
        change5m: '0.00',
        change15m: '0.00',
      };
    }
  });

  renderMarket();
};

// Inicia tudo
fetchInitialMarket();
