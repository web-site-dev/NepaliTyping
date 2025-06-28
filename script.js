// --- Real-time Nepali Speech-to-Preeti Only ---

// Complete Unicode to Preeti mapping
const unicodeToPreetiMap = {
    // Basic Consonants
    'क': 's', 'ख': 'v', 'ग': 'u', 'घ': '3', 'ङ': 'ª',
    'च': 'r', 'छ': '5', 'ज': 'h', 'झ': '´', 'ञ': '`',
    'ट': '6', 'ठ': '7', 'ड': '8', 'ढ': '9', 'ण': '0',
    'त': 't', 'थ': 'y', 'द': 'b', 'ध': 'w', 'न': 'g',
    'प': 'k', 'फ': 'km', 'ब': 'a', 'भ': 'e', 'म': 'd',
    'य': 'o', 'र': '/', 'ल': 'n', 'व': 'j', 'श': 'z',
    'ष': 'if', 'स': ';', 'ह': 'x',

    // Vowels (Independent)
    'अ': 'c', 'आ': 'cf', 'इ': 'b', 'ई': 'B', 'उ': 'p', 'ऊ': 'P',
    'ए': 'G', 'ऐ': 'A', 'ओ': 'cf]', 'औ': 'u]', 'ऋ': '[f]',

    // Matras (Vowel Signs)
    'ा': 'f', 'ि': 'l', 'ी': 'L', 'ु': 'p', 'ू': 'P', 'े': 'G', 'ै': 'A',
    'ो': 'f]', 'ौ': 'f]', 'ृ': '[',

    // Anuswara, Visarga, Chandrabindu
    'ं': 'F', 'ः': 'M', 'ँ': 'F',

    // Halanta/Virama
    '्': ';',

    // Numbers
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',

    // Common Conjuncts (Ligatures) - Order matters for longer matches first
    'क्ष': 'If', 'त्र': 't|', 'ज्ञ': '1', 'श्र': 'z|', 'द्य': 'b\\', 'द्व': 'bZ',
    'द्घ': 'b3', 'द्ध': 'W', 'ट्ट': '68', 'द्यो': 'b\\f]', 'ज्ज': 'h÷',
    'क्त': 'st', 'क्त्व': 'stj', 'क्य': 's\\', 'क्क': 'sS', 'ण्ड': '08',
    'न्द': 'g\\b', 'न्द्व': 'g\\bZ', 'श्व': 'zj', 'न्ह': 'gx', 'म्ह': 'dx',
    'ह्व': 'hx', 'ह्न': 'h~g', 'ह्म': 'hx', 'न्न': 'gG', 'न्त': 'Gt',
    'म्ब': 'dL', 'म्ल': 'dn', 'ण्ण': '0f', 'त्रो': 't|f]', 'ङ्क': 'ªs',
    'ङ्ग': 'ªu', 'ञ्च': 'ªr', 'ञ्ज': '`h', 'ण्ट': '68', 'ण्ठ': '07',
    'ण्ड': '08', 'ण्ढ': '09', 'त्त': 'tT', 'द्भ': 'bK', 'ध्र': 'w|',
    'न्च': 'gr', 'न्ज': 'gh', 'प्त': 'Kt', 'प्र': 'k|', 'प्ल': 'kn',
    'ब्ज': 'ah', 'भ्र': 'e|', 'म्फ': 'dm', 'ष्ट': 'i6', 'ष्ठ': 'i7',
    'स्न': ';g', 'स्त': ';t', 'स्थ': ';y', 'स्फ': ';km', 'स्त्र': ';t|',
    'ह्ल': 'hx', 'ह्य': 'h\\', 'हृ': 'h]', 'द्द': 'bB',

    // Punctuation and Symbols
    '।': '.', ',': ',', '.': '.', '/': '/', '(': '(', ')': ')',
    '-': '-', ':': ':', ';': ';', '\'': '"', '"': '"', '!': '!',
    '?': '?', '=': '=', '+': '+', '₹': '?',

    // Space
    ' ': ' '
};

function unicodeToPreeti(unicodeText) {
    // Sort keys by length (longest first) to handle conjuncts properly
    const sortedKeys = Object.keys(unicodeToPreetiMap).sort((a, b) => b.length - a.length);
    
    let result = unicodeText;
    for (const key of sortedKeys) {
        const regex = new RegExp(key, 'g');
        result = result.replace(regex, unicodeToPreetiMap[key]);
    }
    
    return result;
}

