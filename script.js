// Game state
// Load balance from localStorage or use default
let balance = parseInt(localStorage.getItem('rouletteBalance')) || 1000;
let selectedColor = null;
let betAmount = 0;
let isSpinning = false;
let isAdminLoggedIn = false;

// User login state
let currentUsername = localStorage.getItem('currentUsername') || null;
let alltimeHighScore = 0;

// Function to save balance to localStorage
function saveBalance() {
    localStorage.setItem('rouletteBalance', balance.toString());
}

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
const minigameBtn = document.getElementById('minigameBtn');
const minigameSection = document.getElementById('minigameSection');
const minefield = document.getElementById('minefield');
const minigameStatus = document.getElementById('minigameStatus');
const restartMinigameBtn = document.getElementById('restartMinigameBtn');
const loginSection = document.getElementById('loginSection');
const loggedInSection = document.getElementById('loggedInSection');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const usernameDisplay = document.getElementById('usernameDisplay');
const leaderboard = document.getElementById('leaderboard');

// Initialize
updateBalance();
checkBalance();
updateMinigameButton();
initLogin();
updateLeaderboard();

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
    
    // Calculate random angle for landing position (0-360 degrees)
    // Add extra rotations for visual effect
    const extraRotations = 4; // 4 full rotations
    const randomAngle = Math.random() * 360;
    const finalRotation = (extraRotations * 360) + randomAngle;
    
    // Set custom animation
    const ballStyle = document.createElement('style');
    ballStyle.id = 'ballSpinStyle';
    ballStyle.textContent = `
        @keyframes ballSpin {
            0% {
                transform: translate(-50%, -50%) rotate(0deg) translateX(170px) rotate(0deg);
            }
            100% {
                transform: translate(-50%, -50%) rotate(${finalRotation}deg) translateX(170px) rotate(-${finalRotation}deg);
            }
        }
    `;
    // Remove old style if exists
    const oldStyle = document.getElementById('ballSpinStyle');
    if (oldStyle) oldStyle.remove();
    document.head.appendChild(ballStyle);
    
    // Add spinning class - only ball moves, wheel stays still
    ball.classList.add('spinning');
    
    // End spin after animation
    setTimeout(() => {
        endSpin(randomAngle);
    }, spinDuration);
}

// End spin
function endSpin(finalAngle) {
    ball.classList.remove('spinning');
    
    // Normalize angle to 0-360 range
    const normalizedAngle = ((finalAngle % 360) + 360) % 360;
    
    // Determine which sector the ball lands on (30 sectors, 12 degrees each)
    // Sectors start at 0 degrees: sector 0 = 0-12deg (red), sector 1 = 12-24deg (black), etc.
    // Add 0.1 degree offset to avoid landing exactly on boundaries
    const adjustedAngle = (normalizedAngle + 0.1) % 360;
    const sectorIndex = Math.floor(adjustedAngle / 12);
    const sectorElements = document.querySelectorAll('.sector');
    const landingSector = sectorElements[sectorIndex];
    
    // Ensure we always get a valid color - sectors alternate: odd = red, even = black
    let winningColor;
    if (landingSector) {
        winningColor = landingSector.getAttribute('data-color');
    } else {
        // Fallback: determine by sector index (0,2,4... = red, 1,3,5... = black)
        winningColor = (sectorIndex % 2 === 0) ? 'red' : 'black';
    }
    
    // Position ball at final angle on the wheel edge
    const radius = 170;
    const angleRad = (normalizedAngle * Math.PI) / 180;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    ball.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    
    // Reset ball position after showing result
    setTimeout(() => {
        ball.style.transform = 'translate(-50%, -50%)';
    }, 2000);
    
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
    saveBalance(); // Save to localStorage whenever balance is updated
    updateMinigameButton(); // Update minigame button visibility
    updateHighScore(); // Update high score if logged in
}

// Check balance and update minigame button visibility
function checkBalance() {
    updateMinigameButton();
}

