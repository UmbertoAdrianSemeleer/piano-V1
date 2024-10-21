// Define the piano keys and the song to be played
const pianoKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const song = ['C', 'D', 'E', 'C', 'C', 'D', 'E', 'C', 'E', 'F', 'G', 'E', 'F', 'G'];

// Initialize game state variables
let currentLesson = 0;
let score = 0;
let currentNoteIndex = 0;

// Get DOM elements
const pianoContainer = document.getElementById('piano-container');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score-value');
const startLessonButton = document.getElementById('start-lesson');
const nextLessonButton = document.getElementById('next-lesson');
const difficultySelect = document.getElementById('difficulty');
const lessonInstructions = document.getElementById('lesson-instructions');
const currentLessonElement = document.getElementById('current-lesson');
const visualCuesElement = document.getElementById('visual-cues');

// Mapping computer keyboard keys to piano notes
const keyboardMap = {
    'a': 'C', 's': 'D', 'd': 'E', 'f': 'F', 'g': 'G', 'h': 'A', 'j': 'B',
    'w': 'C#', 'e': 'D#', 't': 'F#', 'y': 'G#', 'u': 'A#'
};

// Create audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to create and play a piano note
function playPianoSound(frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Function to get frequency for a given note
function getFrequency(note) {
    const noteFrequencies = {
        'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
        'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
        'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };
    return noteFrequencies[note];
}

// Function to create the piano keys
function createPiano() {
    for (let octave = 0; octave < 2; octave++) {
        pianoKeys.forEach((key, index) => {
            // Create white keys
            const keyElement = document.createElement('div');
            keyElement.className = 'piano-key';
            keyElement.dataset.note = key;
            keyElement.dataset.octave = octave;
            keyElement.addEventListener('click', () => playNote(key, octave));
            
            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = key;
            keyElement.appendChild(label);
            
            pianoContainer.appendChild(keyElement);

            // Create black keys (except after E and B)
            if (['C', 'D', 'F', 'G', 'A'].includes(key) && index < pianoKeys.length - 1) {
                const blackKey = document.createElement('div');
                blackKey.className = 'piano-key black';
                blackKey.dataset.note = key + '#';
                blackKey.dataset.octave = octave;
                blackKey.addEventListener('click', () => playNote(key + '#', octave));
                
                const blackLabel = document.createElement('span');
                blackLabel.className = 'key-label';
                blackLabel.textContent = key + '#';
                blackKey.appendChild(blackLabel);
                
                pianoContainer.appendChild(blackKey);
            }
        });
    }
}

// Function to handle note playing
function playNote(note, octave) {
    const keyElement = document.querySelector(`.piano-key[data-note="${note}"][data-octave="${octave}"]`);
    keyElement.classList.add('active');
    setTimeout(() => keyElement.classList.remove('active'), 300);

    // Play the piano sound
    const frequency = getFrequency(note) * Math.pow(2, octave);
    playPianoSound(frequency);

    // Check if the played note matches the current note in the song
    if (note === song[currentNoteIndex]) {
        feedbackElement.textContent = 'Correct!';
        feedbackElement.style.color = 'green';
        score += 10;
        scoreElement.textContent = score;
        currentNoteIndex++;

        // Check if the song is completed
        if (currentNoteIndex === song.length) {
            feedbackElement.textContent = 'Congratulations! You completed the lesson!';
            nextLessonButton.style.display = 'inline-block';
            currentNoteIndex = 0;
        }
    } else {
        feedbackElement.textContent = 'Try again!';
        feedbackElement.style.color = 'red';
    }

    updateVisualCues();
}

// Function to update visual cues for the song
function updateVisualCues() {
    visualCuesElement.innerHTML = '';
    song.forEach((note, index) => {
        const noteElement = document.createElement('span');
        noteElement.textContent = note;
        noteElement.style.margin = '0 5px';
        if (index === currentNoteIndex) {
            noteElement.style.fontWeight = 'bold';
            noteElement.style.color = 'blue';
        } else if (index < currentNoteIndex) {
            noteElement.style.color = 'green';
        }
        visualCuesElement.appendChild(noteElement);
    });
}

// Function to start a new lesson
function startLesson() {
    currentLesson++;
    currentLessonElement.textContent = `Lesson ${currentLesson}`;
    lessonInstructions.textContent = `Play the highlighted notes to learn Frère Jacques. Start with the first note: C`;
    startLessonButton.style.display = 'none';
    nextLessonButton.style.display = 'none';
    updateVisualCues();
}

// Function to move to the next lesson
function nextLesson() {
    startLesson();
}

// Event listener for keyboard input
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (keyboardMap.hasOwnProperty(key)) {
        const note = keyboardMap[key];
        const octave = 0; // Assuming first octave for simplicity
        playNote(note, octave);
    }
});

// Event listeners for buttons and difficulty select
startLessonButton.addEventListener('click', startLesson);
nextLessonButton.addEventListener('click', nextLesson);

difficultySelect.addEventListener('change', (e) => {
    const difficulty = e.target.value;
    // TODO: Implement difficulty changes here
    console.log(`Difficulty changed to: ${difficulty}`);
});

// Initialize the piano
createPiano();

// Add keyboard instructions
const keyboardInstructions = document.createElement('p');
keyboardInstructions.textContent = 'Use your keyboard to play! Keys A-J for white keys, W, E, T, Y, U for black keys.';
keyboardInstructions.className = 'text-center mt-4 text-gray-600';
document.getElementById('game-container').appendChild(keyboardInstructions);