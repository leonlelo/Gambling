// Game state
let balance = 1000;
let selectedColor = null;
let betAmount = 0;
let isSpinning = false;
let isAdminLoggedIn = false;

// DOM elements
const balanceEl = document.getElementById('balance');
const betRedBtn = document.getElementById('betRed');
const betBlackBtn = document.getElementById('betBlack');
const betAmountInput = document.getElementById('betAmount');
const spinBtn = document.getElementById('spinBtn');
const selectedBetEl = document.getElementById('selectedBet');
const resultMessageEl = document.getElementById('resultMessage');
const rouletteWheel = document.getElementById('rouletteWheel');
const ball = document.getElementById('ball');
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminControls = document.getElementById('adminControls');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const adminMoneyInput = document.getElementById('adminMoney');
const setMoneyBtn = document.getElementById('setMoneyBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const minigameModal = document.getElementById('minigameModal');
const clickBtn = document.getElementById('clickBtn');
const clickCountEl = document.getElementById('clickCount');
const timeLeftEl = document.getElementById('timeLeft');

// Initialize
updateBalance();
checkBalance();

// Color selection
betRedBtn.addEventListener('click', () => {
    if (isSpinning) return;
    selectedColor = 'red';
    betRedBtn.classList.add('selected');
    betBlackBtn.classList.remove('selected');
    updateSelectedBet();
});

betBlackBtn.addEventListener('click', () => {
    if (isSpinning) return;
    selectedColor = 'black';
    betBlackBtn.classList.add('selected');
    betRedBtn.classList.remove('selected');
    updateSelectedBet();
});

// Spin button
spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    if (!selectedColor) {
        showResult('Velg en farge først!', 'lose');
        return;
    }
    
    betAmount = parseInt(betAmountInput.value);
    if (!betAmount || betAmount <= 0) {
        showResult('Skriv inn et gyldig beløp!', 'lose');
        return;
    }
    
    if (betAmount > balance) {
        showResult('Du har ikke nok penger!', 'lose');
        return;
    }
    
    startSpin();
});

// Update selected bet display
function updateSelectedBet() {
    if (selectedColor) {
        const colorText = selectedColor === 'red' ? 'RØD' : 'SVART';
        selectedBetEl.textContent = `Valgt: ${colorText}`;
        selectedBetEl.style.background = selectedColor === 'red' ? '#c41e3a' : '#1a1a1a';
        selectedBetEl.style.color = 'white';
    } else {
        selectedBetEl.textContent = 'Ingen farge valgt';
        selectedBetEl.style.background = '#faf8f3';
        selectedBetEl.style.color = '#5a4a3a';
    }
}

// Start spin
function startSpin() {
    isSpinning = true;
    balance -= betAmount;
    updateBalance();
    
    // Disable buttons
    betRedBtn.disabled = true;
    betBlackBtn.disabled = true;
    spinBtn.disabled = true;
    betAmountInput.disabled = true;
    
    // Clear previous result
    resultMessageEl.textContent = '';
    resultMessageEl.className = 'result-message';
    
    // Spin animation
    const spinDuration = 3000; // 3 seconds
    const sectors = ['red', 'black'];
    
    // Add spinning class
    ball.classList.add('spinning');
    rouletteWheel.style.animation = `wheelSpin ${spinDuration}ms ease-out`;
    
    // Random result after spin (with some randomness for excitement)
    setTimeout(() => {
        const winningColor = sectors[Math.floor(Math.random() * sectors.length)];
        endSpin(winningColor);
    }, spinDuration);
}

