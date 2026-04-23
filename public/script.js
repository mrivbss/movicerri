// script.js – Main interaction logic for MOVICERRI site

// --- Chart (existing) ---
let miGrafico;

const datosRecorridos = {
    'I14': [5, 15, 8, 12, 4, 7],
    'I18': [10, 5, 20, 15, 8, 12],
    'I01': [2, 8, 5, 3, 10, 4]
};

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('graficoEspera');
    if (ctx) {
        miGrafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00'],
                datasets: [{
                    label: 'Minutos de espera',
                    data: datosRecorridos['I14'],
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { ticks: { color: 'white' }, grid: { color: '#333' } },
                    x: { ticks: { color: 'white' } }
                },
                plugins: {
                    legend: { labels: { color: 'white' } }
                }
            }
        });
    }
    // Initialize other modules
    initChatbot();
    cargarReportes();
    cargarSaldos();
    actualizarTarjetaVisual();
    animateCounters();
});

function actualizarGrafico(recorrido, btn) {
    if (!miGrafico) return;
    miGrafico.data.datasets[0].data = datosRecorridos[recorrido] || [];
    document.getElementById('nombreRecorrido').innerText = recorrido;
    miGrafico.update();
    
    if (btn) {
        document.querySelectorAll('.selector-recorrido .btn-micro').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
}

// ------------------------------------------------------------
// Chatbot functionality
// ------------------------------------------------------------
function initChatbot() {
    // No additional init needed; event handlers are inline in HTML.
}

function toggleChatbot() {
    const win = document.getElementById('chatbotWindow');
    if (!win) return;
    win.style.display = win.style.display === 'flex' ? 'none' : 'flex';
}

function sendSuggestion(text) {
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = text;
        sendChat();
    }
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input?.value.trim();
    if (!msg) return;
    appendChatMessage('user', msg);
    input.value = '';
    setTimeout(() => {
        const reply = obtenerRespuestaBot(msg);
        appendChatMessage('bot', reply);
    }, 500);
}

function appendChatMessage(sender, text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerText = text;
    msgDiv.appendChild(bubble);
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function obtenerRespuestaBot(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('cómo funciona')) return 'MOVICERRI utiliza IA para detectar aglomeraciones y avisa a la municipalidad, aumentando la frecuencia de buses.';
    if (lower.includes('recorridos')) return 'Los recorridos principales son I14, I18 e I01, cubriendo las zonas más demandadas de Cerrillos.';
    if (lower.includes('reportar')) return 'Puedes usar el formulario de "Reportes Ciudadanos" para notificar problemas en tiempo real.';
    if (lower.includes('saldo')) return 'Ingresa tu número de tarjeta BIP en la sección de Saldo para consultar tu balance.';
    return '¡Gracias por tu mensaje! Si necesitas ayuda, pregunta sobre el funcionamiento, recorridos, reportes o saldo.';
}

// ------------------------------------------------------------
// Reportes en tiempo real – persistencia con localStorage
// ------------------------------------------------------------
const STORAGE_KEY = 'movicerri_reportes';
let listaReportes = [];

function cargarReportes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try { listaReportes = JSON.parse(raw); } catch (e) { listaReportes = []; }
    }
    renderReportes();
    updateReportCount();
}

function guardarReportes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listaReportes));
    updateReportCount();
}

function enviarReporte(event) {
    event.preventDefault();
    const tipo = document.getElementById('reportType').value;
    const ruta = document.getElementById('reportRoute').value;
    const loc = document.getElementById('reportLocation').value.trim();
    const desc = document.getElementById('reportDesc').value.trim();
    if (!tipo || !ruta || !loc || !desc) {
        alert('Completa todos los campos del reporte.');
        return;
    }
    const reporte = {
        id: Date.now(),
        tipo,
        ruta,
        loc,
        desc,
        fecha: new Date().toISOString()
    };
    listaReportes.unshift(reporte);
    guardarReportes();
    renderReportes();
    document.querySelector('#reportForm form').reset();
}

function renderReportes(filter = 'todos') {
    const container = document.getElementById('reportsList');
    if (!container) return;
    container.innerHTML = '';
    const filtrados = listaReportes.filter(r => filter === 'todos' || r.tipo === filter);
    if (filtrados.length === 0) {
        container.innerHTML = '<div class="empty-reports"><i class="fas fa-inbox"></i><p>No hay reportes aún.</p></div>';
        return;
    }
    filtrados.forEach(r => {
        const div = document.createElement('div');
        div.className = 'report-item';
        div.innerHTML = `
            <strong>${r.tipo.toUpperCase()}</strong> – <em>${r.ruta}</em><br>
            <span>${r.loc}</span><br>
            <small>${new Date(r.fecha).toLocaleString()}</small>
        `;
        container.appendChild(div);
    });
}

