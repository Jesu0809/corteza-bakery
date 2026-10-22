// Step definitions de Cucumber-JS: conectan los escenarios Gherkin con los servicios de Corteza.
const assert = require('node:assert/strict');
const { Given, When, Then, Before, setWorldConstructor } = require('@cucumber/cucumber');
const ProveedorService = require('../../src/proveedorService');
const CotizacionService = require('../../src/cotizacionService');
const OrdenCompraService = require('../../src/ordenCompraService');
const InventarioService = require('../../src/inventarioService');
const {
  RepoProveedoresMemoria, RepoOrdenesMemoria, RepoCotizacionesMemoria, RepoInventarioMemoria,
} = require('../../src/repositoriosMemoria');

class MundoCorteza {
  constructor() {
    this.repoProveedores = new RepoProveedoresMemoria();
    this.repoOrdenes = new RepoOrdenesMemoria();
    this.repoCotizaciones = new RepoCotizacionesMemoria();
    this.repoInventario = new RepoInventarioMemoria();
    this.proveedores = new ProveedorService(this.repoProveedores, this.repoOrdenes);
    this.cotizaciones = new CotizacionService(this.repoCotizaciones, this.repoProveedores);
    this.ordenes = new OrdenCompraService(this.repoOrdenes);
    this.inventario = new InventarioService(this.repoInventario);
    this.mensaje = null;
    this.resultado = null;
  }

  async ejecutar(accion, mensajeExito) {
    try {
      this.resultado = await accion();
      this.mensaje = mensajeExito ?? (typeof this.resultado === 'string' ? this.resultado : null);
    } catch (error) {
      this.mensaje = error.message;
    }
  }
}
setWorldConstructor(MundoCorteza);

Before(function () { this.mensaje = null; });

// ---------- Comunes ----------
Given('que el usuario {string} con rol {string} ha iniciado sesión', function (nombre, rol) {
  this.usuario = { nombre, rol };
});

Then('el sistema muestra el mensaje {string}', function (mensaje) {
  assert.equal(this.mensaje, mensaje);
});

// ---------- Proveedores ----------
Given('que no existe un proveedor con NIT {string}', async function (nit) {
  assert.equal(await this.repoProveedores.existePorNit(nit), false);
});

Given('que ya existe un proveedor con NIT {string}', async function (nit) {
  await this.repoProveedores.guardar({ nit, nombre: 'Molinos del Valle', correo: 'ventas@molinos.com', estado: 'ACTIVO' });
});

Given('el proveedor {string} no tiene órdenes de compra activas', function (nit) {
  this.repoOrdenes.activas.delete(nit);
});

Given('el proveedor {string} tiene órdenes de compra activas', function (nit) {
  this.repoOrdenes.activas.add(nit);
});

When('registro el proveedor con NIT {string}, nombre {string} y correo {string}', async function (nit, nombre, correo) {
  await this.ejecutar(() => this.proveedores.registrar({ nit, nombre, correo }), 'Proveedor registrado exitosamente');
  this.nitActual = nit;
});

When('solicito desactivar el proveedor {string}', async function (nit) {
  this.nitActual = nit;
  await this.ejecutar(() => this.proveedores.desactivar(nit));
});

Then('el proveedor queda con estado {string}', async function (estado) {
  const proveedor = await this.repoProveedores.buscarPorNit(this.nitActual);
  assert.equal(proveedor.estado, estado);
});

Then('solo existe un proveedor con NIT {string}', async function (nit) {
  const proveedor = await this.repoProveedores.buscarPorNit(nit);
  assert.equal(proveedor.nombre, 'Molinos del Valle');
});

// ---------- Cotizaciones ----------
Given('que el proveedor {string} está {string}', async function (nit, estado) {
  await this.repoProveedores.guardar({ nit, nombre: `Proveedor ${nit}`, correo: 'p@p.com', estado });
});

When('solicito una cotización al proveedor {string} por {int} unidades a {int} pesos', async function (nit, cantidad, precio) {
  await this.ejecutar(() => this.cotizaciones.solicitar(nit, [{ cantidad, precioUnitario: precio }]), 'Cotización solicitada');
});

Then('la cotización queda en estado {string}', function (estado) {
  assert.equal(this.resultado.estado, estado);
});

Then('el total de la cotización es {int} pesos', function (total) {
  assert.equal(this.resultado.total, total);
});

// ---------- Órdenes de compra ----------
Given('que el presupuesto de compras es {int} pesos', function (presupuesto) {
  this.repoOrdenes.presupuesto = presupuesto;
});

Given('que existe la orden {string} por {int} pesos en estado {string}', async function (id, monto, estado) {
  await this.repoOrdenes.guardar({ id, monto, estado });
});

When('apruebo la orden {string}', async function (id) {
  await this.ejecutar(() => this.ordenes.aprobar(id), 'Orden aprobada');
});

When('cancelo la orden {string} con el motivo {string}', async function (id, motivo) {
  await this.ejecutar(() => this.ordenes.cancelar(id, motivo), 'Orden cancelada');
});

Then('la orden {string} queda en estado {string}', async function (id, estado) {
  const orden = await this.repoOrdenes.buscarPorId(id);
  assert.equal(orden.estado, estado);
});

// ---------- Inventario ----------
Given('que no existe un insumo con código {string}', async function (codigo) {
  assert.equal(await this.repoInventario.existePorCodigo(codigo), false);
});

Given('que existe el insumo {string} con stock {int} y mínimo {int}', async function (codigo, stock, minimo) {
  await this.repoInventario.guardar({ codigo, nombre: 'Insumo', unidad: 'unidad', stock, minimo, estado: 'ACTIVO' });
});

When('registro el insumo {string} {string} en {string} con mínimo {int}', async function (codigo, nombre, unidad, minimo) {
  await this.ejecutar(() => this.inventario.registrarInsumo({ codigo, nombre, unidad, minimo }), 'Insumo registrado');
});

When('registro una {string} de {int} unidades del insumo {string}', async function (movimiento, cantidad, codigo) {
  const accion = movimiento === 'entrada'
    ? () => this.inventario.registrarEntrada(codigo, cantidad)
    : () => this.inventario.retirar(codigo, cantidad);
  await this.ejecutar(accion, 'Movimiento registrado');
});

Then('el insumo {string} queda con stock {int} y estado {string}', async function (codigo, stock, estado) {
  const insumo = await this.repoInventario.buscarPorCodigo(codigo);
  assert.equal(insumo.stock, stock);
  assert.equal(insumo.estado, estado);
});

Then('el insumo {string} queda con stock {int}', async function (codigo, stock) {
  const insumo = await this.repoInventario.buscarPorCodigo(codigo);
  assert.equal(insumo.stock, stock);
});
