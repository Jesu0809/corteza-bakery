const { ProveedorInvalidoError, ProveedorConOrdenesActivasError } = require('./errores');

const REGEX_NIT = /^\d{9}(-\d)?$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Módulo 04 · Proveedores (CRUD).
 * Reglas: NIT único y válido, correo con formato correcto, nombre obligatorio,
 * no se desactiva un proveedor con órdenes de compra activas.
 */
class ProveedorService {
  constructor(repoProveedores, repoOrdenes) {
    this.repo = repoProveedores;
    this.repoOrdenes = repoOrdenes;
  }

  async registrar({ nit, nombre, correo, insumo }) {
    if (!nombre || !nombre.trim()) throw new ProveedorInvalidoError('El nombre es obligatorio');
    if (!REGEX_NIT.test(nit || '')) throw new ProveedorInvalidoError('El NIT no es válido');
    if (!REGEX_CORREO.test(correo || '')) throw new ProveedorInvalidoError('Formato de correo inválido');
    if (await this.repo.existePorNit(nit)) throw new ProveedorInvalidoError('El NIT ya está registrado');

    return this.repo.guardar({ nit, nombre: nombre.trim(), correo, insumo, estado: 'ACTIVO' });
  }

  async consultar(nit) {
    const proveedor = await this.repo.buscarPorNit(nit);
    if (!proveedor) throw new ProveedorInvalidoError('El proveedor no existe');
    return proveedor;
  }

  async actualizar(nit, cambios) {
    const proveedor = await this.consultar(nit);
    if (cambios.correo !== undefined && !REGEX_CORREO.test(cambios.correo)) {
      throw new ProveedorInvalidoError('Formato de correo inválido');
    }
    return this.repo.guardar({ ...proveedor, ...cambios, nit: proveedor.nit });
  }

  async desactivar(nit) {
    const proveedor = await this.consultar(nit);
    if (await this.repoOrdenes.tieneOrdenesActivas(nit)) {
      throw new ProveedorConOrdenesActivasError('No se puede desactivar: el proveedor tiene órdenes activas');
    }
    await this.repo.guardar({ ...proveedor, estado: 'INACTIVO' });
    return 'Proveedor desactivado';
  }
}

module.exports = ProveedorService;
