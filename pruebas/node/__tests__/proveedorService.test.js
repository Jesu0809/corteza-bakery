// Taller 1 · CRUD de Proveedores (Jest + mocks del repositorio)
const ProveedorService = require('../src/proveedorService');

describe('ProveedorService · Módulo 04 Proveedores', () => {
  let repo;
  let repoOrdenes;
  let service;

  beforeEach(() => {
    repo = {
      existePorNit: jest.fn().mockResolvedValue(false),
      buscarPorNit: jest.fn(),
      guardar: jest.fn(async (p) => ({ id: 1, ...p })),
    };
    repoOrdenes = { tieneOrdenesActivas: jest.fn().mockResolvedValue(false) };
    service = new ProveedorService(repo, repoOrdenes);
  });

  afterEach(() => jest.clearAllMocks());

  it('debería crear un proveedor con correo válido y estado ACTIVO', async () => {
    const creado = await service.registrar({
      nit: '900123456', nombre: 'Molinos del Valle', correo: 'ventas@molinosdelvalle.com', insumo: 'Harina de trigo',
    });

    expect(creado.estado).toBe('ACTIVO');
    expect(repo.guardar).toHaveBeenCalledTimes(1);
    expect(repo.guardar).toHaveBeenCalledWith(expect.objectContaining({ nit: '900123456', estado: 'ACTIVO' }));
  });

  it('debería rechazar un NIT duplicado sin guardar nada', async () => {
    repo.existePorNit.mockResolvedValue(true);

    await expect(service.registrar({ nit: '900123456', nombre: 'Otra', correo: 'b@b.com' }))
      .rejects.toThrow('El NIT ya está registrado');
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it.each(['', 'sin-arroba.com', 'usuario@', 'a b@c.com'])('debería rechazar el correo inválido "%s"', async (correo) => {
    await expect(service.registrar({ nit: '900999999', nombre: 'Prueba', correo }))
      .rejects.toThrow('Formato de correo inválido');
  });

  it('debería exigir el nombre del proveedor', async () => {
    await expect(service.registrar({ nit: '900999999', nombre: '  ', correo: 'a@a.com' }))
      .rejects.toThrow('El nombre es obligatorio');
  });

  it('debería actualizar el correo sin cambiar el NIT', async () => {
    repo.buscarPorNit.mockResolvedValue({ nit: '900123456', nombre: 'Molinos', correo: 'old@m.com', estado: 'ACTIVO' });

    const actualizado = await service.actualizar('900123456', { correo: 'nuevo@m.com', nit: '111' });

    expect(actualizado.correo).toBe('nuevo@m.com');
    expect(actualizado.nit).toBe('900123456');
  });

  it('debería desactivar un proveedor sin órdenes activas', async () => {
    repo.buscarPorNit.mockResolvedValue({ nit: '900123456', nombre: 'ACME', estado: 'ACTIVO' });

    const mensaje = await service.desactivar('900123456');

    expect(mensaje).toBe('Proveedor desactivado');
    expect(repo.guardar).toHaveBeenCalledWith(expect.objectContaining({ estado: 'INACTIVO' }));
  });

  it('no debería desactivar un proveedor con órdenes activas', async () => {
    repo.buscarPorNit.mockResolvedValue({ nit: '900123456', nombre: 'ACME', estado: 'ACTIVO' });
    repoOrdenes.tieneOrdenesActivas.mockResolvedValue(true);

    await expect(service.desactivar('900123456')).rejects.toThrow('tiene órdenes activas');
    expect(repo.guardar).not.toHaveBeenCalled();
  });
});
