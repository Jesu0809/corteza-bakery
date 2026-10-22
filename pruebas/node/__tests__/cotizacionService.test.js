// Taller 2 · Solicitud de cotizaciones (Jest)
const CotizacionService = require('../src/cotizacionService');

describe('CotizacionService · cálculo del total', () => {
  it.each([
    [[{ cantidad: 20, precioUnitario: 92_500 }], 1_850_000],
    [[{ cantidad: 60, precioUnitario: 4_200 }, { cantidad: 8, precioUnitario: 185_000 }], 1_732_000],
    [[{ cantidad: 1, precioUnitario: 1 }], 1],
  ])('debería calcular el total de %j como %d', (items, esperado) => {
    expect(CotizacionService.calcularTotal(items)).toBe(esperado);
  });

  it('debería rechazar una cantidad en cero', () => {
    expect(() => CotizacionService.calcularTotal([{ cantidad: 0, precioUnitario: 4_200 }]))
      .toThrow('La cantidad debe ser mayor que cero');
  });

  it('debería rechazar un monto en cero', () => {
    expect(() => CotizacionService.calcularTotal([{ cantidad: 10, precioUnitario: 0 }]))
      .toThrow('El monto debe ser mayor que cero');
  });

  it('debería rechazar una cotización sin insumos', () => {
    expect(() => CotizacionService.calcularTotal([])).toThrow('al menos un insumo');
  });
});

describe('CotizacionService · solicitud al proveedor', () => {
  let repo;
  let repoProveedores;
  let service;

  beforeEach(() => {
    repo = { guardar: jest.fn(async (c) => ({ id: 7, ...c })) };
    repoProveedores = { buscarPorNit: jest.fn() };
    service = new CotizacionService(repo, repoProveedores);
  });

  it('debería guardar la cotización como SOLICITADA con su total', async () => {
    repoProveedores.buscarPorNit.mockResolvedValue({ nit: '900123456', estado: 'ACTIVO' });

    const cot = await service.solicitar('900123456', [{ cantidad: 20, precioUnitario: 92_500 }]);

    expect(cot.estado).toBe('SOLICITADA');
    expect(cot.total).toBe(1_850_000);
    expect(repo.guardar).toHaveBeenCalledTimes(1);
  });

  it('no debería cotizar con un proveedor inactivo', async () => {
    repoProveedores.buscarPorNit.mockResolvedValue({ nit: '900890123', estado: 'INACTIVO' });

    await expect(service.solicitar('900890123', [{ cantidad: 1, precioUnitario: 100 }]))
      .rejects.toThrow('Solo se puede cotizar con proveedores activos');
    expect(repo.guardar).not.toHaveBeenCalled();
  });
});
