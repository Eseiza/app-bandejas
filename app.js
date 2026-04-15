/* ══════════════════════════════════════
   APP BANDEJAS — app.js
   ══════════════════════════════════════ */

// ── USUARIOS ──
const USERS = {
  "camionero1": { password: "chofer.2026",  role: "chofer",       nombre: "CEL1"   },
  "camionero2": { password: "chofer.2026",  role: "chofer",       nombre: "CEL2"   },
  "camionero3": { password: "chofer.2026",  role: "chofer",       nombre: "CEL3"   },
  "camionero4": { password: "chofer.2026",  role: "chofer",       nombre: "CEL4"   },
  "camionero5": { password: "chofer.2026",  role: "chofer",       nombre: "CEL5"   },
  "camionero6": { password: "chofer.2026",  role: "chofer",       nombre: "CEL6"   },
  "camionero7": { password: "chofer.2026",  role: "chofer",       nombre: "CEL7"   }, 
  "Admin":      { password: "Admin.2026",   role: "visualizador", nombre: "Romero" },
};

// ── CAMIONES ──
const CAMIONES = [
  "Mercedes Benz ATEGO 1418 · KSB 077",
  "Mercedes Benz 710 · HSH 342",
  "Mercedes Benz 710 · GWI 653",
  "Mercedes Benz ATEGO 1418 · JUT 069",
  "Mercedes Benz ATEGO 1721 · AD 884 UR",
  "Mercedes Benz ATEGO · AE 203 YU",
  "Mercedes Benz ATEGO 1721 · AH 762 MP",
  "*MB ACCELOV1016 · AG 915 RC*",
  "*MB ATEGO 1721*"
];

// ── CHOFERES ──
const CHOFERES = [
  "Martín González",
  "Roberto Sánchez",
  "Diego Fernández",
  "Carlos Romero",
  "Luis Pérez",
  "Sergio Torres",
  "Pablo Ramírez",
  "Gustavo Medina",
];

// ── CLIENTES ──
const CLIENTES_LISTA = [
  "Supermercado Norte",
  "Almacén López",
  "Distribuidora Sur",
  "Mercado Central",
  "Kiosco El Paraíso",
  "Panadería La Esperanza",
  "Carnicería Don Pedro",
  "Verdulería Flores",
  "Almacén El Progreso",
  "Supermercado del Pueblo",
];

// ── STORAGE ──
function cargarViajes() {
  try { return JSON.parse(localStorage.getItem('bandejas_viajes') || '[]'); }
  catch { return []; }
}

function guardarViajes() {
  localStorage.setItem('bandejas_viajes', JSON.stringify(state.viajes));
}

// ── STATE ──
const state = {
  role: null,
  currentUser: '',
  viajes: cargarViajes(),
  viajeActivo: null,
};

/* ══════════════════════════════════════
   UTILS
   ══════════════════════════════════════ */

function showToast(msg, isErr = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = isErr ? 'var(--accent2)' : 'var(--green)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function formatFecha(isoDate) {
  return new Date(isoDate).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/* ══════════════════════════════════════
   LOGIN
   ══════════════════════════════════════ */

document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.role = btn.dataset.role;
  });
});

['login-user', 'login-pass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
});

document.getElementById('login-btn').addEventListener('click', doLogin);

function doLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();

  if (!username || !password) { showToast('Ingresá usuario y contraseña', true); return; }
  if (!state.role) { showToast('Seleccioná un rol', true); return; }

  const user = USERS[username];
  if (!user || user.password !== password) { showToast('Usuario o contraseña incorrectos', true); return; }
  if (user.role !== state.role) { showToast(`Este usuario es "${user.role}", seleccioná el rol correcto`, true); return; }

  state.currentUser = user.nombre;
  document.getElementById('screen-login').style.display = 'none';

  if (state.role === 'chofer') {
    document.getElementById('screen-chofer').style.cssText = 'display:flex;flex-direction:column;min-height:100vh;width:100%';
    document.getElementById('chofer-nombre').textContent = user.nombre;
    mostrarPantallaInicio();
  } else {
    document.getElementById('screen-vis').style.display = 'flex';
    document.getElementById('vis-nombre').textContent = user.nombre;
    poblarFiltros();
    aplicarFiltros();
  }
}