function updateMinigameButton() {
    const minigameBtn = document.getElementById('minigameBtn');
    const minigameSection = document.getElementById('minigameSection');
    if (minigameBtn && minigameSection) {
        if (balance < 1000) {
            minigameSection.style.display = 'block';
            minigameBtn.disabled = false;
        } else {
            minigameSection.style.display = 'none';
        }
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

// Minigame - Minesweeper
const GRID_SIZE = 4;
const MINE_COUNT = 3;
let minesweeperGrid = [];
let revealedCells = [];
let flaggedCells = [];
let gameOver = false;
let gameWon = false;

// Show minigame button click handler
if (minigameBtn) {
    minigameBtn.addEventListener('click', () => {
        if (balance >= 1000) return;
        showMinigame();
    });
}

// Close modal when clicking outside
if (minigameModal) {
    minigameModal.addEventListener('click', (e) => {
        if (e.target === minigameModal) {
            closeMinigame();
        }
    });
}

function closeMinigame() {
    minigameModal.classList.remove('active');
    gameOver = false;
    gameWon = false;
}

function showMinigame() {
    if (balance >= 1000) return;
    
    minigameModal.classList.add('active');
    gameOver = false;
    gameWon = false;
    revealedCells = [];
    flaggedCells = [];
    restartMinigameBtn.style.display = 'none';
    minigameStatus.textContent = 'Klikk på en rute for å starte. Høyreklikk for å flagge.';
    
    // Initialize grid
    minesweeperGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        minesweeperGrid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            minesweeperGrid[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }
    
    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        if (!minesweeperGrid[row][col].isMine) {
            minesweeperGrid[row][col].isMine = true;
            minesPlaced++;
        }
    }
    
    // Calculate neighbor mines
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (!minesweeperGrid[i][j].isMine) {
                minesweeperGrid[i][j].neighborMines = countNeighborMines(i, j);
            }
        }
    }
    
    // Create grid UI
    createGridUI();
}

function countNeighborMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
                if (minesweeperGrid[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
    }
    return count;
}

function createGridUI() {
    minefield.innerHTML = '';
    minefield.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('button');
            cell.className = 'mine-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.textContent = '';
            
            // Left click to reveal
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                if (!gameOver && !gameWon) {
                    revealCell(i, j);
                }
            });
            
            // Right click to flag
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (!gameOver && !gameWon) {
                    toggleFlag(i, j);
                }
            });
            
            minefield.appendChild(cell);
        }
    }
}

function revealCell(row, col) {
    const cell = minesweeperGrid[row][col];
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (cell.isRevealed || cell.isFlagged || gameOver || gameWon) return;
    
    cell.isRevealed = true;
    revealedCells.push(`${row}-${col}`);
    cellElement.classList.add('revealed');
    
    if (cell.isMine) {
        // Hit a mine!
        cellElement.textContent = '💣';
        cellElement.classList.add('bomb');
        gameOver = true;
        revealAllMines();
        minigameStatus.textContent = '💥 Du traff en mine! Prøv igjen.';
        restartMinigameBtn.style.display = 'block';
    } else {
        // Safe cell
        if (cell.neighborMines > 0) {
            cellElement.textContent = cell.neighborMines;
            cellElement.classList.add(`number-${cell.neighborMines}`);
        } else {
            // Auto-reveal neighbors if no mines nearby
            revealNeighbors(row, col);
        }
        
        checkWin();
    }
}

function revealNeighbors(row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
                const neighbor = minesweeperGrid[newRow][newCol];
                if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                    revealCell(newRow, newCol);
                }
            }
        }
    }
}

function toggleFlag(row, col) {
    const cell = minesweeperGrid[row][col];
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (cell.isRevealed || gameOver || gameWon) return;
    
    if (cell.isFlagged) {
        cell.isFlagged = false;
        cellElement.textContent = '';
        cellElement.classList.remove('flagged');
        flaggedCells = flaggedCells.filter(f => f !== `${row}-${col}`);
    } else {
        cell.isFlagged = true;
        cellElement.textContent = '🚩';
        cellElement.classList.add('flagged');
        flaggedCells.push(`${row}-${col}`);
    }
}

