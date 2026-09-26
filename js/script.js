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