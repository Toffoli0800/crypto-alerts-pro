// src/signals.js

let signals = [];
let activeSignals = [];

function generateSignal() {
    const symbols = Object.keys(marketPrices);
    if (symbols.length === 0) return;

    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const currentPrice = marketPrices[randomSymbol];

    if (!currentPrice || currentPrice === 0) return;

    const type = Math.random() < 0.5 ? 'Long' : 'Short';
    const riskReward = (Math.random() * (3.5 - 1.5) + 1.5).toFixed(2);
    const confidence = Math.floor(Math.random() * (90 - 70) + 70);
    const volatilityOptions = ['Low', 'Medium', 'High'];
    const volatility = volatilityOptions[Math.floor(Math.random() * volatilityOptions.length)];
    const volumeTrendOptions = ['Stable', 'Increasing', 'Decreasing'];
    const volumeTrend = volumeTrendOptions[Math.floor(Math.random() * volumeTrendOptions.length)];
    const trendOptions = ['Bullish', 'Bearish'];
    const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];

    let entry = parseFloat(currentPrice);
    let target1, target2, stopLoss;

    if (type === 'Long') {
        target1 = +(entry * (1 + (Math.random() * (0.04 - 0.015) + 0.015))).toFixed(4);
        target2 = +(entry * (1 + (Math.random() * (0.06 - 0.03) + 0.03))).toFixed(4);
        stopLoss = +(entry * (1 - (Math.random() * (0.03 - 0.01) + 0.01))).toFixed(4);
    } else {
        target1 = +(entry * (1 - (Math.random() * (0.04 - 0.015) + 0.015))).toFixed(4);
        target2 = +(entry * (1 - (Math.random() * (0.06 - 0.03) + 0.03))).toFixed(4);
        stopLoss = +(entry * (1 + (Math.random() * (0.03 - 0.01) + 0.01))).toFixed(4);
    }

    const signal = {
        symbol: randomSymbol,
        type,
        entry: entry.toFixed(4),
        target1,
        target2,
        stopLoss,
        trend,
        volatility,
        confidence: `${confidence}%`,
        volumeTrend,
        riskReward,
        status: 'Active',
        currentPrice: entry
    };

    signals.push(signal);
    activeSignals.push({ signal, row: addSignalRow(signal) });
}

function addSignalRow(signal) {
    const table = document.getElementById('signals-table').getElementsByTagName('tbody')[0];
    const row = table.insertRow(0);

    row.innerHTML = `
        <td class="${signal.type === 'Long' ? 'long' : 'short'}">${signal.type}</td>
        <td>$${signal.entry}</td>
        <td>$${signal.target1}</td>
        <td>$${signal.target2}</td>
        <td>$${signal.stopLoss}</td>
        <td class="${signal.trend === 'Bullish' ? 'bullish' : 'bearish'}">${signal.trend}</td>
        <td class="${signal.volatility.toLowerCase()}">${signal.volatility}</td>
        <td class="${confidenceColor(signal.confidence)}">${signal.confidence}</td>
        <td class="${volumeColor(signal.volumeTrend)}">${signal.volumeTrend}</td>
        <td>${signal.riskReward}</td>
        <td class="status">${signal.status}</td>
    `;

    return row;
}

function confidenceColor(confidenceString) {
    const confidence = parseInt(confidenceString);
    if (confidence >= 80) return 'high-confidence';
    if (confidence >= 70) return 'medium-confidence';
    return 'low-confidence';
}

function volumeColor(trend) {
    if (trend === 'Increasing') return 'volume-up';
    if (trend === 'Decreasing') return 'volume-down';
    return 'volume-stable';
}

function updateSignals() {
    activeSignals.forEach(({ signal, row }) => {
        if (signal.status !== 'Active') return;

        simulatePriceMovement(signal);

        const statusCell = row.querySelector('.status');

        if (signal.type === 'Long') {
            if (signal.currentPrice >= signal.target1) {
                signal.status = 'Closed - Target Hit';
                row.classList.add('target-hit');
            } else if (signal.currentPrice <= signal.stopLoss) {
                signal.status = 'Closed - Stop Loss';
                row.classList.add('stop-loss');
            }
        } else {
            if (signal.currentPrice <= signal.target1) {
                signal.status = 'Closed - Target Hit';
                row.classList.add('target-hit');
            } else if (signal.currentPrice >= signal.stopLoss) {
                signal.status = 'Closed - Stop Loss';
                row.classList.add('stop-loss');
            }
        }

        statusCell.textContent = signal.status;
    });
}

function simulatePriceMovement(signal) {
    const randomMovement = Math.random() * 0.01 - 0.005;
    signal.currentPrice = parseFloat(signal.entry) * (1 + randomMovement);
}

// Atualiza painel Admin
function updateAdminPanel() {
    let active = 0;
    let targetHits = 0;
    let stopLosses = 0;

    signals.forEach(signal => {
        if (signal.status === 'Active') active++;
        else if (signal.status.includes('Target')) targetHits++;
        else if (signal.status.includes('Stop')) stopLosses++;
    });

    const totalClosed = targetHits + stopLosses;
    const winrate = totalClosed > 0 ? ((targetHits / totalClosed) * 100).toFixed(2) : 0;

    document.getElementById('active-count').textContent = active;
    document.getElementById('target-count').textContent = targetHits;
    document.getElementById('stop-count').textContent = stopLosses;
    document.getElementById('winrate').textContent = `${winrate}%`;
}

// Inicial
for (let i = 0; i < 5; i++) {
    generateSignal();
}

// Gera novo sinal a cada 60s
setInterval(generateSignal, 60000);

// Atualiza sinais a cada 10s
setInterval(updateSignals, 10000);

// Atualiza Admin Panel a cada 10s
setInterval(updateAdminPanel, 10000);
