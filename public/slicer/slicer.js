// Global variables
let scene, camera, renderer, mesh, controls, originalGeometry;
let currentSliceResult = null;

// Material pricing (INR per kg)
const MATERIAL_COSTS = {
    PLA: 160,
    ABS: 200,
    PETG: 180,
    TPU: 280
};

// Material densities (g/cm³)
const DENSITIES = {
    PLA: 1.24,
    ABS: 1.04,
    PETG: 1.27,
    TPU: 1.21
};

//Promo codes
const PROMO_CODES = {
    'SAVE10': 0.10,
    'SAVE20': 0.20,
    'PLA15': 0.15,
    'FIRST20': 0.20
};

// Initialize 3D scene
function initScene() {
    const canvas = document.getElementById('preview');
    const container = document.getElementById('preview-container');
    const width = container.clientWidth - 40;
    const height = 600;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(100, 100, 150);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(50, 100, 50);
    light.castShadow = true;
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambient);

    // Grid
    const gridHelper = new THREE.GridHelper(200, 20, 0x334155, 0x1e293b);
    scene.add(gridHelper);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// STL Upload Handler
document.getElementById('stlFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const loader = new THREE.STLLoader();
    const reader = new FileReader();

    reader.onload = function (event) {
        const geometry = loader.parse(event.target.result);

        // Center geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Remove old mesh
        if (mesh) scene.remove(mesh);

        // Create new mesh
        const selectedColor = document.getElementById('color').value;
        const material = new THREE.MeshPhongMaterial({
            color: selectedColor,
            shininess: 30,
            specular: 0x444444
        });

        mesh = new THREE.Mesh(geometry, material);
        originalGeometry = geometry.clone();
        scene.add(mesh);

        // Display info
        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        document.getElementById('dimensions').textContent =
            `Size: ${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} mm`;
        document.getElementById('model-info').classList.remove('hidden');

        // Enable quote button
        document.getElementById('quoteBtn').disabled = false;

        // Fit camera
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
        camera.lookAt(0, 0, 0);

        showStatus('✅ STL file loaded successfully!', 'success');
    };

    reader.readAsArrayBuffer(file);
});

// Color change handler
document.getElementById('color').addEventListener('change', function () {
    if (mesh) {
        mesh.material.color.set(this.value);
    }
});

// Scale slider
document.getElementById('scale').addEventListener('input', function () {
    document.getElementById('scaleValue').textContent = this.value + '%';
    if (mesh && originalGeometry) {
        const scale = parseFloat(this.value) / 100;
        mesh.geometry.dispose();
        mesh.geometry = originalGeometry.clone();
        mesh.geometry.scale(scale, scale, scale);

        // Update dimensions
        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        document.getElementById('dimensions').textContent =
            `Size: ${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} mm`;
    }
});

// Infill slider
document.getElementById('infill').addEventListener('input', function () {
    document.getElementById('infillValue').textContent = this.value + '%';
});

