const { InsumoInvalidoError, StockInsuficienteError } = require('./errores');

/**
 * Módulo 03 · Inventarios — registro de insumos y movimientos de stock.
 * Reglas: código único, unidad de medida obligatoria, stock inicial en cero,
 * no se puede retirar más de lo disponible y se avisa cuando el stock baja del mínimo.
 */
class InventarioService {
  constructor(repo) {
    this.repo = repo;
  }

  async registrarInsumo({ codigo, nombre, unidad, minimo = 0 }) {
    if (!codigo || !nombre || !unidad) throw new InsumoInvalidoError('Código, nombre y unidad son obligatorios');
    if (await this.repo.existePorCodigo(codigo)) throw new InsumoInvalidoError('El código ya está registrado');
    return this.repo.guardar({ codigo, nombre, unidad, minimo, stock: 0, estado: 'ACTIVO' });
  }

  async registrarEntrada(codigo, cantidad) {
    if (!(cantidad > 0)) throw new InsumoInvalidoError('La cantidad debe ser mayor que cero');
    const insumo = await this.repo.buscarPorCodigo(codigo);
    return this.repo.guardar({ ...insumo, stock: insumo.stock + cantidad });
  }

  async retirar(codigo, cantidad) {
    const insumo = await this.repo.buscarPorCodigo(codigo);
    if (cantidad > insumo.stock) throw new StockInsuficienteError('Stock insuficiente');
    const actualizado = await this.repo.guardar({ ...insumo, stock: insumo.stock - cantidad });
    return { ...actualizado, alertaReposicion: actualizado.stock < actualizado.minimo };
  }
}

module.exports = InventarioService;