/* ══════════════════════════════════════
   CHOFER — PANTALLAS
   ══════════════════════════════════════ */

function mostrarPantalla(id) {
  document.querySelectorAll('.chofer-screen').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

function mostrarPantallaInicio() {
  mostrarPantalla('pantalla-inicio');
  actualizarResumenHoy();
}

function actualizarResumenHoy() {
  const hoy = new Date().toDateString();
  const viajesHoy = state.viajes.filter(v => new Date(v.fecha).toDateString() === hoy);
  document.getElementById('resumen-viajes').textContent = viajesHoy.length;
  const totalSalen   = viajesHoy.reduce((s, v) => s + v.bandejas_salen, 0);
  const totalVuelven = viajesHoy.reduce((s, v) =>
    s + v.clientes.reduce((a, c) => a + (parseInt(c.devuelven) || 0), 0), 0);
  document.getElementById('resumen-salen').textContent   = totalSalen;
  document.getElementById('resumen-vuelven').textContent = totalVuelven;
}

// ── NUEVO VIAJE ──
document.getElementById('btn-nuevo-viaje').addEventListener('click', () => {
  mostrarPantalla('pantalla-nuevo-viaje');
  document.getElementById('nv-fecha').textContent =
    new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });

  const selCam = document.getElementById('nv-camion');
  selCam.innerHTML = '<option value="">— Seleccioná un camión —</option>';
  CAMIONES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = c;
    selCam.appendChild(opt);
  });

  const selCho = document.getElementById('nv-chofer');
  selCho.innerHTML = '<option value="">— Seleccioná un chofer —</option>';
  CHOFERES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = c;
    selCho.appendChild(opt);
  });

  document.getElementById('nv-bandejas').value = '';
});

document.getElementById('btn-cancelar-viaje').addEventListener('click', mostrarPantallaInicio);

document.getElementById('btn-iniciar-viaje').addEventListener('click', () => {
  const camion   = document.getElementById('nv-camion').value.trim();
  const chofer   = document.getElementById('nv-chofer').value.trim();
  const bandejas = parseInt(document.getElementById('nv-bandejas').value) || 0;

  if (!camion)   { showToast('Seleccioná un camión', true); return; }
  if (!chofer)   { showToast('Seleccioná un chofer', true); return; }
  if (!bandejas) { showToast('Ingresá las bandejas que salen', true); return; }

  state.viajeActivo = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    camion,
    chofer,
    bandejas_salen: bandejas,
    clientes: [],
  };

  mostrarPantallaViaje();
});

// ── VIAJE EN CURSO ──
function mostrarPantallaViaje() {
  mostrarPantalla('pantalla-viaje');
  const v = state.viajeActivo;
  document.getElementById('viaje-camion').textContent   = v.camion;
  document.getElementById('viaje-chofer').textContent   = v.chofer;
  document.getElementById('viaje-bandejas').textContent = v.bandejas_salen;
  renderClientesViaje();
  poblarDesplegable();
}

function poblarDesplegable() {
  const sel = document.getElementById('cliente-select');
  const agregados = state.viajeActivo.clientes.map(c => c.nombre);
  sel.innerHTML = '<option value="">— Seleccioná un cliente —</option>';
  CLIENTES_LISTA
    .filter(c => !agregados.includes(c))
    .forEach(c => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = c;
      sel.appendChild(opt);
    });
}

document.getElementById('btn-agregar-cliente').addEventListener('click', () => {
  const sel    = document.getElementById('cliente-select');
  const nombre = sel.value;
  if (!nombre) { showToast('Seleccioná un cliente', true); return; }
  state.viajeActivo.clientes.push({ nombre, dejan: '', devuelven: '', done: false });
  renderClientesViaje();
  poblarDesplegable();
  sel.value = '';
});

