// Ejercicio 6 · Genera un reporte HTML de pruebas con iconos de Font Awesome 6
// a partir de los resultados reales de Jest (reportes/jest.json) y Cucumber (reportes/cucumber.json).
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, 'reportes');
const jest = JSON.parse(fs.readFileSync(path.join(dir, 'jest.json'), 'utf8'));
const cucumber = JSON.parse(fs.readFileSync(path.join(dir, 'cucumber.json'), 'utf8'));

const MODULOS = [
  [/proveedor/i, 'Proveedor', 'fa-truck-field'],
  [/cotizaci/i, 'Cotización', 'fa-file-invoice-dollar'],
  [/orden/i, 'Orden de compra', 'fa-cart-shopping'],
  [/inventario|insumo/i, 'Inventario', 'fa-boxes-stacked'],
];
const ESTADOS = {
  passed: ['Aprobada', 'fa-circle-check', '#166534'],
  failed: ['Fallida', 'fa-circle-xmark', '#b91c1c'],
  pending: ['Pendiente', 'fa-triangle-exclamation', '#a16207'],
};

const modulo = (texto) => MODULOS.find(([re]) => re.test(texto)) || [null, 'General', 'fa-gear'];
const filas = [];

for (const suite of jest.testResults) {
  for (const t of suite.assertionResults) {
    filas.push({ herramienta: 'Jest', modulo: modulo(`${path.basename(suite.name)} ${t.fullName}`), nombre: t.title, estado: t.status });
  }
}
for (const feature of cucumber) {
  for (const esc of feature.elements.filter((e) => e.type === 'scenario')) {
    const pasos = esc.steps.filter((s) => s.result);
    const estado = pasos.every((s) => s.result.status === 'passed') ? 'passed'
      : pasos.some((s) => s.result.status === 'failed') ? 'failed' : 'pending';
    filas.push({ herramienta: 'Cucumber', modulo: modulo(feature.uri + ' ' + feature.name), nombre: esc.name, estado });
  }
}

const total = filas.length;
const aprobadas = filas.filter((f) => f.estado === 'passed').length;
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Reporte de pruebas · Corteza ERP</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<style>
 body{font-family:Inter,Arial,sans-serif;background:#f5ede4;color:#1f1b17;margin:32px}
 h1{color:#681f33;margin:0 0 4px} p{margin:0 0 16px;color:#544245}
 table{border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden}
 th{background:#681f33;color:#fff;text-align:left;padding:10px} td{padding:9px 10px;border-bottom:1px solid #eadfd9}
 .chip{font-weight:600} i{width:20px;text-align:center}
</style></head><body>
<h1><i class="fa-solid fa-flask-vial"></i> Reporte de pruebas · Corteza ERP</h1>
<p>${aprobadas} de ${total} pruebas aprobadas · generado el ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>
<table><thead><tr><th>Estado</th><th>Módulo</th><th>Herramienta</th><th>Prueba</th></tr></thead><tbody>
${filas.map((f) => {
    const [txt, ico, color] = ESTADOS[f.estado] || ESTADOS.pending;
    return `<tr><td class="chip" style="color:${color}"><i class="fa-solid ${ico}"></i> ${txt}</td>`
      + `<td><i class="fa-solid ${f.modulo[2]}" style="color:#681f33"></i> ${f.modulo[1]}</td>`
      + `<td>${f.herramienta}</td><td>${f.nombre}</td></tr>`;
  }).join('\n')}
</tbody></table></body></html>`;

fs.writeFileSync(path.join(dir, 'reporte-pruebas.html'), html);
console.log(`Reporte generado: ${aprobadas}/${total} pruebas aprobadas`);
