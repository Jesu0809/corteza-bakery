const { CotizacionInvalidaError } = require('./errores');

/**
 * Solicitud de cotizaciones a proveedores (antes de crear la orden de compra).
 * Reglas: el proveedor debe estar ACTIVO, cada ítem con cantidad y precio mayores que cero,
 * el total es la suma de cantidad × precio unitario y debe ser mayor que cero.
 */
class CotizacionService {
  constructor(repoCotizaciones, repoProveedores) {
    this.repo = repoCotizaciones;
    this.repoProveedores = repoProveedores;
  }

  static calcularTotal(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new CotizacionInvalidaError('La cotización debe tener al menos un insumo');
    }
    const total = items.reduce((suma, { cantidad, precioUnitario }) => {
      if (!(cantidad > 0)) throw new CotizacionInvalidaError('La cantidad debe ser mayor que cero');
      if (!(precioUnitario > 0)) throw new CotizacionInvalidaError('El monto debe ser mayor que cero');
      return suma + cantidad * precioUnitario;
    }, 0);
    return total;
  }

  async solicitar(nitProveedor, items) {
    const proveedor = await this.repoProveedores.buscarPorNit(nitProveedor);
    if (!proveedor || proveedor.estado !== 'ACTIVO') {
      throw new CotizacionInvalidaError('Solo se puede cotizar con proveedores activos');
    }
    const total = CotizacionService.calcularTotal(items);
    return this.repo.guardar({ nitProveedor, items, total, estado: 'SOLICITADA' });
  }
}

module.exports = CotizacionService;
