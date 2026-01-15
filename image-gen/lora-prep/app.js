/**
 * LoRA Training Image Prep Tool
 * Crop, resize, and caption images for LoRA training
 */

// ========================================
// State Management
// ========================================
const state = {
    images: [], // Array of { id, file, dataUrl, caption, cropData }
    selectedIndex: -1,
    thumbnailSize: 100,
    targetResolution: 1024,
    captionFormat: 'individual',
    zoom: 1,
    cropBox: { x: 0, y: 0, size: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    imageDisplayInfo: null // Stores rendered image position/size in canvas
};

// ========================================
// DOM References
// ========================================
const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    filmstripScroll: document.getElementById('filmstripScroll'),
    imageCount: document.getElementById('imageCount'),
    cropEditor: document.getElementById('cropEditor'),
    cropCanvas: document.getElementById('cropCanvas'),
    cropBox: document.getElementById('cropBox'),
    cropContainer: document.getElementById('cropContainer'),
    zoomIn: document.getElementById('zoomIn'),
    zoomOut: document.getElementById('zoomOut'),
    zoomLabel: document.getElementById('zoomLabel'),
    cropSize: document.getElementById('cropSize'),
    captionInput: document.getElementById('captionInput'),
    thumbnailSlider: document.getElementById('thumbnailSlider'),
    targetModel: document.getElementById('targetModel'),
    captionFormat: document.getElementById('captionFormat'),
    exportBtn: document.getElementById('exportBtn'),
    exportModal: document.getElementById('exportModal'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText')
};

// ========================================
// Initialization
// ========================================
function init() {
    setupEventListeners();
    updateUIState();
}

function setupEventListeners() {
    // Drop zone events
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Also allow dropping on the whole editor area when images exist
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('drop', handleGlobalDrop);

    // Crop controls
    elements.zoomIn.addEventListener('click', () => adjustZoom(0.1));
    elements.zoomOut.addEventListener('click', () => adjustZoom(-0.1));
    elements.cropContainer.addEventListener('wheel', handleWheel, { passive: false });

    // Crop box dragging
    elements.cropBox.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);

    // Caption input
    elements.captionInput.addEventListener('input', handleCaptionChange);

    // Settings
    elements.thumbnailSlider.addEventListener('input', handleThumbnailResize);
    elements.targetModel.addEventListener('change', handleModelChange);
    elements.captionFormat.addEventListener('change', handleCaptionFormatChange);

    // Export
    elements.exportBtn.addEventListener('click', handleExport);

    // Window resize
    window.addEventListener('resize', debounce(() => {
        if (state.selectedIndex >= 0) {
            renderCropEditor();
        }
    }, 100));
}

// ========================================
// File Handling
// ========================================
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.classList.remove('drag-over');
}

function handleGlobalDragOver(e) {
    if (state.images.length > 0) {
        e.preventDefault();
    }
}

