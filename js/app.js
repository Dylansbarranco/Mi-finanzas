/*
  js/app.js — Lógica principal para MiFinanza (limpio y comentado)

  - Comentarios mejorados y consolidados.
  - Eliminadas secciones duplicadas y referencias a IA.
  - Mantiene: persistencia, CRUD, validaciones, estadísticas y gráfico.
*/

(function () {
  'use strict';

  // Clave en localStorage
  const STORAGE_KEY = 'mifinanza_movements';

  // Estado en memoria
  let movements = [];

  // Referencias al DOM (pueden ser null si no existen en la página)
  const form = document.getElementById('movimiento-form');
  const tipoInput = document.getElementById('tipo');
  const descripcionInput = document.getElementById('descripcion');
  const montoInput = document.getElementById('monto');
  const movimientosList = document.getElementById('movimientos-list');

  // Elementos de totales/estadísticas (opcional)
  const balanceEl = document.getElementById('balance');
  const totalIngresosEl = document.getElementById('total-ingresos');
  const totalEgresosEl = document.getElementById('total-egresos');
  const statsCountEl = document.getElementById('stats-count');
  const avgIngresoEl = document.getElementById('avg-ingreso');
  const avgEgresoEl = document.getElementById('avg-egreso');

  // Canvas para gráfico (opcional)
  const chartCanvas = document.getElementById('chart-distribution');
  const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;

  // Formateador de moneda (configurable)
  const currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  });

  /* ---------- Persistencia ---------- */

  // Carga segura desde localStorage
  function loadMovements() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error leyendo localStorage:', err);
      return [];
    }
  }

  // Guarda el estado actual en localStorage
  function saveMovements() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movements));
    } catch (err) {
      console.error('Error guardando en localStorage:', err);
    }
  }

  /* ---------- Renderizado de lista ---------- */

  // Renderiza todas las filas de la tabla de movimientos
  function renderMovements() {
    if (!movimientosList) return;

    movimientosList.innerHTML = '';

    if (!movements || movements.length === 0) {
      const tr = document.createElement('tr');
      tr.className = 'empty-row';
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = 'No hay movimientos registrados.';
      tr.appendChild(td);
      movimientosList.appendChild(tr);
      updateTotalsAndStats();
      return;
    }

    movements.forEach((m) => {
      const tr = document.createElement('tr');

      // Fecha
      const tdFecha = document.createElement('td');
      tdFecha.textContent = new Date(m.date).toLocaleString();
      tr.appendChild(tdFecha);

      // Tipo
      const tdTipo = document.createElement('td');
      tdTipo.textContent = m.type === 'ingreso' ? 'Ingreso' : 'Egreso';
      tr.appendChild(tdTipo);

      // Descripción
      const tdDesc = document.createElement('td');
      tdDesc.textContent = m.description;
      tr.appendChild(tdDesc);

      // Monto
      const tdMonto = document.createElement('td');
      tdMonto.textContent = currencyFormatter.format(m.amount);
      tdMonto.style.fontWeight = '600';
      tdMonto.style.color = m.type === 'ingreso'
        ? (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#10b981')
        : (getComputedStyle(document.documentElement).getPropertyValue('--danger') || '#ef4444');
      tr.appendChild(tdMonto);

      // Acciones: botón eliminar
      const tdAcc = document.createElement('td');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Eliminar';
      btn.className = 'btn-delete';
      btn.setAttribute('data-id', m.id);
      tdAcc.appendChild(btn);
      tr.appendChild(tdAcc);

      movimientosList.appendChild(tr);
    });

    updateTotalsAndStats();
  }

  /* ---------- Cálculos y estadísticas ---------- */

  // Calcula totales, promedios y actualiza elementos visibles
  function updateTotalsAndStats() {
    const totalIngresos = movements.filter(m => m.type === 'ingreso').reduce((s, m) => s + Number(m.amount), 0);
    const totalEgresos = movements.filter(m => m.type === 'egreso').reduce((s, m) => s + Number(m.amount), 0);
    const balance = totalIngresos - totalEgresos;

    if (totalIngresosEl) totalIngresosEl.textContent = currencyFormatter.format(totalIngresos);
    if (totalEgresosEl) totalEgresosEl.textContent = currencyFormatter.format(totalEgresos);
    if (balanceEl) balanceEl.textContent = currencyFormatter.format(balance);

    const totalCount = movements.length;
    const ingresos = movements.filter(m => m.type === 'ingreso').map(m => Number(m.amount));
    const egresos = movements.filter(m => m.type === 'egreso').map(m => Number(m.amount));

    const avgIngreso = ingresos.length ? ingresos.reduce((a,b) => a+b,0)/ingresos.length : 0;
    const avgEgreso = egresos.length ? egresos.reduce((a,b) => a+b,0)/egresos.length : 0;

    if (statsCountEl) statsCountEl.textContent = String(totalCount);
    if (avgIngresoEl) avgIngresoEl.textContent = currencyFormatter.format(avgIngreso);
    if (avgEgresoEl) avgEgresoEl.textContent = currencyFormatter.format(avgEgreso);

    if (chartCtx) drawPieChart(chartCtx, totalIngresos, totalEgresos);
  }

  // Dibuja un pie chart simple en el canvas (sin dependencias)
  function drawPieChart(ctx, ingresos, egresos) {
    const total = ingresos + egresos;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 8;

    ctx.clearRect(0, 0, w, h);

    if (total <= 0) {
      ctx.beginPath();
      ctx.fillStyle = '#f3f4f6';
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos', cx, cy + 4);
      return;
    }

    const sliceIngreso = ingresos / total;
    const sliceEgreso = egresos / total;

    const accent = (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#10b981').trim();
    const danger = (getComputedStyle(document.documentElement).getPropertyValue('--danger') || '#ef4444').trim();

    let start = -Math.PI / 2;
    let end = start + sliceIngreso * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.fillStyle = accent;
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();

    start = end;
    end = start + sliceEgreso * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.fillStyle = danger;
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    const pctIngreso = Math.round((ingresos / total) * 100);
    ctx.fillText(`${pctIngreso}% ingresos`, cx, cy + 4);
  }

  /* ---------- CRUD ---------- */

  // Añade un movimiento y actualiza vista/persistencia
  function addMovement({ type, description, amount }) {
    const movement = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      description,
      amount: Number(amount),
    };
    movements.unshift(movement);
    saveMovements();
    renderMovements();
  }

  // Elimina por id si existe
  function deleteMovement(id) {
    const prevLen = movements.length;
    movements = movements.filter(m => m.id !== id);
    if (movements.length !== prevLen) {
      saveMovements();
      renderMovements();
    }
  }

  /* ---------- Validaciones ---------- */

  // Valida payload del formulario
  function validateForm({ type, description, amount }) {
    if (!type || (type !== 'ingreso' && type !== 'egreso')) return { ok:false, msg:'Seleccione un tipo válido (ingreso/egreso).' };
    if (!description || description.trim().length < 1) return { ok:false, msg:'La descripción es obligatoria.' };
    if (amount === '' || amount === null || isNaN(Number(amount))) return { ok:false, msg:'El monto debe ser un número válido.' };
    if (Number(amount) <= 0) return { ok:false, msg:'El monto debe ser mayor que cero.' };
    return { ok:true };
  }

  /* ---------- Eventos ---------- */

  function onFormSubmit(e) {
    e.preventDefault();
    if (!tipoInput || !descripcionInput || !montoInput) return;

    const payload = {
      type: tipoInput.value,
      description: descripcionInput.value.trim(),
      amount: montoInput.value,
    };

    const valid = validateForm(payload);
    if (!valid.ok) { alert(valid.msg); return; }

    addMovement(payload);
    descripcionInput.value = '';
    montoInput.value = '';
    descripcionInput.focus();
  }

  function onTableClick(e) {
    const t = e.target;
    if (t && t.matches('button.btn-delete')) {
      const id = t.getAttribute('data-id');
      if (!id) return;
      if (confirm('¿Eliminar este movimiento?')) deleteMovement(id);
    }
  }

  /* ---------- Inicialización ---------- */

  function initCanvasScaling() {
    if (!chartCanvas || !chartCtx) return;
    const DPR = window.devicePixelRatio || 1;
    const rect = chartCanvas.getBoundingClientRect();
    chartCanvas.width = rect.width * DPR;
    chartCanvas.height = (rect.height || 150) * DPR;
    chartCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function init() {
    movements = loadMovements();
    renderMovements();

    if (form) form.addEventListener('submit', onFormSubmit);
    if (movimientosList) movimientosList.addEventListener('click', onTableClick);
    initCanvasScaling();

    // Reescalar canvas si se cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
      initCanvasScaling();
      updateTotalsAndStats();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