function filtrarReportes(tipo, btn) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderReportes(tipo);
}

function updateReportCount() {
    const countEl = document.getElementById('reportCount');
    if (countEl) countEl.innerText = listaReportes.length;
}

// ------------------------------------------------------------
// Saldo Tarjeta BIP – simulación con datos mock
// ------------------------------------------------------------
const STORAGE_SALDOS_KEY = 'movicerri_saldos';
let MOCK_SALDOS = {};

function cargarSaldos() {
    const raw = localStorage.getItem(STORAGE_SALDOS_KEY);
    if (raw) {
        try { MOCK_SALDOS = JSON.parse(raw); } catch (e) { MOCK_SALDOS = {}; }
    } else {
        MOCK_SALDOS = {
            '12345678': { saldo: 1450, ultimaCarga: '2026-04-10', ultimoViaje: '2026-04-18 08:30', costoViaje: 730, viajesMes: 12 },
            '87654321': { saldo: 300, ultimaCarga: '2026-04-05', ultimoViaje: '2026-04-19 07:45', costoViaje: 730, viajesMes: 5 }
        };
        guardarSaldos();
    }
}

function guardarSaldos() {
    localStorage.setItem(STORAGE_SALDOS_KEY, JSON.stringify(MOCK_SALDOS));
}

function actualizarTarjetaVisual() {
    const input = document.getElementById('bipNumber');
    const display = document.getElementById('bipCardDisplay');
    if (!input || !display) return;
    const val = input.value.replace(/\D/g, '').padEnd(8, '•');
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    display.innerText = formatted;
}