function renderClientesViaje() {
  const list = document.getElementById('viaje-clientes-list');
  const cls  = state.viajeActivo.clientes;

  if (!cls.length) {
    list.innerHTML = '<div class="empty-msg">Agregá clientes con el desplegable de arriba</div>';
    return;
  }

  list.innerHTML = '';
  cls.forEach((cl, i) => {
    const row = document.createElement('div');
    row.className = 'cl-row' + (cl.done ? ' done' : '');
    row.innerHTML = `
      <div class="cl-row-top">
        <div class="cl-num">${String(i+1).padStart(2,'0')}</div>
        <div class="cl-name">${cl.nombre}</div>
        <button class="btn-quitar" onclick="quitarCliente(${i})">✕</button>
      </div>
      <div class="cl-row-bottom">
        <div class="cl-inputs">
          <div class="cl-input-group">
            <span class="cl-input-label">Dejan</span>
            <input class="cl-input" type="number" inputmode="numeric" min="0" placeholder="0" value="${cl.dejan}"
              oninput="state.viajeActivo.clientes[${i}].dejan=this.value">
          </div>
          <div class="cl-input-group">
            <span class="cl-input-label">Devuelven</span>
            <input class="cl-input" type="number" inputmode="numeric" min="0" placeholder="0" value="${cl.devuelven}"
              oninput="state.viajeActivo.clientes[${i}].devuelven=this.value">
          </div>
        </div>
        <div class="badge ${cl.done ? 'ok' : 'pend'}" onclick="toggleDone(${i})">
          ${cl.done ? '✓ OK' : 'PENDIENTE'}
        </div>
      </div>`;
    list.appendChild(row);
  });
}

function toggleDone(i) {
  state.viajeActivo.clientes[i].done = !state.viajeActivo.clientes[i].done;
  renderClientesViaje();
}

function quitarCliente(i) {
  state.viajeActivo.clientes.splice(i, 1);
  renderClientesViaje();
  poblarDesplegable();
}

document.getElementById('btn-cerrar-viaje').addEventListener('click', () => {
  const cls  = state.viajeActivo.clientes;
  const pend = cls.filter(c => !c.done).length;
  if (!cls.length) { showToast('Agregá al menos un cliente', true); return; }
  if (pend > 0 && !confirm(`Hay ${pend} cliente(s) pendientes. ¿Cerrar igual?`)) return;

  state.viajes.push({ ...state.viajeActivo });
  guardarViajes();
  state.viajeActivo = null;
  showToast('✓ Viaje cerrado y guardado');
  mostrarPantallaInicio();
});

document.getElementById('btn-volver-inicio').addEventListener('click', () => {
  if (state.viajeActivo && state.viajeActivo.clientes.length > 0) {
    if (!confirm('¿Salir sin cerrar el viaje? Los datos no se guardarán.')) return;
  }
  state.viajeActivo = null;
  mostrarPantallaInicio();
});

/* ══════════════════════════════════════
   VISUALIZADOR
   ══════════════════════════════════════ */

document.getElementById('btn-refresh-vis').addEventListener('click', () => {
  state.viajes = cargarViajes();
  renderRegistros();
  showToast('✓ Datos actualizados');
});

