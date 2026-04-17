document.addEventListener('DOMContentLoaded', () => {
    // Timer Variables
    let time = 10; // Default initial time from your image
    let initialTime = 10; // Time to reset to
    let timerInterval = null;
    let isRunning = false;
    let audioCtx = null;

    // Timer Elements
    const timerDisplay = document.getElementById('timer-display');
    const timerCard = document.querySelector('.timer-card');
    const btnPlusTime = document.getElementById('btn-plus-time');
    const btnMinusTime = document.getElementById('btn-minus-time');
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');
    const btnReset = document.getElementById('btn-reset');

    // Score Elements default starting points
    const teamScores = [0, 0, 0, 0];
    const teamCards = document.querySelectorAll('.team-card');

    // Initialize Timer Display
    function updateTimerDisplay() {
        timerDisplay.textContent = time + ' s';
        if (time <= 10 && time > 0) {
            timerDisplay.classList.add('low-time');
        } else {
            timerDisplay.classList.remove('low-time');
        }
        
        if (time <= 5 && time > 0) {
            timerCard.classList.add('warning-blink');
        } else {
            timerCard.classList.remove('warning-blink');
        }
    }
    updateTimerDisplay();

    // Audio Functions
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playWarningSound() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 1000;
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }

    function playEndSound() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1);
    }

    // Timer Functions
    function startTimer() {
        if (isRunning || time <= 0) return;
        initAudio();
        isRunning = true;
        timerDisplay.classList.add('running');
        timerInterval = setInterval(() => {
            time--;
            updateTimerDisplay();
            
            if (time <= 5 && time > 0) {
                playWarningSound();
            }
            
            if (time <= 0) {
                playEndSound();
                stopTimer();
            }
        }, 1000);
    }

    function stopTimer() {
        isRunning = false;
        timerDisplay.classList.remove('running');
        clearInterval(timerInterval);
    }

    function resetTimer() {
        stopTimer();
        time = initialTime;
        updateTimerDisplay();
    }

    // Toggle timer on click on the time display itself
    timerDisplay.addEventListener('click', () => {
        if (isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    btnStart.addEventListener('click', startTimer);
    btnStop.addEventListener('click', stopTimer);
    btnReset.addEventListener('click', resetTimer);

    btnPlusTime.addEventListener('click', () => {
        if (time < 60) {
            time++;
            if (!isRunning) {
                initialTime = time; // Update initial time if adjusted while stopped
            }
            updateTimerDisplay();
        }
    });

    btnMinusTime.addEventListener('click', () => {
        if (time > 0) {
            time--;
            if (!isRunning) {
                initialTime = time;
            }
            updateTimerDisplay();
        }
    });

    // Score Functions
    let SCORE_STEP = 100;

    const pointRadios = document.querySelectorAll('input[name="point-step"]');
    pointRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            SCORE_STEP = parseInt(e.target.value, 10);
        });
    });

    teamCards.forEach((card, index) => {
        const scoreDisplay = card.querySelector('.score-display');
        const btnPlusScore = card.querySelector('.btn-score-plus');
        const btnMinusScore = card.querySelector('.btn-score-minus');
        
        // Initialize explicit values
        scoreDisplay.textContent = teamScores[index];

        btnPlusScore.addEventListener('click', () => {
            teamScores[index] += SCORE_STEP;
            scoreDisplay.textContent = teamScores[index];
            animateScore(scoreDisplay);
        });

        btnMinusScore.addEventListener('click', () => {
            teamScores[index] -= SCORE_STEP;
            scoreDisplay.textContent = teamScores[index];
            animateScore(scoreDisplay);
        });
    });

    function animateScore(element) {
        element.style.transform = 'scale(1.2)';
        element.style.color = 'var(--primary)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '#f8fafc';
        }, 200);
    }

    // Modal Logic
    const btnEnd = document.getElementById('btn-end');
    const modal = document.getElementById('winner-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const winnerTeamName = document.getElementById('winner-team-name');
    const winnerScoreValue = document.getElementById('winner-score-value');

    btnEnd.addEventListener('click', () => {
        // Find max score
        let maxScore = -Infinity;
        let winners = [];

        teamCards.forEach((card, index) => {
            const score = teamScores[index];
            const name = card.querySelector('.team-name').value || `Tim ${index + 1}`;
            
            if (score > maxScore) {
                maxScore = score;
                winners = [name];
            } else if (score === maxScore) {
                winners.push(name);
            }
        });

        // Display winner text
        if (winners.length > 1) {
            winnerTeamName.textContent = "Seri: " + winners.join(' & ');
        } else {
            winnerTeamName.textContent = winners[0];
        }
        
        winnerScoreValue.textContent = maxScore;
        modal.classList.remove('hidden');
    });

    btnCloseModal.addEventListener('click', () => {
        modal.classList.add('hidden');

        // Reset semua nilai ke 0 setelah modal ditutup
        teamCards.forEach((card, index) => {
            teamScores[index] = 0;
            const scoreDisplay = card.querySelector('.score-display');
            scoreDisplay.textContent = 0;
        });

        // Reset timer ke posisi awal ketika permainan berakhir
        resetTimer();
    });
});
