// Taller 4 · Registro de insumos en inventario (Ejercicio 3 del taller)
const InventarioService = require('../src/inventarioService');

describe('InventarioService · Módulo 03 Inventarios', () => {
  let repo;
  let service;

  beforeEach(() => {
    repo = {
      existePorCodigo: jest.fn().mockResolvedValue(false),
      buscarPorCodigo: jest.fn(),
      guardar: jest.fn(async (i) => i),
    };
    service = new InventarioService(repo);
  });

  it('debería registrar un insumo válido llamando una sola vez a guardar', async () => {
    const insumo = await service.registrarInsumo({ codigo: 'INS-001', nombre: 'Harina de trigo', unidad: 'bulto de 50 kg', minimo: 20 });

    expect(insumo.stock).toBe(0);
    expect(insumo.estado).toBe('ACTIVO');
    expect(repo.guardar).toHaveBeenCalledTimes(1);
  });

  it('debería rechazar un insumo con código duplicado', async () => {
    repo.existePorCodigo.mockResolvedValue(true);

    await expect(service.registrarInsumo({ codigo: 'INS-001', nombre: 'Harina', unidad: 'bulto' }))
      .rejects.toThrow('El código ya está registrado');
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('debería sumar al stock una entrada de 25 bultos', async () => {
    repo.buscarPorCodigo.mockResolvedValue({ codigo: 'INS-001', stock: 40, minimo: 20 });

    const insumo = await service.registrarEntrada('INS-001', 25);

    expect(insumo.stock).toBe(65);
  });

  it('debería lanzar "Stock insuficiente" y no cambiar el stock', async () => {
    repo.buscarPorCodigo.mockResolvedValue({ codigo: 'INS-002', stock: 2, minimo: 15 });

    await expect(service.retirar('INS-002', 5)).rejects.toThrow('Stock insuficiente');
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('debería avisar reposición cuando el stock queda bajo el mínimo', async () => {
    repo.buscarPorCodigo.mockResolvedValue({ codigo: 'INS-002', stock: 20, minimo: 15 });

    const resultado = await service.retirar('INS-002', 12);

    expect(resultado.stock).toBe(8);
    expect(resultado.alertaReposicion).toBe(true);
  });
});
