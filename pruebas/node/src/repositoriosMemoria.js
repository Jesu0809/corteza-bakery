// Repositorios en memoria: reemplazan a SQL Server durante las pruebas.
class RepoProveedoresMemoria {
  constructor() { this.datos = new Map(); }
  async existePorNit(nit) { return this.datos.has(nit); }
  async buscarPorNit(nit) { return this.datos.get(nit) || null; }
  async guardar(p) { this.datos.set(p.nit, { ...p }); return { ...p }; }
}

class RepoOrdenesMemoria {
  constructor() { this.activas = new Set(); this.ordenes = new Map(); this.presupuesto = 10_000_000; }
  async tieneOrdenesActivas(nit) { return this.activas.has(nit); }
  async buscarPorId(id) { return this.ordenes.get(id) || null; }
  async obtenerPresupuesto() { return this.presupuesto; }
  async guardar(o) { this.ordenes.set(o.id, { ...o }); return { ...o }; }
}

class RepoCotizacionesMemoria {
  constructor() { this.datos = []; }
  async guardar(c) { const nueva = { id: this.datos.length + 1, ...c }; this.datos.push(nueva); return nueva; }
}

class RepoInventarioMemoria {
  constructor() { this.datos = new Map(); }
  async existePorCodigo(c) { return this.datos.has(c); }
  async buscarPorCodigo(c) { return { ...this.datos.get(c) }; }
  async guardar(i) { this.datos.set(i.codigo, { ...i }); return { ...i }; }
}

module.exports = { RepoProveedoresMemoria, RepoOrdenesMemoria, RepoCotizacionesMemoria, RepoInventarioMemoria };
