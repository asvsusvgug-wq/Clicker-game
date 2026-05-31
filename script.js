// Game State
let gameState = {
    score: 0,
    clickPower: 1,
    passiveIncome: 0,
    prestigePoints: 0,
    multiplier: 1,
    upgrades: {
        cursor: { level: 1, baseCost: 10, power: 1 },
        grandma: { level: 0, baseCost: 100, power: 1 },
        farm: { level: 0, baseCost: 1000, power: 5 },
        factory: { level: 0, baseCost: 10000, power: 20 },
        bank: { level: 0, baseCost: 100000, power: 50 },
        moon: { level: 0, baseCost: 1000000, power: 500 }
    }
};

// Elements
const clickBtn = document.getElementById('clickBtn');
const scoreDisplay = document.getElementById('score');
const bpsDisplay = document.getElementById('bps');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const prestigeBtn = document.getElementById('prestigeBtn');
const prestigePoints = document.getElementById('prestigePoints');
const multiplier = document.getElementById('multiplier');

// Load game state
function loadGame() {
    const saved = localStorage.getItem('clickerGame');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading game:', e);
        }
    }
    updateUI();
}

// Save game state
function saveGame() {
    localStorage.setItem('clickerGame', JSON.stringify(gameState));
    saveBtn.textContent = '✅ Збережено!';
    setTimeout(() => {
        saveBtn.textContent = '💾 Зберегти';
    }, 2000);
}

// Click handler
clickBtn.addEventListener('click', () => {
    gameState.score += gameState.clickPower * gameState.multiplier;
    updateUI();
    createClickEffect();
});

// Create click effect animation
function createClickEffect() {
    const effect = document.createElement('div');
    effect.textContent = '+' + (gameState.clickPower * gameState.multiplier);
    effect.style.position = 'fixed';
    effect.style.pointerEvents = 'none';
    effect.style.fontWeight = 'bold';
    effect.style.color = '#667eea';
    effect.style.fontSize = '1.5em';
    effect.style.left = (clickBtn.offsetLeft + clickBtn.offsetWidth / 2) + 'px';
    effect.style.top = (clickBtn.offsetTop + clickBtn.offsetHeight / 2) + 'px';
    effect.style.animation = 'floatUp 1s ease-out forwards';
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

// Add floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.5);
        }
    }
`;
document.head.appendChild(style);

// Buy upgrade
document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const upgradeType = e.target.dataset.upgrade;
        buyUpgrade(upgradeType);
    });
});

function buyUpgrade(type) {
    const upgrade = gameState.upgrades[type];
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level)) / gameState.multiplier;
    
    if (gameState.score >= cost) {
        gameState.score -= cost;
        upgrade.level++;
        
        // Update passive income
        if (type !== 'cursor') {
            gameState.passiveIncome += upgrade.power;
        } else {
            gameState.clickPower += upgrade.power;
        }
        
        updateUI();
        saveGame();
    }
}

// Update UI
function updateUI() {
    scoreDisplay.textContent = formatNumber(gameState.score);
    bpsDisplay.textContent = formatNumber(gameState.passiveIncome);
    prestigePoints.textContent = gameState.prestigePoints;
    multiplier.textContent = gameState.multiplier.toFixed(1);
    
    // Update upgrade cards
    Object.keys(gameState.upgrades).forEach(type => {
        const upgrade = gameState.upgrades[type];
        const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level)) / gameState.multiplier;
        const costEl = document.getElementById(`cost-${type}`);
        const levelEl = document.getElementById(`level-${type}`);
        const btnEl = document.querySelector(`[data-upgrade="${type}"]`);
        
        if (costEl) costEl.textContent = `Вартість: ${formatNumber(cost)}`;
        if (levelEl) levelEl.textContent = `Lvl ${upgrade.level}`;
        
        if (btnEl) {
            btnEl.disabled = gameState.score < cost;
            if (gameState.score < cost) {
                btnEl.style.opacity = '0.5';
            } else {
                btnEl.style.opacity = '1';
            }
        }
    });
}

// Format numbers
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
}

// Passive income loop
setInterval(() => {
    if (gameState.passiveIncome > 0) {
        gameState.score += gameState.passiveIncome * gameState.multiplier;
        updateUI();
    }
}, 1000);

// Prestige
prestigeBtn.addEventListener('click', () => {
    if (gameState.score >= 1000000) {
        const prestigeGain = Math.floor(Math.sqrt(gameState.score / 1000000));
        gameState.prestigePoints += prestigeGain;
        gameState.multiplier = 1 + (gameState.prestigePoints * 0.2);
        
        // Reset game
        gameState.score = 0;
        gameState.clickPower = 1;
        gameState.passiveIncome = 0;
        Object.keys(gameState.upgrades).forEach(type => {
            if (type !== 'cursor') {
                gameState.upgrades[type].level = 0;
            } else {
                gameState.upgrades[type].level = 1;
            }
        });
        
        updateUI();
        saveGame();
        alert(`🎉 Престиж! +${prestigeGain} результатів!\nМультиплікатор: ${gameState.multiplier.toFixed(1)}x`);
    } else {
        alert('❌ Потрібно 1,000,000 очків д��я Престижу!');
    }
});

// Reset game
resetBtn.addEventListener('click', () => {
    if (confirm('Ви впевнені? Це видалить весь прогрес!')) {
        gameState = {
            score: 0,
            clickPower: 1,
            passiveIncome: 0,
            prestigePoints: 0,
            multiplier: 1,
            upgrades: {
                cursor: { level: 1, baseCost: 10, power: 1 },
                grandma: { level: 0, baseCost: 100, power: 1 },
                farm: { level: 0, baseCost: 1000, power: 5 },
                factory: { level: 0, baseCost: 10000, power: 20 },
                bank: { level: 0, baseCost: 100000, power: 50 },
                moon: { level: 0, baseCost: 1000000, power: 500 }
            }
        };
        localStorage.removeItem('clickerGame');
        updateUI();
        alert('✅ Гра скинута!');
    }
});

// Save on page leave
window.addEventListener('beforeunload', saveGame);

// Auto-save every 30 seconds
setInterval(saveGame, 30000);

// Initialize
loadGame();