// --- DOM Elements ---
const micButton = document.getElementById('micButton');
const statusDiv = document.getElementById('status');
const preetiTextArea = document.getElementById('preetiText');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');

// --- Speech Recognition Setup ---
let recognition;
let recognizing = false;
let unicodeText = '';
let noAudioTimeout;

// --- Auto Reset on Page Load ---
function resetText() {
    unicodeText = '';
    preetiTextArea.value = '';
    updatePreeti();
}

// Reset text when page loads (new session)
document.addEventListener('DOMContentLoaded', resetText);

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ne-NP';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        recognizing = true;
        micButton.classList.add('recording');
        statusDiv.textContent = 'सुनिरहनुभएको छ... नेपालीमा बोल्नुहोस्।';
        micButton.querySelector('span').textContent = 'सुनिरहनुभएको छ...';
        
        // Set timeout to check for no audio after 3 seconds
        noAudioTimeout = setTimeout(() => {
            if (recognizing && unicodeText.trim() === '') {
                statusDiv.textContent = 'तपाईंको आवाज सुनिएको छैन, कृपया ठूलो बोल्नुहोस्';
            }
        }, 3000);
    };

    recognition.onerror = (event) => {
        clearTimeout(noAudioTimeout);
        statusDiv.textContent = 'त्रुटि: ' + event.error;
        micButton.classList.remove('recording');
        micButton.querySelector('span').textContent = 'यहाँ थिच्नुहोस्';
        recognizing = false;
    };

    recognition.onend = () => {
        clearTimeout(noAudioTimeout);
        recognizing = false;
        micButton.classList.remove('recording');
        statusDiv.textContent = 'मान्यता रोकियो। फेरि सुरु गर्न माइक्रोफोन थिच्नुहोस्।';
        micButton.querySelector('span').textContent = 'यहाँ थिच्नुहोस्';
    };

    recognition.onresult = (event) => {
        clearTimeout(noAudioTimeout);
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }
        
        if (final.trim() !== '' || interim.trim() !== '') {
            unicodeText = (unicodeText + ' ' + final + interim).trim();
            updatePreeti();
            statusDiv.textContent = 'सुनिरहनुभएको छ... नेपालीमा बोल्नुहोस्।';
        }
    };

    recognition.onnomatch = () => {
        statusDiv.textContent = 'तपाईंको आवाज सुनिएको छैन, कृपया ठूलो बोल्नुहोस्';
    };

    recognition.onaudiostart = () => {
        statusDiv.textContent = 'सुनिरहनुभएको छ... नेपालीमा बोल्नुहोस्।';
    };

    recognition.onaudioend = () => {
        if (recognizing && unicodeText.trim() === '') {
            statusDiv.textContent = 'तपाईंको आवाज सुनिएको छैन, कृपया ठूलो बोल्नुहोस्';
        }
    };

    micButton.onclick = () => {
        if (recognizing) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };
} else {
    statusDiv.textContent = 'माफ गर्नुहोस्, तपाईंको ब्राउजरले Speech Recognition समर्थन गर्दैन। Google Chrome प्रयोग गर्नुहोस्।';
    micButton.disabled = true;
}

// --- Copy Button ---
copyBtn.onclick = () => {
    const text = preetiTextArea.value;
    navigator.clipboard.writeText(text);
    statusDiv.textContent = 'क्लिपबोर्डमा कपी गरियो!';
    setTimeout(() => statusDiv.textContent = '', 1500);
};

// --- Reset Button ---
resetBtn.onclick = () => {
    resetText();
    statusDiv.textContent = 'टेक्स्ट सफा गरियो!';
    setTimeout(() => statusDiv.textContent = '', 1500);
};

// --- Update Preeti ---
function updatePreeti() {
    preetiTextArea.value = unicodeToPreeti(unicodeText);
}

// --- Update Preeti on manual typing ---
preetiTextArea.addEventListener('input', function() {
    unicodeText = preetiTextArea.value; // This will not convert back to Unicode, but allows manual editing
    updatePreeti();
});

// --- Initial call ---
updatePreeti(); 