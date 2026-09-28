const inputFoto = document.getElementById('upload-foto');
const areaBingkai = document.getElementById('area-bingkai');
const photoViewport = document.getElementById('photo-viewport');
const userPhotoImg = document.getElementById('user-photo-img');
const framePreviewImg = document.getElementById('frame-preview-img');
const zoomContainer = document.getElementById('zoom-container');
const zoomSlider = document.getElementById('zoom-slider');
const btnUnduhLangsung = document.getElementById('btn-unduh-langsung');
const btnGantiFoto = document.getElementById('btn-ganti-foto');
const containerGantiFoto = document.getElementById('container-ganti-foto');
const captionContainer = document.getElementById('caption-container');
const captionText = document.getElementById('caption-text');
const btnSalinCaption = document.getElementById('btn-salin-caption');
const templateCaption = 
    "Petualangan baru telah menanti!\n\n" +
    "Di alam bebas kita belajar tentang kebersamaan, kemandirian, dan solidaritas.\n\n" +
    "Halo semuanya! Saya [Nama] dari D4 Teknik Informatika Universitas Harkat Negeri, menyatakan bahwa saya SIAP untuk ikut serta dan memeriahkan acara FUNCAMP!\n\n" +
    "Bagi saya, Funcamp bukan hanya sekadar tentang mendirikan tenda dan menyalakan api unggun. Ini adalah momen berharga untuk mempererat tali persaudaraan, melepaskan penat sejenak, dan menciptakan kenangan tak terlupakan bersama teman-teman seperjuangan.\n" +
    "Saya tidak sabar untuk berbagi tawa, cerita, dan pengalaman baru di tengah keindahan alam.\n\n" +
    "Mari kita sukseskan acara ini, jaga kelestarian alam, dan buat cerita seru bersama!\n\n" +
    "Are you ready for the fun?\n" +
    "Because I AM READY FOR FUNCAMP! 🔥🔥\n\n" +
    "Jangan lupa ikuti terus keseruan kami melalui:\n" +
    "📸 Instagram: @himativ.harkatnegeri\n" +
    "✉️ Email: hmpinformatika@gmail.com\n" +
    "▶️ YouTube: HIMATIV UHN\n\n" +
    "#IReadyForFuncamp #Funcamp2026 #TeknikInformatika #UniversitasHarkatNegeri";
const inputNama = document.getElementById('input-nama');
const boxCaption = document.getElementById('box-caption');
const btnSalin = document.getElementById('btn-salin');

let fotoUploaded = false;
let currentX = 0;
let currentY = 0;
let baseScale = 1;
let currentZoom = 1;

let isDragging = false;
let startX = 0;
let startY = 0;

// Klik area bingkai untuk pilih foto
areaBingkai.addEventListener('click', () => {
    if (!fotoUploaded) {
        inputFoto.click();
    }
});

// Pilih Foto
inputFoto.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            userPhotoImg.src = event.target.result;
            userPhotoImg.onload = function() {
                fotoUploaded = true;
                
                // Tampilkan elemen pengatur
                photoViewport.classList.remove('hidden');
                zoomContainer.classList.remove('hidden');
                containerGantiFoto.classList.remove('hidden');
                containerGantiFoto.classList.add('flex');
                captionContainer.classList.remove('hidden');

                // HITUNG OTOMATIS SKALA AWAL AGAR PAS DI KOTAK PUTIH
                const vpW = photoViewport.clientWidth;
                const vpH = photoViewport.clientHeight;
                
                const scaleX = vpW / userPhotoImg.naturalWidth;
                const scaleY = vpH / userPhotoImg.naturalHeight;
                // Mengambil nilai max agar foto otomatis menutupi seluruh kotak putih tanpa celah kosong
                baseScale = Math.max(scaleX, scaleY);

                // Reset posisi & zoom
                currentX = 0;
                currentY = 0;
                currentZoom = 1; // Posisi slider 1 berarti pas di kotak putih
                zoomSlider.value = 1;
                updateTransform();

                // Aktifkan tombol unduh
                btnUnduhLangsung.disabled = false;
                btnUnduhLangsung.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
                btnUnduhLangsung.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700', 'cursor-pointer');
                
            }
        }
        reader.readAsDataURL(file);
    }
});

