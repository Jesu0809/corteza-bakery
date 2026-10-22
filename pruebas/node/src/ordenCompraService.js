const { OrdenCompraError } = require('./errores');

/**
 * Módulo 05 · Compras — aprobación de órdenes de compra.
 * Estados: PENDIENTE → APROBADA → RECIBIDA, o CANCELADA.
 * Reglas: no se aprueba una orden que excede el presupuesto, ni una ya aprobada;
 * solo se cancela una orden PENDIENTE y con motivo.
 */
class OrdenCompraService {
  constructor(repo) {
    this.repo = repo;
  }

  async aprobar(id) {
    const orden = await this.repo.buscarPorId(id);
    if (!orden) throw new OrdenCompraError('La orden no existe');
    if (orden.estado === 'APROBADA') throw new OrdenCompraError('La orden ya está aprobada');
    if (orden.estado !== 'PENDIENTE') throw new OrdenCompraError('Solo se aprueban órdenes pendientes');

    const presupuesto = await this.repo.obtenerPresupuesto();
    if (orden.monto > presupuesto) throw new OrdenCompraError('Presupuesto insuficiente');

    return this.repo.guardar({ ...orden, estado: 'APROBADA' });
  }

  async cancelar(id, motivo) {
    const orden = await this.repo.buscarPorId(id);
    if (!orden) throw new OrdenCompraError('La orden no existe');
    if (!motivo || !motivo.trim()) throw new OrdenCompraError('Debe indicar el motivo de la cancelación');
    if (orden.estado !== 'PENDIENTE') throw new OrdenCompraError('Solo se cancelan órdenes pendientes');
    return this.repo.guardar({ ...orden, estado: 'CANCELADA', motivo: motivo.trim() });
  }
}

module.exports = OrdenCompraService;
