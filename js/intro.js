class GlitchIntro {
    constructor(mainContentSelector, { text, keySoundSrc, pwnedSoundSrc,BTNinnerText }) {
        this.mainContentEl = document.querySelector(mainContentSelector);
        this.text = text;
        this.keySoundSrc = keySoundSrc;
        this.pwnedSoundSrc = pwnedSoundSrc;
        this.BTNinnerText = BTNinnerText;

        this.animationFrameId = null; 

        if (this.mainContentEl) {
            this.mainContentEl.style.display = 'none';
        }

        this.createIntroElements(); 
        this.setupCanvas();
        this.setupStartButton();
        this.animate(); 
    }

    createIntroElements() {
        this.introContainer = document.createElement('div');
        this.introContainer.id = 'glitch-intro-container';

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'glitchCanvas';

        this.typingEl = document.createElement('div');
        this.typingEl.id = 'typing';

        this.startButton = document.createElement('button');
        this.startButton.id = 'startButton';
        this.startButton.innerText = this.BTNinnerText;

        this.introContainer.appendChild(this.canvas);
        this.introContainer.appendChild(this.typingEl);
        this.introContainer.appendChild(this.startButton);
        document.body.appendChild(this.introContainer);
    }

    setupCanvas() {
        this.ctx = this.canvas.getContext("2d");
        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    setupStartButton() {
        this.startButton.addEventListener('click', () => {
            this.startButton.style.display = 'none'; 

            this.typeEffectAdvanced(this.text, this.keySoundSrc, this.pwnedSoundSrc);
        }, { once: true }); 
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    glitchLine() {
        const y = Math.random() * this.canvas.height;
        const height = Math.random() * 5 + 1;
        const imageData = this.ctx.getImageData(0, y, this.canvas.width, height);
        const dx = Math.random() * 40 - 20;
        this.ctx.putImageData(imageData, dx, y);
    }

    drawStatic() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
            data[i + 3] = Math.random() < 0.05 ? 255 : 0;
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawStatic();
        for (let i = 0; i < 5; i++) this.glitchLine();

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    typeEffectAdvanced(text, keySoundSrc, pwnedSoundSrc) {
        this.typingEl.innerHTML = "";
        this.typingEl.style.display = 'block';

        let i = 0;
        let audioContext;
        let keyBuffer;
        let pwnedBuffer;

        const initAudio = async () => {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (keySoundSrc) {
                    const response = await fetch(keySoundSrc);
                    const arrayBuffer = await response.arrayBuffer();
                    keyBuffer = await audioContext.decodeAudioData(arrayBuffer);
                }
                if (pwnedSoundSrc) {
                    const response = await fetch(pwnedSoundSrc);
                    const arrayBuffer = await response.arrayBuffer();
                    pwnedBuffer = await audioContext.decodeAudioData(arrayBuffer);
                }
            } catch (e) {
                console.error("Web Audio API failed to initialize.", e);
            }
        };

        const playSound = (buffer, volume) => {
            if (!audioContext || !buffer) return;
            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();
            source.buffer = buffer;
            gainNode.gain.value = volume;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start();
        };

        initAudio().then(() => {
            const interval = setInterval(() => {
                if (i < text.length) {
                    this.typingEl.innerHTML += text[i];
                    playSound(keyBuffer, 0.4);
                    i++;
                } else {
                    clearInterval(interval);
                    playSound(pwnedBuffer, 0.6);

                    setTimeout(() => this.endIntro(), 2000);
                }
            }, 100);
        });
    }

    endIntro() {

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        this.introContainer.style.opacity = '0';

        this.introContainer.addEventListener('transitionend', () => {
            this.introContainer.remove();
        });

        if (this.mainContentEl) {
            this.mainContentEl.style.display = 'block';
        }
    }
}