function updateTransform() {
    const finalScale = baseScale * currentZoom;
    // Mengatur lebar & tinggi gambar secara presisi berdasarkan skala
    userPhotoImg.style.width = (userPhotoImg.naturalWidth * finalScale) + 'px';
    userPhotoImg.style.height = (userPhotoImg.naturalHeight * finalScale) + 'px';
    userPhotoImg.style.transform = `translate(${currentX}px, ${currentY}px)`;
}

// Slider Zoom In / Out
zoomSlider.addEventListener('input', function() {
    if (!fotoUploaded) return;
    currentZoom = parseFloat(this.value);
    updateTransform();
});

// Geser (Drag) Foto di dalam kotak
function startDrag(e) {
    if (!fotoUploaded) return;
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;
}

function moveDrag(e) {
    if (!isDragging || !fotoUploaded) return;
    e.preventDefault();

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    currentX += (clientX - startX);
    currentY += (clientY - startY);

    startX = clientX;
    startY = clientY;
    updateTransform();
}

function stopDrag() {
    isDragging = false;
}

areaBingkai.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', moveDrag);
window.addEventListener('mouseup', stopDrag);

areaBingkai.addEventListener('touchstart', startDrag, {passive: false});
window.addEventListener('touchmove', moveDrag, {passive: false});
window.addEventListener('touchend', stopDrag);

// Tombol Ganti Foto
btnGantiFoto.addEventListener('click', function() {
    inputFoto.click();
});

// Tombol Unduh (Menggabungkan Foto & Bingkai ke Canvas dengan presisi penuh)
btnUnduhLangsung.addEventListener('click', function() {
    if (!fotoUploaded) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const frameImg = new Image();
    frameImg.src = framePreviewImg.src;
    
    frameImg.onload = function() {
        canvas.width = frameImg.naturalWidth;
        canvas.height = frameImg.naturalHeight;

        // Background putih bersih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Koordinat area kotak putih pada canvas asli (sesuai persentase CSS viewport)
        const vLeft = canvas.width * 0.09;
        const vTop = canvas.height * 0.25;
        const vWidth = canvas.width * 0.82;
        const vHeight = canvas.height * 0.52;

        ctx.save();
        // Batasi area render agar foto hanya tergambar di dalam kotak putih
        ctx.beginPath();
        ctx.rect(vLeft, vTop, vWidth, vHeight);
        ctx.clip();

        const rect = photoViewport.getBoundingClientRect();
        const ratio = vWidth / rect.width;

        const finalScale = baseScale * currentZoom;
        const drawW = userPhotoImg.naturalWidth * finalScale * ratio;
        const drawH = userPhotoImg.naturalHeight * finalScale * ratio;
        const drawX = vLeft + (vWidth / 2) - (drawW / 2) + (currentX * ratio);
        const drawY = vTop + (vHeight / 2) - (drawH / 2) + (currentY * ratio);

        ctx.drawImage(userPhotoImg, drawX, drawY, drawW, drawH);
        ctx.restore();

        // Timpa dengan bingkai twibbon di lapisan paling atas
        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

        // Proses Download Otomatis
        const link = document.createElement('a');
        link.download = 'Twibbon-TwiMATIV.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
});
// 1. Tampilkan teks ke textarea secara live dengan spasi yang rapi
boxCaption.value = templateCaption;

inputNama.addEventListener('input', function() {
    const nama = inputNama.value.trim();
    if (nama !== "") {
        boxCaption.value = templateCaption.replace("[Nama]", nama);
    } else {
        boxCaption.value = templateCaption;
    }
});

// 2. Tombol Salin dengan format enter yang dijamin rapi
btnSalin.addEventListener('click', function() {
    const nama = inputNama.value.trim();
    const teksFinal = templateCaption.replace("[Nama]", nama !== "" ? nama : "[Nama]");

    navigator.clipboard.writeText(teksFinal).then(() => {
        btnSalin.innerHTML = "Caption Berhasil Disalin!";
        btnSalin.classList.add("text-green-600", "bg-green-50/80");
        
        setTimeout(() => {
            btnSalin.innerHTML = `<svg class="w-5 h-5 mr-2 text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Salin Caption`;
            btnSalin.classList.remove("text-green-600", "bg-green-50/80");
        }, 2000);
    });
});