// End spin
function endSpin(winningColor) {
    ball.classList.remove('spinning');
    rouletteWheel.style.animation = '';
    
    // Check win/lose
    if (winningColor === selectedColor) {
        // Win - double the money
        balance += betAmount * 2;
        showResult(`🎉 Gratulerer! Du vant ${betAmount * 2} kr!`, 'win');
    } else {
        // Lose - already deducted
        showResult(`😢 Du tapte! Riktig farge var ${winningColor === 'red' ? 'RØD' : 'SVART'}`, 'lose');
    }
    
    updateBalance();
    checkBalance();
    
    // Reset
    isSpinning = false;
    selectedColor = null;
    betRedBtn.classList.remove('selected');
    betBlackBtn.classList.remove('selected');
    selectedBetEl.textContent = 'Ingen farge valgt';
    selectedBetEl.style.background = '#faf8f3';
    selectedBetEl.style.color = '#5a4a3a';
    
    // Re-enable buttons
    betRedBtn.disabled = false;
    betBlackBtn.disabled = false;
    spinBtn.disabled = false;
    betAmountInput.disabled = false;
}

// Show result message
function showResult(message, type) {
    resultMessageEl.textContent = message;
    resultMessageEl.className = `result-message ${type}`;
}

// Update balance display
function updateBalance() {
    balanceEl.textContent = balance.toLocaleString('no-NO');
}

// Check balance and show minigame if needed
function checkBalance() {
    if (balance <= 0) {
        setTimeout(() => {
            showMinigame();
        }, 1000);
    }
}

// Admin panel toggle
adminToggle.addEventListener('click', () => {
    adminPanel.classList.toggle('active');
});

// Admin login
adminLoginBtn.addEventListener('click', () => {
    const username = adminUsername.value;
    const password = adminPassword.value;
    
    if (username === 'admin' && password === 'admin123') {
        isAdminLoggedIn = true;
        adminControls.style.display = 'block';
        adminLoginBtn.style.display = 'none';
        adminUsername.disabled = true;
        adminPassword.disabled = true;
    } else {
        alert('Feil brukernavn eller passord!');
    }
});

// Admin logout
adminLogoutBtn.addEventListener('click', () => {
    isAdminLoggedIn = false;
    adminControls.style.display = 'none';
    adminLoginBtn.style.display = 'block';
    adminUsername.disabled = false;
    adminPassword.disabled = false;
    adminUsername.value = '';
    adminPassword.value = '';
});

// Set money (admin)
setMoneyBtn.addEventListener('click', () => {
    if (!isAdminLoggedIn) {
        alert('Du må være logget inn som admin!');
        return;
    }
    
    const newBalance = parseInt(adminMoneyInput.value);
    if (newBalance >= 0) {
        balance = newBalance;
        updateBalance();
        adminMoneyInput.value = '';
        alert(`Saldo satt til ${balance} kr`);
    } else {
        alert('Ugyldig beløp!');
    }
});

// Minigame
let clickCount = 0;
let timeLeft = 5;
let minigameInterval = null;

function showMinigame() {
    minigameModal.classList.add('active');
    clickCount = 0;
    timeLeft = 5;
    clickCountEl.textContent = '0';
    timeLeftEl.textContent = '5';
    clickBtn.disabled = false;
    
    // Start timer
    minigameInterval = setInterval(() => {
        timeLeft--;
        timeLeftEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endMinigame();
        }
    }, 1000);
}

function endMinigame() {
    clearInterval(minigameInterval);
    clickBtn.disabled = true;
    
    // Give money based on clicks (minimum 1000)
    const earned = Math.max(1000, clickCount * 50);
    balance = earned;
    updateBalance();
    
    setTimeout(() => {
        minigameModal.classList.remove('active');
        showResult(`Du fikk ${earned} kr fra minispillet!`, 'win');
    }, 2000);
}

clickBtn.addEventListener('click', () => {
    if (clickBtn.disabled) return;
    clickCount++;
    clickCountEl.textContent = clickCount;
    
    // Add visual feedback
    clickBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickBtn.style.transform = 'scale(1)';
    }, 100);
});

// Add CSS animation for wheel spin
const style = document.createElement('style');
style.textContent = `
    @keyframes wheelSpin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(720deg);
        }
    }
`;
document.head.appendChild(style);

