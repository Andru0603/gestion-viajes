const API = '/api';

let clientesCache = [];
let paquetesCache = [];
let proveedoresCache = [];
let reservasCache = [];

let editandoClienteId = null;
let editandoPaqueteId = null;
let editandoProveedorId = null;

/* ===== Utilidades de red ===== */

async function obtener(recurso) {
    const resp = await fetch(`${API}/${recurso}`);
    if (!resp.ok) return [];
    return resp.json();
}

async function crear(recurso, datos) {
    const resp = await fetch(`${API}/${recurso}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!resp.ok) {
        const texto = await resp.text();
        throw new Error(texto || 'No se pudo guardar');
    }
    return resp.json();
}

async function actualizar(recurso, id, datos) {
    const resp = await fetch(`${API}/${recurso}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    if (!resp.ok) {
        const texto = await resp.text();
        throw new Error(texto || 'No se pudo actualizar');
    }
    return resp.json();
}

async function eliminar(recurso, id) {
    await fetch(`${API}/${recurso}/${id}`, { method: 'DELETE' });
}

function poblarSelect(id, items, textoOpcion, placeholder) {
    const select = document.getElementById(id);
    const vacio = placeholder ? `<option value="">${placeholder}</option>` : '';
    select.innerHTML = vacio + items.map(i => `<option value="${i.id}">${textoOpcion(i)}</option>`).join('');
}

/* ===== Utilidades de modo edicion (compartidas por clientes, paquetes, proveedores) ===== */

function activarModoEdicion(form, textoBoton, funcionCancelar) {
    form.querySelector('.boton-guardar').textContent = textoBoton;
    let cancelar = form.querySelector('.boton-cancelar');
    if (!cancelar) {
        cancelar = document.createElement('button');
        cancelar.type = 'button';
        cancelar.className = 'boton-cancelar';
        form.querySelector('.boton-guardar').insertAdjacentElement('afterend', cancelar);
    }
    cancelar.textContent = 'Cancelar edición';
    cancelar.onclick = funcionCancelar;
    cancelar.style.display = 'inline-block';
}

function desactivarModoEdicion(form, textoBoton) {
    form.querySelector('.boton-guardar').textContent = textoBoton;
    const cancelar = form.querySelector('.boton-cancelar');
    if (cancelar) cancelar.style.display = 'none';
}

/* ===== Navegacion entre secciones ===== */

document.querySelectorAll('.talon').forEach(boton => {
    boton.addEventListener('click', () => {
        document.querySelectorAll('.talon').forEach(b => b.classList.remove('activo'));
        document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
        boton.classList.add('activo');
        document.getElementById(`seccion-${boton.dataset.seccion}`).classList.add('activa');
    });
});

/* ===== Clientes ===== */

async function cargarClientes() {
    clientesCache = await obtener('clientes');
    const tbody = document.getElementById('tabla-clientes');
    tbody.innerHTML = clientesCache.length ? clientesCache.map(c => `
        <tr>
            <td>${c.nombre}</td>
            <td>${c.documento ?? ''}</td>
            <td>${c.telefono ?? ''}</td>
            <td>${c.email ?? ''}</td>
            <td>
                <button class="editar" onclick="iniciarEdicionCliente(${c.id})">Editar</button>
                <button class="borrar" onclick="borrarCliente(${c.id})">Eliminar</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="vacio">Todavía no hay clientes registrados</td></tr>';

    poblarSelect('select-cliente', clientesCache, c => c.nombre);
}

function iniciarEdicionCliente(id) {
    const cliente = clientesCache.find(c => c.id === id);
    if (!cliente) return;
    const form = document.getElementById('form-clientes');
    form.nombre.value = cliente.nombre || '';
    form.documento.value = cliente.documento || '';
    form.telefono.value = cliente.telefono || '';
    form.email.value = cliente.email || '';
    form.notas.value = cliente.notas || '';
    editandoClienteId = id;
    activarModoEdicion(form, 'Actualizar cliente', cancelarEdicionCliente);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarEdicionCliente() {
    editandoClienteId = null;
    const form = document.getElementById('form-clientes');
    form.reset();
    desactivarModoEdicion(form, 'Guardar cliente');
}

async function borrarCliente(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    await eliminar('clientes', id);
    cargarClientes();
}

document.getElementById('form-clientes').addEventListener('submit', async e => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    if (editandoClienteId) {
        await actualizar('clientes', editandoClienteId, datos);
        cancelarEdicionCliente();
    } else {
        await crear('clientes', datos);
        e.target.reset();
    }
    cargarClientes();
});

/* ===== Paquetes ===== */

async function cargarPaquetes() {
    paquetesCache = await obtener('paquetes');
    const tbody = document.getElementById('tabla-paquetes');
    tbody.innerHTML = paquetesCache.length ? paquetesCache.map(p => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.destino ?? ''}</td>
            <td>${p.medioTransporte === 'AEREO' ? 'Aéreo' : p.medioTransporte === 'TERRESTRE' ? 'Terrestre' : ''}</td>
            <td class="precio">$${Number(p.precioBase).toLocaleString('es-CO')}</td>
            <td>${p.duracionDias ?? ''}</td>
            <td>
                <button class="editar" onclick="iniciarEdicionPaquete(${p.id})">Editar</button>
                <button class="borrar" onclick="borrarPaquete(${p.id})">Eliminar</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" class="vacio">Todavía no hay paquetes registrados</td></tr>';

    poblarSelect('select-paquete', paquetesCache, p => `${p.nombre} (${p.destino ?? 'sin destino'})`);
}

function iniciarEdicionPaquete(id) {
    const p = paquetesCache.find(x => x.id === id);
    if (!p) return;
    const form = document.getElementById('form-paquetes');
    form.nombre.value = p.nombre || '';
    form.destino.value = p.destino || '';
    form.descripcion.value = p.descripcion || '';
    form.medioTransporte.value = p.medioTransporte || 'AEREO';
    form.precioBase.value = p.precioBase ?? '';
    form.duracionDias.value = p.duracionDias ?? '';
    form.cupoMaximo.value = p.cupoMaximo ?? '';
    editandoPaqueteId = id;
    activarModoEdicion(form, 'Actualizar paquete', cancelarEdicionPaquete);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarEdicionPaquete() {
    editandoPaqueteId = null;
    const form = document.getElementById('form-paquetes');
    form.reset();
    desactivarModoEdicion(form, 'Guardar paquete');
}

async function borrarPaquete(id) {
    if (!confirm('¿Eliminar este paquete?')) return;
    await eliminar('paquetes', id);
    cargarPaquetes();
}

document.getElementById('form-paquetes').addEventListener('submit', async e => {
    e.preventDefault();
    const form = new FormData(e.target);
    const datos = {
        nombre: form.get('nombre'),
        destino: form.get('destino'),
        descripcion: form.get('descripcion'),
        medioTransporte: form.get('medioTransporte'),
        precioBase: parseFloat(form.get('precioBase')),
        duracionDias: form.get('duracionDias') ? parseInt(form.get('duracionDias')) : null,
        cupoMaximo: form.get('cupoMaximo') ? parseInt(form.get('cupoMaximo')) : null
    };
    if (editandoPaqueteId) {
        await actualizar('paquetes', editandoPaqueteId, datos);
        cancelarEdicionPaquete();
    } else {
        await crear('paquetes', datos);
        e.target.reset();
    }
    cargarPaquetes();
});

/* ===== Proveedores ===== */

async function cargarProveedores() {
    proveedoresCache = await obtener('proveedores');
    const tbody = document.getElementById('tabla-proveedores');
    tbody.innerHTML = proveedoresCache.length ? proveedoresCache.map(p => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.telefono ?? ''}</td>
            <td>${p.notas ?? ''}</td>
            <td>
                <button class="editar" onclick="iniciarEdicionProveedor(${p.id})">Editar</button>
                <button class="borrar" onclick="borrarProveedor(${p.id})">Eliminar</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="4" class="vacio">Todavía no hay proveedores registrados</td></tr>';

    poblarSelect('select-proveedor', proveedoresCache, p => p.nombre, 'Sin definir todavía');
}

function iniciarEdicionProveedor(id) {
    const p = proveedoresCache.find(x => x.id === id);
    if (!p) return;
    const form = document.getElementById('form-proveedores');
    form.nombre.value = p.nombre || '';
    form.telefono.value = p.telefono || '';
    form.notas.value = p.notas || '';
    editandoProveedorId = id;
    activarModoEdicion(form, 'Actualizar proveedor', cancelarEdicionProveedor);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarEdicionProveedor() {
    editandoProveedorId = null;
    const form = document.getElementById('form-proveedores');
    form.reset();
    desactivarModoEdicion(form, 'Guardar proveedor');
}

async function borrarProveedor(id) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    await eliminar('proveedores', id);
    cargarProveedores();
}

document.getElementById('form-proveedores').addEventListener('submit', async e => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    if (editandoProveedorId) {
        await actualizar('proveedores', editandoProveedorId, datos);
        cancelarEdicionProveedor();
    } else {
        await crear('proveedores', datos);
        e.target.reset();
    }
    cargarProveedores();
});

/* ===== Reservas ===== */

function nombreCliente(id) {
    const c = clientesCache.find(x => x.id === id);
    return c ? c.nombre : `Cliente #${id}`;
}

function nombrePaquete(id) {
    const p = paquetesCache.find(x => x.id === id);
    return p ? p.nombre : `Paquete #${id}`;
}

const ETIQUETA_ESTADO = {
    COTIZADO: 'Cotizado', CONFIRMADO: 'Confirmado', PAGADO: 'Pagado', CANCELADO: 'Cancelado'
};

function selectorEstado(reserva) {
    const opciones = Object.keys(ETIQUETA_ESTADO).map(valor =>
        `<option value="${valor}" ${reserva.estado === valor ? 'selected' : ''}>${ETIQUETA_ESTADO[valor]}</option>`
    ).join('');
    return `<select class="sello sello-${reserva.estado.toLowerCase()}" onchange="cambiarEstado(${reserva.id}, this.value, this)">${opciones}</select>`;
}

async function cargarReservas() {
    reservasCache = await obtener('reservas');
    const tbody = document.getElementById('tabla-reservas');
    tbody.innerHTML = reservasCache.length ? reservasCache.map(r => `
        <tr>
            <td>${nombreCliente(r.cliente.id)}</td>
            <td>${nombrePaquete(r.paquete.id)}</td>
            <td>${r.fechaViaje ?? ''}</td>
            <td>${r.numPersonas}</td>
            <td class="precio">${r.precioTotal ? '$' + Number(r.precioTotal).toLocaleString('es-CO') : ''}</td>
            <td>${selectorEstado(r)}</td>
            <td><button class="borrar" onclick="borrarReserva(${r.id})">Eliminar</button></td>
        </tr>
    `).join('') : '<tr><td colspan="7" class="vacio">Todavía no hay reservas registradas</td></tr>';

    poblarSelect('select-reserva', reservasCache, r => `#${r.id} · ${nombreCliente(r.cliente.id)} · ${nombrePaquete(r.paquete.id)}`);
}

async function cambiarEstado(id, nuevoEstado, elementoSelect) {
    const reserva = reservasCache.find(r => r.id === id);
    if (!reserva) return;

    const datos = {
        fechaViaje: reserva.fechaViaje,
        numPersonas: reserva.numPersonas,
        precioTotal: reserva.precioTotal,
        estado: nuevoEstado
    };

    try {
        await actualizar('reservas', id, datos);
        elementoSelect.className = `sello sello-${nuevoEstado.toLowerCase()}`;
        reserva.estado = nuevoEstado;
    } catch (err) {
        alert('No se pudo actualizar el estado, intenta de nuevo.');
        cargarReservas();
    }
}

async function borrarReserva(id) {
    if (!confirm('¿Eliminar esta reserva?')) return;
    await eliminar('reservas', id);
    cargarReservas();
}

document.getElementById('form-reservas').addEventListener('submit', async e => {
    e.preventDefault();
    const form = new FormData(e.target);
    const datos = {
        cliente: { id: parseInt(form.get('cliente')) },
        paquete: { id: parseInt(form.get('paquete')) },
        proveedor: form.get('proveedor') ? { id: parseInt(form.get('proveedor')) } : null,
        fechaViaje: form.get('fechaViaje') || null,
        numPersonas: parseInt(form.get('numPersonas')),
        precioTotal: form.get('precioTotal') ? parseFloat(form.get('precioTotal')) : null,
        estado: form.get('estado')
    };
    try {
        await crear('reservas', datos);
        e.target.reset();
        cargarReservas();
    } catch (err) {
        alert('No se pudo guardar la reserva. Revisa que hayas elegido cliente y paquete.');
    }
});

/* ===== Pagos ===== */

async function cargarPagos() {
    const pagos = await obtener('pagos');
    const tbody = document.getElementById('tabla-pagos');
    tbody.innerHTML = pagos.length ? pagos.map(p => `
        <tr>
            <td>#${p.reserva.id}</td>
            <td class="precio">$${Number(p.monto).toLocaleString('es-CO')}</td>
            <td>${p.fecha}</td>
            <td>${p.metodoPago ?? ''}</td>
            <td><button class="borrar" onclick="borrarPago(${p.id})">Eliminar</button></td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="vacio">Todavía no hay pagos registrados</td></tr>';
}

async function borrarPago(id) {
    if (!confirm('¿Eliminar este pago?')) return;
    await eliminar('pagos', id);
    cargarPagos();
}

document.getElementById('form-pagos').addEventListener('submit', async e => {
    e.preventDefault();
    const form = new FormData(e.target);
    const datos = {
        reserva: { id: parseInt(form.get('reserva')) },
        monto: parseFloat(form.get('monto')),
        fecha: form.get('fecha'),
        metodoPago: form.get('metodoPago'),
        notas: form.get('notas')
    };
    try {
        await crear('pagos', datos);
        e.target.reset();
        cargarPagos();
    } catch (err) {
        alert('No se pudo guardar el pago. Revisa que hayas elegido una reserva.');
    }
});

/* ===== Carga inicial ===== */

async function iniciar() {
    await Promise.all([cargarClientes(), cargarPaquetes(), cargarProveedores()]);
    await cargarReservas();
    await cargarPagos();
}

iniciar();