function consultarSaldo() {
    const num = document.getElementById('bipNumber').value.replace(/\D/g, '');
    const resultDiv = document.getElementById('saldoResult');
    const errorDiv = document.getElementById('saldoError');
    
    if (!num || num.length < 8) {
        alert('Ingresa un número de tarjeta BIP válido (8 dígitos).');
        return;
    }
    
    // Generar datos aleatorios si la tarjeta no existe
    if (!MOCK_SALDOS[num]) {
        const saldoRandom = Math.floor(Math.random() * 8000) + 500;
        const viajesRandom = Math.floor(Math.random() * 20);
        const hoy = new Date();
        const fechaViaje = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')} ${String(hoy.getHours()).padStart(2, '0')}:${String(hoy.getMinutes()).padStart(2, '0')}`;
        
        MOCK_SALDOS[num] = {
            saldo: saldoRandom,
            ultimaCarga: `2026-04-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            ultimoViaje: fechaViaje,
            costoViaje: 730,
            viajesMes: viajesRandom
        };
        guardarSaldos();
    }
    
    const data = MOCK_SALDOS[num];
    document.getElementById('saldoAmount').innerText = `$${data.saldo.toLocaleString('es-CL')}`;
    document.getElementById('lastCharge').innerText = data.ultimaCarga;
    document.getElementById('lastTrip').innerText = data.ultimoViaje;
    document.getElementById('lastTripCost').innerText = `$${data.costoViaje.toLocaleString('es-CL')}`;
    document.getElementById('monthTrips').innerText = data.viajesMes;
    
    resultDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

// ------------------------------------------------------------
// Simulación del Protocolo de alerta (visual demo)
// ------------------------------------------------------------
let isSimulating = false;
function simularProtocolo() {
    if (isSimulating) return;
    const barra = document.getElementById('peopleBar');
    const contador = document.getElementById('peopleCount');
    const status = document.getElementById('protocolStatus');
    if (!barra || !contador || !status) return;
    
    isSimulating = true;
    let current = 0;
    const max = 20;
    const interval = setInterval(() => {
        current += 2;
        if (current >= max) current = max;
        const perc = Math.round((current / max) * 100);
        barra.style.width = perc + '%';
        contador.innerText = current;
        if (current >= 15) {
            status.innerHTML = '<span class="protocol-badge protocol-alert"><i class="fas fa-exclamation"></i> Alta Demanda</span>';
        }
        if (current === max) {
            clearInterval(interval);
            setTimeout(() => {
                // Volver a la normalidad después de unos segundos
                barra.style.width = '60%';
                contador.innerText = '12';
                status.innerHTML = '<span class="protocol-badge protocol-normal"><i class="fas fa-check"></i> Normal</span>';
                isSimulating = false;
            }, 4000);
        }
    }, 300);
}

// ------------------------------------------------------------
// Funciones adicionales (UI & Animaciones)
// ------------------------------------------------------------
function toggleNav() {
    const nav = document.getElementById('navMenu');
    if (!nav) return;
    nav.classList.toggle('nav-active');
}

function animateCounters() {
    const counters = document.querySelectorAll('.hero-stat-number');
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / 50;
            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 40);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

function actualizarEstadoServicios() {
    const statuses = [
        { class: 'badge-green', icon: 'fa-check-circle', text: 'Fluido' },
        { class: 'badge-yellow', icon: 'fa-exclamation-triangle', text: 'Retraso leve' },
        { class: 'badge-red', icon: 'fa-times-circle', text: 'Retraso grave' }
    ];
    const items = document.querySelectorAll('.status-item .badge');
    items.forEach(badge => {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        badge.className = `badge ${randomStatus.class}`;
        badge.innerHTML = `<i class="fas ${randomStatus.icon}"></i> ${randomStatus.text}`;
    });
    
    const timeSpan = document.getElementById('lastUpdate');
    if (timeSpan) {
        timeSpan.innerText = 'hace unos segundos';
    }
}

// ------------------------------------------------------------
// Mi Cuenta - Perfil de Usuario
// ------------------------------------------------------------
let isEditingProfile = false;

function toggleEditProfile() {
    const btn = document.getElementById('btnEditProfile');
    const container = document.getElementById('userInfoContainer');

    if (!btn || !container) return;

    if (!isEditingProfile) {
        // Entrar en modo edición
        const nameDisplay = document.getElementById('userNameDisplay');
        const emailDisplay = document.getElementById('userEmailDisplay');
        const currentName = nameDisplay ? nameDisplay.innerText : '';
        const currentEmail = emailDisplay ? emailDisplay.innerText : '';

        if (nameDisplay) nameDisplay.outerHTML = `<input type="text" id="editUserName" value="${currentName}" style="margin-bottom: 5px; font-size: 1.5rem; font-weight: bold; background: rgba(255,255,255,0.1); border: 1px solid var(--color-primary); color: white; padding: 5px; border-radius: 4px; width: 100%;">`;
        if (emailDisplay) emailDisplay.outerHTML = `<input type="email" id="editUserEmail" value="${currentEmail}" style="margin-top: 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: var(--color-text-primary); padding: 5px; border-radius: 4px; width: 100%;">`;
        
        btn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        isEditingProfile = true;
    } else {
        // Guardar cambios y volver a modo lectura
        const editName = document.getElementById('editUserName');
        const editEmail = document.getElementById('editUserEmail');
        
        const newName = editName ? editName.value.trim() : 'Usuario';
        const newEmail = editEmail ? editEmail.value.trim() : 'usuario@email.com';

        if (editName) editName.outerHTML = `<h2 id="userNameDisplay">${newName}</h2>`;
        if (editEmail) editEmail.outerHTML = `<span id="userEmailDisplay">${newEmail}</span>`;

        btn.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        isEditingProfile = false;
    }
}

// ------------------------------------------------------------
// Mi Cuenta - Tarjeta BIP Vinculada
// ------------------------------------------------------------
// Inicializar saldo vinculado al cargar si existe en localStorage
document.addEventListener('DOMContentLoaded', function() {
    const balanceDisplay = document.getElementById('linkedBipBalance');
    const numberDisplay = document.getElementById('linkedBipNumberDisplay');
    if (balanceDisplay || numberDisplay) {
        try {
            const state = JSON.parse(localStorage.getItem('movicerri_linked_bip') || 'null');
            if (state) {
                if (balanceDisplay && state.balance !== undefined) {
                    balanceDisplay.innerText = typeof state.balance === 'number' ? `$${state.balance.toLocaleString('es-CL')}` : state.balance;
                }
                if (numberDisplay && state.cardNumber) {
                    numberDisplay.innerText = state.cardNumber;
                }
            }
        } catch(e) {}
    }

    // Agregar EventListener al botón de actualizar
    const btnActualizar = document.getElementById('btn-actualizar');
    if (btnActualizar) {
        btnActualizar.addEventListener('click', async () => {
            const feedback = document.getElementById('bipUpdateFeedback');
            
            let state = null;
            try {
                state = JSON.parse(localStorage.getItem('movicerri_linked_bip') || '{}');
            } catch (e) {}

            let rawNumber = (state && state.cardNumber) ? state.cardNumber.replace(/\s+/g, '') : '23352467';
            
            if (rawNumber.length < 8) {
                rawNumber = '23352467'; // Fallback a tarjeta por defecto si es muy corto
            }

            balanceDisplay.innerText = 'Cargando...';
            feedback.style.display = 'none';

            try {
                // Se utiliza corsproxy.io para eludir los bloqueos de CORS en localhost
                const response = await fetch(`https://corsproxy.io/?https://api.xor.cl/red/balance/${rawNumber}`);
                if (!response.ok) throw new Error('Error de red o proxy');
                const data = await response.json();
                
                if (data.status === 'OK' && data.balance) {
                    balanceDisplay.innerText = data.balance;
                    state.balance = data.balance;
                    state.cardNumber = rawNumber; 
                    localStorage.setItem('movicerri_linked_bip', JSON.stringify(state));
                    
                    feedback.innerText = '¡Saldo actualizado exitosamente desde XOR!';
                    feedback.style.display = 'block';
                    feedback.style.color = '#4caf50';
                } else {
                    throw new Error('API respondió pero la tarjeta es inválida');
                }
            } catch (error) {
                console.warn("XOR API Falló, activando simulación (Fallback):", error);
                
                // Simulación Pro (Fallback): Genera un saldo realista entre $1.250 y $4.800
                const randomBalance = Math.floor(Math.random() * (4800 - 1250 + 1)) + 1250;
                const formattedBalance = `$${randomBalance.toLocaleString('es-CL')}`;
                
                balanceDisplay.innerText = formattedBalance;
                
                state.balance = formattedBalance;
                state.cardNumber = rawNumber;
                localStorage.setItem('movicerri_linked_bip', JSON.stringify(state));

                feedback.innerText = 'Saldo actualizado (Modo Simulación Activo)';
                feedback.style.display = 'block';
                feedback.style.color = 'var(--color-text-secondary)';
            }
            
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
        });
    }
});

