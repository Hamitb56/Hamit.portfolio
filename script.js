// --- ELEMAN TANIMLAMALARI ---
const armVideo = document.getElementById('myVideo');
const canvas = document.getElementById('roverCanvas');
const roverVideo = document.getElementById('roverVideo');
const roverReverseVideo = document.getElementById('roverReverseVideo'); 
const tabletReverseVideo = document.getElementById('tabletReverseVideo');
const placeholder = document.getElementById('videoPlaceholder');
const context = canvas.getContext('2d');
const armBtn = document.getElementById('playBtn');
const knowledgeBtn = document.getElementById('knowledgeBtn');
const knowledgePanel = document.getElementById('knowledgePanel');
const closePanel = document.getElementById('closePanel');
const body = document.body;

// --- ROVER GÖRSEL DİZİSİ AYARLARI ---
const frameCount = 25;
const currentFrame = index => `animations/render_rover_png/${index.toString().padStart(4, '0')}.png`;

const images = [];
for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
}

let targetFrame = 1; 
let currentFrameIdx = 1;
let isAnimating = false;

// --- CANVAS YARDIMCI FONKSİYONLARI ---
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderCanvas(Math.round(currentFrameIdx));
}

function renderCanvas(index) {
    const img = images[index - 1];
    if (!img || !img.complete) return;
    const imgRatio = img.width / img.height;
    const canvasRatio = window.innerWidth / window.innerHeight;
    let dW, dH, dX, dY;
    if (canvasRatio > imgRatio) {
        dW = window.innerWidth; dH = window.innerWidth / imgRatio;
        dX = 0; dY = (window.innerHeight - dH) / 2;
    } else {
        dW = window.innerHeight * imgRatio; dH = window.innerHeight;
        dX = (window.innerWidth - dW) / 2; dY = 0;
    }
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.drawImage(img, dX, dY, dW, dH);
}

function updateCanvasSmoothly() {
    const diff = targetFrame - currentFrameIdx;
    if (Math.abs(diff) > 0.05) {
        currentFrameIdx += diff * 0.15;
        renderCanvas(Math.round(currentFrameIdx));
        requestAnimationFrame(updateCanvasSmoothly);
        isAnimating = true;
    } else {
        currentFrameIdx = targetFrame;
        renderCanvas(targetFrame);
        isAnimating = false;
    }
}

