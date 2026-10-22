// Taller 3 · Aprobación de órdenes de compra (Jest + mock del repositorio)
const OrdenCompraService = require('../src/ordenCompraService');

describe('OrdenCompraService · aprobación (Módulo 05 Compras)', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = {
      buscarPorId: jest.fn(),
      guardar: jest.fn(async (o) => o),
      obtenerPresupuesto: jest.fn().mockResolvedValue(10_000_000),
    };
    service = new OrdenCompraService(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  it('debería aprobar una orden dentro del presupuesto', async () => {
    mockRepo.buscarPorId.mockResolvedValue({ id: 'OC-1042', monto: 1_850_000, estado: 'PENDIENTE', nitProveedor: '900123456' });

    const orden = await service.aprobar('OC-1042');

    expect(orden.estado).toBe('APROBADA');
    expect(mockRepo.guardar).toHaveBeenCalledTimes(1);
  });

  it('debería rechazar una orden que excede el presupuesto', async () => {
    mockRepo.buscarPorId.mockResolvedValue({ id: 'OC-1050', monto: 15_000_000, estado: 'PENDIENTE' });

    await expect(service.aprobar('OC-1050')).rejects.toThrow('Presupuesto insuficiente');
    expect(mockRepo.guardar).not.toHaveBeenCalled();
  });

  it('no debería aprobar una orden ya aprobada', async () => {
    mockRepo.buscarPorId.mockResolvedValue({ id: 'OC-1041', monto: 450_000, estado: 'APROBADA' });

    await expect(service.aprobar('OC-1041')).rejects.toThrow('La orden ya está aprobada');
  });

  it('debería cancelar una orden pendiente guardando el motivo', async () => {
    mockRepo.buscarPorId.mockResolvedValue({ id: 'OC-1043', monto: 252_000, estado: 'PENDIENTE' });

    const orden = await service.cancelar('OC-1043', 'El proveedor no tiene leche esta semana');

    expect(orden.estado).toBe('CANCELADA');
    expect(orden.motivo).toBe('El proveedor no tiene leche esta semana');
  });

  it('no debería cancelar una orden sin motivo', async () => {
    mockRepo.buscarPorId.mockResolvedValue({ id: 'OC-1043', monto: 252_000, estado: 'PENDIENTE' });

    await expect(service.cancelar('OC-1043', '')).rejects.toThrow('Debe indicar el motivo');
  });
});