function renderRegistros() {
  const tbody = document.getElementById('vis-tbody');

  if (!state.viajes.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="cell-center text-muted">Sin registros aún</td></tr>';
    updateVisKpis();
    return;
  }

  tbody.innerHTML = '';
  state.viajes.forEach(v => {
    if (!v.clientes.length) return;
    v.clientes.forEach(cl => {
      const dejan     = parseInt(cl.dejan)     || 0;
      const devuelven = parseInt(cl.devuelven) || 0;
      const dif       = devuelven - dejan;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatFecha(v.fecha)}</td>
        <td class="text-mono text-accent">${v.camion}</td>
        <td>${v.chofer}</td>
        <td>${cl.nombre}</td>
        <td>${dejan}</td>
        <td>${devuelven}</td>
        <td class="${dif < 0 ? 'text-red' : dif > 0 ? 'text-green' : ''}">${dif > 0 ? '+' : ''}${dif}</td>`;
      tbody.appendChild(tr);
    });
  });

  updateVisKpis();
}

function updateVisKpis() {
  const hoy = new Date().toDateString();
  const viajesHoy = state.viajes.filter(v => new Date(v.fecha).toDateString() === hoy);
  document.getElementById('vis-kpi-viajes').textContent  = viajesHoy.length;
  document.getElementById('vis-kpi-salen').textContent   =
    viajesHoy.reduce((s, v) => s + v.bandejas_salen, 0);
  document.getElementById('vis-kpi-vuelven').textContent =
    viajesHoy.reduce((s, v) =>
      s + v.clientes.reduce((a, c) => a + (parseInt(c.devuelven) || 0), 0), 0);
}

/* ══════════════════════════════════════
   VISUALIZADOR — TABS
   ══════════════════════════════════════ */

document.querySelectorAll('.vis-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.vis-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.vis-tab-content').forEach(c => c.style.display = 'none');
    tab.classList.add('active');
    const content = document.getElementById('tab-' + tab.dataset.tab);
    content.style.display = 'block';
    if (tab.dataset.tab === 'deudas') renderDeudas();
  });
});

/* ══════════════════════════════════════
   VISUALIZADOR — REGISTROS CON FILTROS
   ══════════════════════════════════════ */

document.getElementById('btn-refresh-vis').addEventListener('click', () => {
  state.viajes = cargarViajes();
  poblarFiltros();
  aplicarFiltros();
  showToast('✓ Datos actualizados');
});

document.getElementById('btn-filtrar').addEventListener('click', aplicarFiltros);

document.getElementById('btn-limpiar-filtros').addEventListener('click', () => {
  document.getElementById('filtro-desde').value = '';
  document.getElementById('filtro-hasta').value = '';
  document.getElementById('filtro-cliente').value = '';
  document.getElementById('filtro-chofer').value = '';
  aplicarFiltros();
});

function poblarFiltros() {
  // Clientes únicos de todos los viajes
  const clientes = [...new Set(
    state.viajes.flatMap(v => v.clientes.map(c => c.nombre))
  )].sort();

  const selCl = document.getElementById('filtro-cliente');
  const valCl = selCl.value;
  selCl.innerHTML = '<option value="">Todos</option>';
  clientes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = c;
    selCl.appendChild(opt);
  });
  selCl.value = valCl;

  // Choferes únicos
  const choferes = [...new Set(state.viajes.map(v => v.chofer))].sort();
  const selCh = document.getElementById('filtro-chofer');
  const valCh = selCh.value;
  selCh.innerHTML = '<option value="">Todos</option>';
  choferes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = c;
    selCh.appendChild(opt);
  });
  selCh.value = valCh;
}

function aplicarFiltros() {
  const desde   = document.getElementById('filtro-desde').value;
  const hasta   = document.getElementById('filtro-hasta').value;
  const cliente = document.getElementById('filtro-cliente').value;
  const chofer  = document.getElementById('filtro-chofer').value;

  // Expandir a filas individuales por cliente
  let filas = [];
  state.viajes.forEach(v => {
    v.clientes.forEach(cl => {
      filas.push({ ...cl, fecha: v.fecha, camion: v.camion, chofer: v.chofer, bandejas_salen: v.bandejas_salen });
    });
  });

  // Filtrar
  if (desde)   filas = filas.filter(f => f.fecha.slice(0,10) >= desde);
  if (hasta)   filas = filas.filter(f => f.fecha.slice(0,10) <= hasta);
  if (cliente) filas = filas.filter(f => f.nombre === cliente);
  if (chofer)  filas = filas.filter(f => f.chofer === chofer);

  renderTablaRegistros(filas);
  updateVisKpis(desde, hasta);
}

function renderTablaRegistros(filas) {
  const tbody = document.getElementById('vis-tbody');
  if (!filas.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="cell-center text-muted">Sin registros para los filtros aplicados</td></tr>';
    return;
  }
  tbody.innerHTML = filas.map(f => {
    const dejan     = parseInt(f.dejan)     || 0;
    const devuelven = parseInt(f.devuelven) || 0;
    const dif       = devuelven - dejan;
    return `<tr>
      <td style="white-space:nowrap">${formatFecha(f.fecha)}</td>
      <td class="text-mono text-accent">${f.camion}</td>
      <td>${f.chofer}</td>
      <td>${f.nombre}</td>
      <td>${dejan}</td>
      <td>${devuelven}</td>
      <td class="${dif < 0 ? 'text-red' : dif > 0 ? 'text-green' : ''}">${dif > 0 ? '+' : ''}${dif}</td>
    </tr>`;
  }).join('');
}

function updateVisKpis(desde = '', hasta = '') {
  let viajes = state.viajes;
  if (desde) viajes = viajes.filter(v => v.fecha.slice(0,10) >= desde);
  if (hasta) viajes = viajes.filter(v => v.fecha.slice(0,10) <= hasta);

  document.getElementById('vis-kpi-viajes').textContent  = viajes.length;
  document.getElementById('vis-kpi-salen').textContent   =
    viajes.reduce((s, v) => s + v.bandejas_salen, 0);
  document.getElementById('vis-kpi-vuelven').textContent =
    viajes.reduce((s, v) =>
      s + v.clientes.reduce((a, c) => a + (parseInt(c.devuelven) || 0), 0), 0);
}

/* ══════════════════════════════════════
   VISUALIZADOR — DEUDAS
   ══════════════════════════════════════ */

document.getElementById('btn-refresh-deudas').addEventListener('click', () => {
  state.viajes = cargarViajes();
  renderDeudas();
  showToast('✓ Datos actualizados');
});

function cargarDeudas() {
  try { return JSON.parse(localStorage.getItem('bandejas_deudas') || '{}'); }
  catch { return {}; }
}

function guardarDeudas(deudas) {
  localStorage.setItem('bandejas_deudas', JSON.stringify(deudas));
}

function calcularDeudaCliente(nombre) {
  // Suma total dejan - devuelven de todos los viajes
  let total = 0;
  state.viajes.forEach(v => {
    v.clientes.filter(c => c.nombre === nombre).forEach(c => {
      total += (parseInt(c.dejan) || 0) - (parseInt(c.devuelven) || 0);
    });
  });
  return total;
}

function renderDeudas() {
  const list = document.getElementById('deudas-list');
  const ajustes = cargarDeudas(); // ajustes manuales guardados

  // Construir listado de todos los clientes que aparecen en viajes
  const clientesEnViajes = [...new Set(
    state.viajes.flatMap(v => v.clientes.map(c => c.nombre))
  )].sort();

  // Combinar con CLIENTES_LISTA para mostrar todos
  const todosClientes = [...new Set([...CLIENTES_LISTA, ...clientesEnViajes])].sort();

  if (!todosClientes.length) {
    list.innerHTML = '<div class="empty-msg">Sin clientes registrados aún</div>';
    return;
  }

  list.innerHTML = '';
  todosClientes.forEach(nombre => {
    const deudaCalculada = calcularDeudaCliente(nombre);
    const ajuste = ajustes[nombre] !== undefined ? ajustes[nombre] : 0;
    const deudaFinal = deudaCalculada + ajuste;

    const colorClass = deudaFinal > 10 ? 'danger' : deudaFinal > 0 ? 'warn' : 'ok';

    const row = document.createElement('div');
    row.className = 'deuda-row';
    row.innerHTML = `
      <div class="deuda-nombre">${nombre}</div>
      <div class="deuda-num ${colorClass}">${deudaFinal}</div>
      <button class="btn-editar" onclick="abrirModalDeuda('${nombre}', ${deudaFinal})">EDITAR</button>`;
    list.appendChild(row);
  });
}

/* ══════════════════════════════════════
   MODAL EDITAR DEUDA
   ══════════════════════════════════════ */

let modalClienteActivo = null;

function abrirModalDeuda(nombre, deudaActual) {
  modalClienteActivo = nombre;
  document.getElementById('modal-cliente-nombre').textContent = nombre;
  document.getElementById('modal-deuda-input').value = deudaActual;
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('modal-deuda-input').focus();
}

document.getElementById('modal-cancelar').addEventListener('click', () => {
  document.getElementById('modal-overlay').style.display = 'none';
  modalClienteActivo = null;
});

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').style.display = 'none';
    modalClienteActivo = null;
  }
});

document.getElementById('modal-guardar').addEventListener('click', () => {
  if (!modalClienteActivo) return;

  const nuevaDeuda = parseInt(document.getElementById('modal-deuda-input').value) || 0;

  // Guardamos la diferencia como ajuste manual
  const deudaCalculada = calcularDeudaCliente(modalClienteActivo);
  const ajuste = nuevaDeuda - deudaCalculada;

  const ajustes = cargarDeudas();
  ajustes[modalClienteActivo] = ajuste;
  guardarDeudas(ajustes);

  document.getElementById('modal-overlay').style.display = 'none';
  modalClienteActivo = null;
  renderDeudas();
  showToast('✓ Deuda actualizada');
});