// --- NAVİGASYON ---
function goToProjects() {
    body.classList.remove('no-scroll');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToKnowledge() {
    const windowHeight = window.innerHeight;
    body.classList.remove('no-scroll');
    window.scrollTo({ top: windowHeight * 1.8, behavior: 'smooth' });
}

function goToConnect() {
    body.classList.remove('no-scroll');
    const connectSection = document.getElementById('connect');
    if (connectSection) connectSection.scrollIntoView({ behavior: 'smooth' });
}

// --- SCROLL EVENT ---
window.addEventListener('scroll', () => {
    if (body.classList.contains('no-scroll')) return;
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const animationEnd = windowHeight * 2.0; 
    const scrollFraction = Math.min(1, scrollTop / animationEnd);

    targetFrame = Math.max(1, Math.min(frameCount, Math.ceil(scrollFraction * frameCount)));
    if (!isAnimating) updateCanvasSmoothly();

    if (scrollTop > 50) {
        canvas.style.opacity = "1";
        canvas.style.zIndex = "5";
        armVideo.style.opacity = "0";
    } else {
        canvas.style.opacity = "0";
        canvas.style.zIndex = "1";
        armVideo.style.opacity = "1";
    }

    armBtn.style.top = (50 - (scrollFraction * 80)) + "%";
    armBtn.style.opacity = Math.max(0, 1 - (scrollFraction * 3));
    armBtn.classList.toggle('btn-disabled', scrollTop !== 0);

    let knowledgeBtnPos;
    if (scrollFraction < 0.9) {
        knowledgeBtnPos = 130 - (scrollFraction * 85); 
        knowledgeBtn.style.opacity = Math.min(0.4, scrollFraction * 0.8); 
        knowledgeBtn.classList.add('btn-disabled');
    } else if (scrollFraction >= 0.9 && scrollTop <= animationEnd) {
        knowledgeBtnPos = 50; 
        knowledgeBtn.style.opacity = "1";
        knowledgeBtn.classList.remove('btn-disabled');
    } else {
        const exitScroll = (scrollTop - animationEnd) / windowHeight; 
        knowledgeBtnPos = 50 - (exitScroll * 120); 
        knowledgeBtn.style.opacity = Math.max(0, 1 - (exitScroll * 1.5));
    }
    knowledgeBtn.style.top = knowledgeBtnPos + "%";
});

// --- PROJECTS BUTONU TIKLAMA (DÜZENLENMİŞ) ---
armBtn.addEventListener('click', () => {
    if (window.scrollY > 100) { goToProjects(); return; }
    
    armBtn.disabled = true;
    body.classList.add('no-scroll');

    // 1. DİĞER HER ŞEYİ GİZLE (Çakışmayı önlemek için)
    if (placeholder) placeholder.style.opacity = "0";
    canvas.style.opacity = "0";
    canvas.style.zIndex = "1";

    // 2. VİDEOYU EN ÖNE ÇIKAR VE HAZIRLA
    armVideo.style.display = "block"; // Gizli kalmış olma ihtimaline karşı
    armVideo.style.opacity = "1";
    armVideo.style.zIndex = "9999"; 
    armVideo.currentTime = 0;

    // 3. OYNATMAYI DENE
    const startPlay = () => {
        armVideo.play().then(() => {
            console.log("Video başladı.");
            
            const vidDuration = armVideo.duration > 0 ? armVideo.duration : 2.5;

            

            // Yönlendirme
            armVideo.onended = () => {
                window.location.href = 'projects/index.html';
            };
        }).catch(err => {
            console.warn("Oynatma hatası:", err);
            window.location.href = 'projects/index.html';
        });
    };

    // Video verisi hazırsa oynat, değilse yüklenince oynat
    if (armVideo.readyState >= 3) {
        startPlay();
    } else {
        armVideo.load();
        armVideo.oncanplay = startPlay;
    }
});

// --- KNOWLEDGE BUTONU TIKLAMA ---
knowledgeBtn.addEventListener('click', () => {
    goToKnowledge();
    knowledgeBtn.disabled = true;
    setTimeout(() => {
        body.classList.add('no-scroll');
        canvas.style.opacity = "0"; 
        roverVideo.style.opacity = "1";
        roverVideo.style.zIndex = "50";
        roverVideo.currentTime = 0; 
        roverVideo.play();

        const checkTime = setInterval(() => {
            if (roverVideo.currentTime > roverVideo.duration - 0.6) {
                knowledgePanel.classList.add('active');
                clearInterval(checkTime);
            }
        }, 100); 
    }, 600); 
});

// --- PANEL KAPATMA ---
closePanel.addEventListener('click', () => {
    knowledgePanel.classList.remove('active');
    roverVideo.style.opacity = "0";
    roverVideo.pause();
    roverReverseVideo.style.opacity = "1";
    roverReverseVideo.style.zIndex = "50";
    roverReverseVideo.currentTime = 0;
    roverReverseVideo.playbackRate = 2.0; 
    roverReverseVideo.play();
    roverReverseVideo.onended = () => {
        roverReverseVideo.style.opacity = "0";
        canvas.style.opacity = "1";
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const scrollFraction = Math.min(1, scrollTop / (windowHeight * 2.0));
        targetFrame = Math.max(1, Math.min(frameCount, Math.ceil(scrollFraction * frameCount)));
        currentFrameIdx = targetFrame;
        renderCanvas(targetFrame);
        setTimeout(() => {
            body.classList.remove('no-scroll'); 
            knowledgeBtn.disabled = false;
            knowledgeBtn.classList.remove('btn-disabled');
        }, 300);
    };
});

// --- SAYFA YÜKLENME VE GERİ DÖNÜŞ MANTIĞI ---
// --- SAYFA YÜKLENME VE GERİ DÖNÜŞ MANTIĞI (Flicker Fix) ---
window.addEventListener('load', () => {
    resizeCanvas();
    const comingBack = sessionStorage.getItem('returnFromProjects');

    // Başlangıç durumu: Zoom kapalı, video başa sarılı
    armVideo.style.transform = "scale(1)";
    armVideo.style.transition = "none";
    armVideo.currentTime = 0;

    if (comingBack === 'true') {
        sessionStorage.removeItem('returnFromProjects');
        window.scrollTo(0, 0);
        body.classList.add('no-scroll');

        // Geri dönüşte tableti olan kareyi göster (Başlangıç noktası)
        if (placeholder) {
            placeholder.style.backgroundImage = "url('animations/render_2_png/0120.png')";
            placeholder.style.opacity = "1";
            placeholder.style.zIndex = "200"; // En üstte başlasın
        }
        
        armVideo.style.opacity = "0";
        tabletReverseVideo.style.opacity = "1";
        tabletReverseVideo.style.zIndex = "300";
        tabletReverseVideo.currentTime = 0;
        
        const startReverse = () => { tabletReverseVideo.play().catch(() => {}); };
        if (tabletReverseVideo.readyState >= 3) startReverse();
        else tabletReverseVideo.oncanplay = startReverse;

        const checkEnd = setInterval(() => {
            // Video bitimine 0.1 saniye kala geçişi hazırla
            if (tabletReverseVideo.currentTime >= (tabletReverseVideo.duration - 0.1)) {
                clearInterval(checkEnd);
                
                // 1. Videoları ve placeholder'ı anında sıfırla
                tabletReverseVideo.pause();
                tabletReverseVideo.style.opacity = "0";
                
                if (placeholder) {
                    placeholder.style.opacity = "0";
                    placeholder.style.zIndex = "-1"; // Arkaya at ki görünmesin
                }

                // 2. Ana videoyu (kolun boş hali) göster
                armVideo.currentTime = 0;
                armVideo.style.opacity = "1";
                armVideo.style.zIndex = "1";

                // 3. Kullanıcıya kontrolü ver
                setTimeout(() => {
                    body.classList.remove('no-scroll');
                    armBtn.disabled = false;
                    armBtn.style.opacity = "1";
                    console.log("Geri dönüş tamamlandı, tertemiz başlangıç.");
                }, 50);
            }
        }, 10); 
    } else {
        // Normal ilk giriş
        const initMain = () => {
            armVideo.currentTime = 0;
            armVideo.style.opacity = "1";
            if (placeholder) {
                placeholder.style.opacity = "0";
                placeholder.style.zIndex = "-1";
            }
        };
        if (armVideo.readyState >= 3) initMain();
        else armVideo.oncanplay = initMain;
    }
});

// --- PENCERE BOYUTU DEĞİŞİMİ ---
window.addEventListener('resize', resizeCanvas);