function handleGlobalDrop(e) {
    if (state.images.length > 0 && e.target !== elements.dropZone) {
        e.preventDefault();
        const files = getFilesFromDataTransfer(e.dataTransfer);
        if (files.length > 0) {
            processFiles(files);
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.classList.remove('drag-over');

    const files = getFilesFromDataTransfer(e.dataTransfer);
    if (files.length > 0) {
        processFiles(files);
    }
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        processFiles(files);
    }
    // Reset input so same files can be selected again
    e.target.value = '';
}

function getFilesFromDataTransfer(dataTransfer) {
    const files = [];
    if (dataTransfer.items) {
        for (const item of dataTransfer.items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }
    } else {
        files.push(...dataTransfer.files);
    }
    return files;
}

async function processFiles(files) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const textFiles = files.filter(f => f.name.endsWith('.txt'));

    // Create a map of caption files by base name
    const captionMap = new Map();
    for (const txtFile of textFiles) {
        const baseName = txtFile.name.replace('.txt', '');
        const content = await txtFile.text();
        captionMap.set(baseName, content.trim());
    }

    // Process images
    for (const file of imageFiles) {
        const dataUrl = await readFileAsDataURL(file);
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const existingCaption = captionMap.get(baseName) || '';

        state.images.push({
            id: generateId(),
            file: file,
            dataUrl: dataUrl,
            caption: existingCaption,
            cropData: null // Will be initialized when image is selected
        });
    }

    updateUIState();
    renderFilmstrip();

    // Select first image if none selected
    if (state.selectedIndex < 0 && state.images.length > 0) {
        selectImage(0);
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ========================================
// Filmstrip Rendering
// ========================================
function renderFilmstrip() {
    elements.filmstripScroll.innerHTML = '';

    state.images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'thumbnail-item';
        if (index === state.selectedIndex) item.classList.add('active');
        if (img.caption) item.classList.add('has-caption');

        item.style.width = `${state.thumbnailSize}px`;
        item.style.height = `${state.thumbnailSize}px`;

        item.innerHTML = `
            <img src="${img.dataUrl}" alt="Image ${index + 1}">
            <span class="thumbnail-number">${index + 1}</span>
            <span class="caption-indicator"></span>
        `;

        item.addEventListener('click', () => selectImage(index));
        elements.filmstripScroll.appendChild(item);
    });

    elements.imageCount.textContent = `${state.images.length} image${state.images.length !== 1 ? 's' : ''}`;
}

function handleThumbnailResize(e) {
    state.thumbnailSize = parseInt(e.target.value);
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.style.width = `${state.thumbnailSize}px`;
        item.style.height = `${state.thumbnailSize}px`;
    });

    // Update filmstrip width based on thumbnail size
    const filmstrip = document.getElementById('filmstrip');
    filmstrip.style.width = `${state.thumbnailSize + 24}px`;
    filmstrip.style.minWidth = `${state.thumbnailSize + 24}px`;
}