let isEditingBip = false;

function toggleEditBip() {
    const btn = document.getElementById('btnEditBip');
    
    if (!isEditingBip) {
        // Entrar en modo edición
        const numberDisplay = document.getElementById('linkedBipNumberDisplay');
        if (!numberDisplay) return;
        const currentNumber = numberDisplay.innerText.replace(/\s+/g, '');

        numberDisplay.outerHTML = `<input type="text" id="editBipNumber" value="${currentNumber}" maxlength="8" placeholder="12345678" style="font-size: 1.4rem; letter-spacing: 2px; margin: 20px 0; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 5px; border-radius: 4px; width: 100%; box-sizing: border-box; text-align: center;">`;
        
        btn.innerHTML = '<i class="fas fa-save"></i>';
        btn.style.color = 'var(--color-primary)';
        btn.style.borderColor = 'var(--color-primary)';
        isEditingBip = true;
    } else {
        // Guardar cambios
        const editInput = document.getElementById('editBipNumber');
        if (!editInput) return;
        const rawVal = editInput.value.replace(/\D/g, '').padEnd(8, '•');
        const formatted = rawVal.replace(/(.{4})/g, '$1 ').trim();

        editInput.outerHTML = `<div class="bip-card-number" id="linkedBipNumberDisplay" style="font-size: 1.4rem; letter-spacing: 2px; margin: 20px 0;">${formatted}</div>`;

        // Guardar en localStorage
        try {
            let state = JSON.parse(localStorage.getItem('movicerri_linked_bip') || '{}');
            state.cardNumber = formatted;
            localStorage.setItem('movicerri_linked_bip', JSON.stringify(state));
        } catch(e) {}

        btn.innerHTML = '<i class="fas fa-edit"></i>';
        btn.style.color = '';
        btn.style.borderColor = 'rgba(255,255,255,0.2)';
        isEditingBip = false;
    }
}

// ------------------------------------------------------------
// Expose functions to HTML (inline handlers)
// ------------------------------------------------------------
window.toggleChatbot = toggleChatbot;
window.sendSuggestion = sendSuggestion;
window.sendChat = sendChat;
window.enviarReporte = enviarReporte;
window.filtrarReportes = filtrarReportes;
window.consultarSaldo = consultarSaldo;
window.simularProtocolo = simularProtocolo;
window.toggleNav = toggleNav;
window.actualizarEstadoServicios = actualizarEstadoServicios;
window.toggleEditProfile = toggleEditProfile;
window.toggleEditBip = toggleEditBip;