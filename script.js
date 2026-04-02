class ClickerGame {
    constructor() {
        this.score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
        this.perSecond = 0;
        this.upgrades = [
            { id: 1, name: 'Cursor', cost: 10, increment: 1, count: 0 },
            { id: 2, name: 'Grandma', cost: 100, increment: 5, count: 0 },
            { id: 3, name: 'Farm', cost: 500, increment: 20, count: 0 },
            { id: 4, name: 'Factory', cost: 2000, increment: 100, count: 0 },
            { id: 5, name: 'Robot', cost: 10000, increment: 500, count: 0 }
        ];
        
        this.clickButton = document.getElementById('click-button');
        this.scoreDisplay = document.getElementById('score');
        this.perSecondDisplay = document.getElementById('per-second');
        this.upgradesList = document.getElementById('upgrades-list');
        
        this.init();
    }
    
    init() {
        this.clickButton.addEventListener('click', () => this.click());
        this.renderUpgrades();
        this.updateDisplay();
        this.startPassiveIncome();
        
        const savedUpgrades = localStorage.getItem('upgrades');
        if (savedUpgrades) {
            const upgrades = JSON.parse(savedUpgrades);
            this.upgrades = upgrades;
            this.calculatePerSecond();
            this.updateDisplay();
            this.renderUpgrades();
        }
    }
    
    click() {
        this.score += 1;
        this.updateDisplay();
        this.save();
    }
    
    buyUpgrade(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        
        if (!upgrade) return;
        
        if (this.score >= upgrade.cost) {
            this.score -= upgrade.cost;
            upgrade.count += 1;
            upgrade.cost = Math.ceil(upgrade.cost * 1.15);
            
            this.calculatePerSecond();
            this.updateDisplay();
            this.renderUpgrades();
            this.save();
        }
    }
    
    calculatePerSecond() {
        this.perSecond = this.upgrades.reduce((total, upgrade) => {
            return total + (upgrade.increment * upgrade.count);
        }, 0);
    }
    
    startPassiveIncome() {
        setInterval(() => {
            if (this.perSecond > 0) {
                this.score += this.perSecond;
                this.updateDisplay();
                this.save();
            }
        }, 1000);
    }
    
    updateDisplay() {
        this.scoreDisplay.textContent = `Score: ${this.formatNumber(this.score)}`;
        this.perSecondDisplay.textContent = `Per Second: ${this.formatNumber(this.perSecond)}`;
    }
    
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toString();
    }
    
    renderUpgrades() {
        this.upgradesList.innerHTML = '';
        
        this.upgrades.forEach(upgrade => {
            const canBuy = this.score >= upgrade.cost;
            const card = document.createElement('div');
            card.className = `upgrade-card ${!canBuy ? 'disabled' : ''}`;
            card.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-desc">+${upgrade.increment} per second (owned: ${upgrade.count})</div>
                </div>
                <div class="upgrade-cost">${this.formatNumber(upgrade.cost)}</div>
            `;
            
            if (canBuy) {
                card.addEventListener('click', () => this.buyUpgrade(upgrade.id));
            }
            
            this.upgradesList.appendChild(card);
        });
    }
    
    save() {
        localStorage.setItem('score', this.score);
        localStorage.setItem('upgrades', JSON.stringify(this.upgrades));
    }
}

const game = new ClickerGame();