// ========================================
// Image Selection & Crop Editor
// ========================================
function selectImage(index) {
    if (index < 0 || index >= state.images.length) return;

    // Save current caption before switching
    if (state.selectedIndex >= 0 && state.selectedIndex < state.images.length) {
        state.images[state.selectedIndex].caption = elements.captionInput.value;
    }

    state.selectedIndex = index;

    // Update filmstrip selection
    document.querySelectorAll('.thumbnail-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // Show crop editor
    elements.dropZone.classList.add('hidden');
    elements.cropEditor.classList.remove('hidden');

    // Load caption
    elements.captionInput.value = state.images[index].caption || '';

    // Reset zoom and render
    state.zoom = 1;
    renderCropEditor();
}

function renderCropEditor() {
    const img = state.images[state.selectedIndex];
    if (!img) return;

    const canvas = elements.cropCanvas;
    const ctx = canvas.getContext('2d');
    const container = elements.cropContainer;

    // Load image
    const image = new Image();
    image.onload = () => {
        // Calculate display size to fit container
        const containerRect = container.getBoundingClientRect();
        const padding = 40;
        const maxWidth = containerRect.width - padding * 2;
        const maxHeight = containerRect.height - padding * 2;

        let displayWidth = image.width * state.zoom;
        let displayHeight = image.height * state.zoom;

        // Scale to fit container
        const scale = Math.min(maxWidth / displayWidth, maxHeight / displayHeight, 1);
        displayWidth *= scale;
        displayHeight *= scale;

        // Set canvas size
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // Draw image
        ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

        // Store display info for crop calculations
        state.imageDisplayInfo = {
            width: displayWidth,
            height: displayHeight,
            naturalWidth: image.width,
            naturalHeight: image.height,
            scale: displayWidth / image.width
        };

        // Initialize or restore crop box
        initializeCropBox(img);
        updateCropBoxDisplay();
    };
    image.src = img.dataUrl;
}

function initializeCropBox(img) {
    const info = state.imageDisplayInfo;
    if (!info) return;

    if (img.cropData) {
        // Restore saved crop position (stored in natural image coordinates)
        state.cropBox = {
            x: img.cropData.x * info.scale,
            y: img.cropData.y * info.scale,
            size: img.cropData.size * info.scale
        };
    } else {
        // Initialize centered crop box
        const minDim = Math.min(info.width, info.height);
        const cropSize = minDim * 0.8;

        state.cropBox = {
            x: (info.width - cropSize) / 2,
            y: (info.height - cropSize) / 2,
            size: cropSize
        };

        // Save initial crop data
        saveCropData();
    }

    updateCropSizeLabel();
}

function updateCropBoxDisplay() {
    const canvas = elements.cropCanvas;
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = elements.cropContainer.getBoundingClientRect();

    // Calculate offset of canvas within container
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;

    // Position crop box
    elements.cropBox.style.left = `${offsetX + state.cropBox.x}px`;
    elements.cropBox.style.top = `${offsetY + state.cropBox.y}px`;
    elements.cropBox.style.width = `${state.cropBox.size}px`;
    elements.cropBox.style.height = `${state.cropBox.size}px`;
}

function updateCropSizeLabel() {
    const info = state.imageDisplayInfo;
    if (!info) return;

    // Calculate actual crop size in source pixels
    const actualSize = Math.round(state.cropBox.size / info.scale);
    elements.cropSize.textContent = `${actualSize} × ${actualSize} → ${state.targetResolution}×${state.targetResolution}`;
}

function saveCropData() {
    if (state.selectedIndex < 0 || !state.imageDisplayInfo) return;

    const info = state.imageDisplayInfo;
    state.images[state.selectedIndex].cropData = {
        x: state.cropBox.x / info.scale,
        y: state.cropBox.y / info.scale,
        size: state.cropBox.size / info.scale
    };
}

// ========================================
// Crop Box Interaction
// ========================================
function startDrag(e) {
    e.preventDefault();
    state.isDragging = true;
    state.dragStart = {
        x: e.clientX - state.cropBox.x,
        y: e.clientY - state.cropBox.y
    };
    elements.cropBox.style.cursor = 'grabbing';
}

function handleDrag(e) {
    if (!state.isDragging || !state.imageDisplayInfo) return;

    const info = state.imageDisplayInfo;
    let newX = e.clientX - state.dragStart.x;
    let newY = e.clientY - state.dragStart.y;

    // Constrain to image bounds
    newX = Math.max(0, Math.min(newX, info.width - state.cropBox.size));
    newY = Math.max(0, Math.min(newY, info.height - state.cropBox.size));

    state.cropBox.x = newX;
    state.cropBox.y = newY;

    updateCropBoxDisplay();
    saveCropData();
}

function endDrag() {
    state.isDragging = false;
    elements.cropBox.style.cursor = 'move';
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    adjustCropSize(delta);
}

function adjustZoom(delta) {
    state.zoom = Math.max(0.5, Math.min(3, state.zoom + delta));
    elements.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
    renderCropEditor();
}

function adjustCropSize(delta) {
    if (!state.imageDisplayInfo) return;

    const info = state.imageDisplayInfo;
    const minSize = 50;
    const maxSize = Math.min(info.width, info.height);

    // Calculate new size
    const oldSize = state.cropBox.size;
    const newSize = Math.max(minSize, Math.min(maxSize, oldSize + oldSize * delta));

    // Adjust position to keep crop box centered during resize
    const sizeDiff = newSize - oldSize;
    let newX = state.cropBox.x - sizeDiff / 2;
    let newY = state.cropBox.y - sizeDiff / 2;

    // Constrain to bounds
    newX = Math.max(0, Math.min(newX, info.width - newSize));
    newY = Math.max(0, Math.min(newY, info.height - newSize));

    state.cropBox.x = newX;
    state.cropBox.y = newY;
    state.cropBox.size = newSize;

    updateCropBoxDisplay();
    updateCropSizeLabel();
    saveCropData();
}

// ========================================
// Caption Handling
// ========================================
function handleCaptionChange(e) {
    if (state.selectedIndex >= 0) {
        state.images[state.selectedIndex].caption = e.target.value;

        // Update thumbnail indicator
        const thumbnail = elements.filmstripScroll.children[state.selectedIndex];
        if (thumbnail) {
            thumbnail.classList.toggle('has-caption', e.target.value.trim().length > 0);
        }
    }
}

// ========================================
// Settings Handlers
// ========================================
function handleModelChange(e) {
    state.targetResolution = parseInt(e.target.value);
    updateCropSizeLabel();
}

function handleCaptionFormatChange(e) {
    state.captionFormat = e.target.value;
}

// ========================================
// Export Functionality
// ========================================
async function handleExport() {
    if (state.images.length === 0) return;

    // Save current caption
    if (state.selectedIndex >= 0) {
        state.images[state.selectedIndex].caption = elements.captionInput.value;
    }

    // Show modal
    elements.exportModal.classList.remove('hidden');
    elements.progressFill.style.width = '0%';
    elements.progressText.textContent = 'Preparing export...';

    try {
        const zip = new JSZip();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        let allCaptions = [];

        for (let i = 0; i < state.images.length; i++) {
            const img = state.images[i];
            const progress = ((i + 1) / state.images.length) * 100;
            elements.progressFill.style.width = `${progress}%`;
            elements.progressText.textContent = `Processing image ${i + 1} of ${state.images.length}...`;

            // Process image
            const processedBlob = await processImageForExport(img);
            const filename = `${String(i + 1).padStart(3, '0')}_${dateStr}.png`;
            zip.file(filename, processedBlob);

            // Handle caption
            if (img.caption && img.caption.trim()) {
                if (state.captionFormat === 'individual') {
                    const captionFilename = filename.replace('.png', '.txt');
                    zip.file(captionFilename, img.caption.trim());
                } else {
                    allCaptions.push(`${filename}: ${img.caption.trim()}`);
                }
            }

            // Small delay to allow UI update
            await new Promise(r => setTimeout(r, 10));
        }

        // Add single captions file if needed
        if (state.captionFormat === 'single' && allCaptions.length > 0) {
            zip.file('captions.txt', allCaptions.join('\n'));
        }

        elements.progressText.textContent = 'Creating ZIP file...';

        // Generate and download ZIP
        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lora_training_${dateStr}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        elements.progressText.textContent = 'Export complete!';
        setTimeout(() => {
            elements.exportModal.classList.add('hidden');
        }, 1500);

    } catch (error) {
        console.error('Export failed:', error);
        elements.progressText.textContent = `Export failed: ${error.message}`;
        setTimeout(() => {
            elements.exportModal.classList.add('hidden');
        }, 3000);
    }
}

async function processImageForExport(img) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set output size
            canvas.width = state.targetResolution;
            canvas.height = state.targetResolution;

            // Get crop data (in natural image coordinates)
            const crop = img.cropData || {
                x: 0,
                y: 0,
                size: Math.min(image.width, image.height)
            };

            // Draw cropped and resized image
            ctx.drawImage(
                image,
                crop.x, crop.y, crop.size, crop.size,
                0, 0, state.targetResolution, state.targetResolution
            );

            // Convert to blob
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create image blob'));
                }
            }, 'image/png');
        };
        image.onerror = () => reject(new Error('Failed to load image'));
        image.src = img.dataUrl;
    });
}

// ========================================
// UI State Management
// ========================================
function updateUIState() {
    const hasImages = state.images.length > 0;
    elements.exportBtn.disabled = !hasImages;

    if (!hasImages) {
        elements.dropZone.classList.remove('hidden');
        elements.cropEditor.classList.add('hidden');
        state.selectedIndex = -1;
    }
}

// ========================================
// Utility Functions
// ========================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', init);