function revealAllMines() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (minesweeperGrid[i][j].isMine) {
                const cellElement = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (!cellElement.classList.contains('bomb')) {
                    cellElement.textContent = '💣';
                    cellElement.classList.add('bomb');
                }
            }
        }
    }
}

function checkWin() {
    const totalCells = GRID_SIZE * GRID_SIZE;
    const safeCells = totalCells - MINE_COUNT;
    
    if (revealedCells.length === safeCells) {
        gameWon = true;
        const reward = Math.min(500, 1000 - balance);
        balance += reward;
        updateBalance();
        updateMinigameButton();
        minigameStatus.textContent = `🎉 Gratulerer! Du fikk ${reward} kr!`;
        
        setTimeout(() => {
            closeMinigame();
            showResult(`Du fikk ${reward} kr fra minispillet!`, 'win');
        }, 2000);
    } else {
        const remaining = safeCells - revealedCells.length;
        minigameStatus.textContent = `${remaining} trygge ruter igjen.`;
    }
}

if (restartMinigameBtn) {
    restartMinigameBtn.addEventListener('click', () => {
        showMinigame();
    });
}

// Login functionality
function initLogin() {
    if (currentUsername) {
        // Already logged in
        if (loginSection) loginSection.style.display = 'none';
        if (loggedInSection) loggedInSection.style.display = 'block';
        if (usernameDisplay) usernameDisplay.textContent = currentUsername;
        loadHighScore();
    } else {
        // Not logged in
        if (loginSection) loginSection.style.display = 'flex';
        if (loggedInSection) loggedInSection.style.display = 'none';
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

function handleLogin() {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Skriv inn et brukernavn!');
        return;
    }
    
    if (username.length > 20) {
        alert('Brukernavn kan maks være 20 tegn!');
        return;
    }
    
    currentUsername = username;
    localStorage.setItem('currentUsername', username);
    
    if (loginSection) loginSection.style.display = 'none';
    if (loggedInSection) loggedInSection.style.display = 'block';
    if (usernameDisplay) usernameDisplay.textContent = username;
    if (usernameInput) usernameInput.value = '';
    
    loadHighScore();
    updateLeaderboard();
}

function loadHighScore() {
    if (!currentUsername) return;
    
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboardData') || '{}');
    alltimeHighScore = leaderboardData[currentUsername] || 0;
}

function updateHighScore() {
    if (!currentUsername) return;
    
    if (balance > alltimeHighScore) {
        alltimeHighScore = balance;
        const leaderboardData = JSON.parse(localStorage.getItem('leaderboardData') || '{}');
        leaderboardData[currentUsername] = alltimeHighScore;
        localStorage.setItem('leaderboardData', JSON.stringify(leaderboardData));
        updateLeaderboard();
    }
}

function updateLeaderboard() {
    if (!leaderboard) return;
    
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboardData') || '{}');
    
    // Convert to array and sort by score (descending)
    const entries = Object.entries(leaderboardData)
        .map(([username, score]) => ({ username, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10
    
    if (entries.length === 0) {
        leaderboard.innerHTML = '<p class="no-entries">Ingen poeng enda. Logg inn og spill for å komme på leaderboard!</p>';
        return;
    }
    
    leaderboard.innerHTML = entries.map((entry, index) => {
        const isCurrentUser = entry.username === currentUsername;
        return `
            <div class="leaderboard-entry ${isCurrentUser ? 'current-user' : ''}">
                <span class="rank">${index + 1}.</span>
                <span class="username">${entry.username}</span>
                <span class="score">${entry.score.toLocaleString('no-NO')} kr</span>
            </div>
        `;
    }).join('');
}


