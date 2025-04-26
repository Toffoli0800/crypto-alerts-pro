// src/dashboard.js

let marketPrices = {};       // Preço atual por símbolo
let priceHistory = {};       // Histórico por símbolo
let allSymbols = new Set();  // Lista fixa de símbolos monitorados

async function fetchMarketData() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price');
        const data = await response.json();

        data.forEach(ticker => {
            if (!ticker.symbol.endsWith('USDT')) return;

            const symbol = ticker.symbol.replace('USDT', '');
            const price = parseFloat(ticker.price);

            // Guarda símbolo na lista fixa
            allSymbols.add(symbol);

            // Atualiza preço
            marketPrices[symbol] = price;

            // Atualiza histórico
            if (!priceHistory[symbol]) {
                priceHistory[symbol] = { '1m': [], '3m': [], '5m': [], '15m': [] };
            }

            Object.keys(priceHistory[symbol]).forEach(interval => {
                priceHistory[symbol][interval].push({ time: Date.now(), price });

                // Limita o histórico ao intervalo necessário
                const minutes = parseInt(interval);
                priceHistory[symbol][interval] = priceHistory[symbol][interval].filter(p =>
                    Date.now() - p.time <= minutes * 60 * 1000
                );
            });
        });

        updateMarketTable();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateMarketTable() {
    const tbody = document.querySelector('#crypto-table tbody');
    tbody.innerHTML = '';

    const rows = [];

    allSymbols.forEach(symbol => {
        const price = marketPrices[symbol] || 0; // Se não veio agora, mantém último ou 0
        const history = priceHistory[symbol];

        if (!history) return;

        const changes = {
            '1m': calculateChange(history['1m']),
            '3m': calculateChange(history['3m']),
            '5m': calculateChange(history['5m']),
            '15m': calculateChange(history['15m']),
        };

        const rsi = calculateRSI(history['1m']);

        const row = document.createElement('tr');

        if (changes['1m'] >= 2) {
            row.classList.add('pump-highlight');
        } else if (changes['1m'] <= -2) {
            row.classList.add('dump-highlight');
        }

        row.innerHTML = `
            <td><a href="https://www.binance.com/en/trade/${symbol}_USDT" target="_blank">${symbol}</a></td>
            <td>${price ? `$${price.toFixed(4)}` : '--'}</td>
            <td>${rsi.toFixed(2)}</td>
            <td class="${changes['1m'] >= 0 ? 'positive' : 'negative'}">${changes['1m'].toFixed(2)}%</td>
            <td class="${changes['3m'] >= 0 ? 'positive' : 'negative'}">${changes['3m'].toFixed(2)}%</td>
            <td class="${changes['5m'] >= 0 ? 'positive' : 'negative'}">${changes['5m'].toFixed(2)}%</td>
            <td class="${changes['15m'] >= 0 ? 'positive' : 'negative'}">${changes['15m'].toFixed(2)}%</td>
        `;

        rows.push({ row, change: changes['1m'] });
    });

    // Ordena colocando pumps no topo
    rows.sort((a, b) => b.change - a.change);

    rows.forEach(r => tbody.appendChild(r.row));
}

function calculateChange(history) {
    if (!history || history.length < 2) return 0;
    const first = history[0].price;
    const last = history[history.length - 1].price;
    return ((last - first) / first) * 100;
}

function calculateRSI(history) {
    if (!history || history.length < 2) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < history.length; i++) {
        const diff = history[i].price - history[i - 1].price;
        if (diff > 0) gains += diff;
        else losses -= diff;
    }

    if (gains + losses === 0) return 50;

    const rs = gains / (losses || 1);
    return 100 - (100 / (1 + rs));
}

// Atualiza mercado a cada 5 segundos
setInterval(fetchMarketData, 5000);

// Função para alternar tabs
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    document.getElementById(tabName).style.display = 'block';
}
