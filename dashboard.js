const apiUrl = "https://api.binance.com/api/v3/ticker/24hr";
let pumpThreshold = 2; // 2% para Pump ou Dump
let prices = {};
let cryptoData = [];

async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        cryptoData = data.filter(item => item.symbol.endsWith("USDT"));
        updatePrices();
        updateTable();
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

function updatePrices() {
    cryptoData.forEach(item => {
        const symbol = item.symbol.replace("USDT", "");
        const lastPrice = parseFloat(item.lastPrice);
        const openPrice = parseFloat(item.openPrice);
        const priceChangePercent = ((lastPrice - openPrice) / openPrice) * 100;

        if (!prices[symbol]) {
            prices[symbol] = {
                symbol: symbol,
                lastPrice: lastPrice,
                priceChange1m: 0,
                priceChange3m: 0,
                priceChange5m: 0,
                priceChange15m: 0,
                history: [lastPrice]
            };
        } else {
            prices[symbol].lastPrice = lastPrice;
            prices[symbol].history.push(lastPrice);

            if (prices[symbol].history.length > 180) {
                prices[symbol].history.shift();
            }

            prices[symbol].priceChange1m = calculateChange(prices[symbol].history, 12);
            prices[symbol].priceChange3m = calculateChange(prices[symbol].history, 36);
            prices[symbol].priceChange5m = calculateChange(prices[symbol].history, 60);
            prices[symbol].priceChange15m = calculateChange(prices[symbol].history, 180);
        }
    });
}

function calculateChange(history, points) {
    if (history.length < points) return 0;
    const oldPrice = history[history.length - points];
    const newPrice = history[history.length - 1];
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
}

function updateTable() {
    const tbody = document.getElementById("crypto-table-body");
    tbody.innerHTML = "";

    const pumps = [];
    const normalCoins = [];

    Object.values(prices).forEach(coin => {
        if (coin.priceChange1m >= pumpThreshold || coin.priceChange1m <= -pumpThreshold) {
            pumps.push(coin);
        } else {
            normalCoins.push(coin);
        }
    });

    pumps.sort((a, b) => Math.abs(b.priceChange1m) - Math.abs(a.priceChange1m));
    normalCoins.sort((a, b) => a.symbol.localeCompare(b.symbol));

    const sortedCoins = [...pumps, ...normalCoins];

    sortedCoins.forEach(coin => {
        const row = document.createElement("tr");

        const starCell = document.createElement("td");
        starCell.innerHTML = "☆";
        row.appendChild(starCell);

        const symbolCell = document.createElement("td");
        const link = document.createElement("a");
        link.href = `https://www.binance.com/en/trade/${coin.symbol}_USDT`;
        link.textContent = coin.symbol;
        link.target = "_blank";
        link.style.color = "aqua";
        symbolCell.appendChild(link);
        row.appendChild(symbolCell);

        const priceCell = document.createElement("td");
        priceCell.textContent = "$" + coin.lastPrice.toFixed(4);
        row.appendChild(priceCell);

        const rsiCell = document.createElement("td");
        rsiCell.textContent = "..."; // futuramente o RSI real
        row.appendChild(rsiCell);

        const change1mCell = document.createElement("td");
        change1mCell.textContent = coin.priceChange1m.toFixed(2) + "%";
        change1mCell.style.color = coin.priceChange1m >= 0 ? "lime" : "red";
        row.appendChild(change1mCell);

        const change3mCell = document.createElement("td");
        change3mCell.textContent = coin.priceChange3m.toFixed(2) + "%";
        change3mCell.style.color = coin.priceChange3m >= 0 ? "lime" : "red";
        row.appendChild(change3mCell);

        const change5mCell = document.createElement("td");
        change5mCell.textContent = coin.priceChange5m.toFixed(2) + "%";
        change5mCell.style.color = coin.priceChange5m >= 0 ? "lime" : "red";
        row.appendChild(change5mCell);

        const change15mCell = document.createElement("td");
        change15mCell.textContent = coin.priceChange15m.toFixed(2) + "%";
        change15mCell.style.color = coin.priceChange15m >= 0 ? "lime" : "red";
        row.appendChild(change15mCell);

        tbody.appendChild(row);
    });
}

// Atualizar a cada 5 segundos
setInterval(fetchData, 5000);

// Primeira carga
fetchData();