// Slicing & Quote Generation
window.sliceAndQuote = function () {
    if (!mesh) {
        showStatus('⚠️ Please upload an STL file first!', 'error');
        return;
    }

    showStatus('🔄 Calculating volume and generating quote...', 'info');

    const scale = parseFloat(document.getElementById('scale').value) / 100;
    const material = document.getElementById('material').value;
    const infill = parseFloat(document.getElementById('infill').value);
    const promo = document.getElementById('promo').value.toUpperCase();

    // Calculate volume using signed tetrahedron method
    const geometry = mesh.geometry;
    let volume = 0;

    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 3) {
        const v1 = new THREE.Vector3().fromBufferAttribute(position, i);
        const v2 = new THREE.Vector3().fromBufferAttribute(position, i + 1);
        const v3 = new THREE.Vector3().fromBufferAttribute(position, i + 2);

        // Signed tetrahedron volume
        volume += v1.dot(v2.clone().cross(v3)) / 6;
    }

    volume = Math.abs(volume) / 1000; // Convert to cm³

    // Calculate weight with infill
    const shellVolume = volume * 0.25; // 25% shell
    const infillVolume = volume * 0.75 * (infill / 100); // 75% interior with infill%
    const totalVolume = shellVolume + infillVolume;
    const weight = totalVolume * DENSITIES[material];

    // Material cost
    let materialCost = (weight / 1000) * MATERIAL_COSTS[material];

    // Print time estimate (simple heuristic: 1g ≈ 3 minutes)
    const printTime = (weight * 3) / 60; // hours

    // Machine cost (₹50/hour)
    const machineCost = printTime * 50;

    // Total before promo
    let cost = materialCost + machineCost;

    // Apply promo code
    let discount = 0;
    if (PROMO_CODES[promo]) {
        discount = cost * PROMO_CODES[promo];
        cost -= discount;
    }

    // Display quote
    const quoteHTML = `
        <h3>💰 Print Quote</h3>
        <table>
            <tr><td><strong>Material:</strong></td><td>${material}</td></tr>
            <tr><td><strong>Weight:</strong></td><td>${weight.toFixed(1)}g</td></tr>
            <tr><td><strong>Volume:</strong></td><td>${volume.toFixed(2)} cm³</td></tr>
            <tr><td><strong>Infill:</strong></td><td>${infill}%</td></tr>
            <tr><td><strong>Scale:</strong></td><td>${(scale * 100).toFixed(0)}%</td></tr>
            <tr><td><strong>Print Time:</strong></td><td>~${printTime.toFixed(1)} hrs</td></tr>
            <tr><td><strong>Material Cost:</strong></td><td>₹${materialCost.toFixed(2)}</td></tr>
            <tr><td><strong>Machine Time:</strong></td><td>₹${machineCost.toFixed(2)}</td></tr>
            ${promo && PROMO_CODES[promo] ? `<tr><td><strong>Promo (${promo}):</strong></td><td>-₹${discount.toFixed(2)}</td></tr>` : ''}
            <tr class="total"><td><strong>Total Cost:</strong></td><td>₹${cost.toFixed(2)}</td></tr>
        </table>
    `;

    document.getElementById('quote').innerHTML = quoteHTML;
    document.getElementById('quote').classList.remove('hidden');
    document.getElementById('sendBtn').classList.remove('hidden');
    document.getElementById('downloadBtn').classList.remove('hidden');

    // Store for later
    currentSliceResult = {
        weight: weight.toFixed(1),
        volume: volume.toFixed(2),
        material,
        infill,
        scale: (scale * 100).toFixed(0),
        cost: cost.toFixed(2),
        printTime: printTime.toFixed(1),
        promo: promo || 'None'
    };

    showStatus('✅ Quote generated successfully!', 'success');
};

// Send to printer queue
window.sendToPrinter = async function () {
    const email = document.getElementById('userEmail').value;
    if (!email || !email.includes('@')) {
        showStatus('⚠️ Please enter a valid email address!', 'error');
        return;
    }

    if (!currentSliceResult) {
        showStatus('⚠️ Please generate a quote first!', 'error');
        return;
    }

    showStatus('📤 Sending to print queue...', 'info');

    const stlFile = document.getElementById('stlFile').files[0];
    const formData = new FormData();
    formData.append('email', email);
    formData.append('quote', JSON.stringify(currentSliceResult));
    formData.append('stl', stlFile);

    try {
        const response = await fetch('http://localhost:3001/api/receive-print-job', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showStatus(`✅ Job #${result.jobId} sent to queue! Check your email for confirmation.`, 'success');

            // Clear form
            document.getElementById('stlFile').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('quote').classList.add('hidden');
            document.getElementById('sendBtn').classList.add('hidden');
            document.getElementById('downloadBtn').classList.add('hidden');
        } else {
            showStatus('❌ Failed to send job: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (e) {
        showStatus('❌ Cannot connect to print queue server. Make sure it\'s running on port 3001.', 'error');
        console.error('Error:', e);
    }
};

// Download G-code placeholder
window.downloadGCODE = function () {
    if (!currentSliceResult) {
        showStatus('⚠️ Please generate a quote first!', 'error');
        return;
    }

    const gcode = `; VAELINSA G-code Export
; Generated: ${new Date().toISOString()}
; Material: ${currentSliceResult.material}
; Weight: ${currentSliceResult.weight}g
; Infill: ${currentSliceResult.infill}%
; Scale: ${currentSliceResult.scale}%
; Estimated Time: ${currentSliceResult.printTime} hours

; Start G-code
G28 ; Home all axes
G1 Z5 F5000 ; Lift nozzle
M104 S200 ; Set hotend temp
M140 S60 ; Set bed temp
M190 S60 ; Wait for bed
M109 S200 ; Wait for hotend

; NOTE: This is a placeholder G-code
; Actual slicing would require full slicer integration
; For production use, integrate with Cura Engine or PrusaSlicer

; End G-code
M104 S0 ; Turn off hotend
M140 S0 ; Turn off bed
M84 ; Disable motors
`;

    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaelinsa_print_${Date.now()}.gcode`;
    a.click();
    URL.revokeObjectURL(url);

    showStatus('✅ G-code downloaded!', 'success');
};

// Status display helper
function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + type;
    status.classList.remove('hidden');

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            status.classList.add('hidden');
        }, 5000);
    }
}

// Initialize on load
window.addEventListener('load', () => {
    initScene();
    console.log('VAELINSA Slicer initialized');
});
