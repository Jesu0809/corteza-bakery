// Casos de borde: validaciones que deben proteger los datos de la panadería
const ProveedorService = require('../src/proveedorService');
const OrdenCompraService = require('../src/ordenCompraService');
const InventarioService = require('../src/inventarioService');

describe('Casos de borde', () => {
  it('proveedor: rechaza un NIT con letras', async () => {
    const s = new ProveedorService({ existePorNit: jest.fn() }, {});
    await expect(s.registrar({ nit: '90012A456', nombre: 'X', correo: 'a@a.com' })).rejects.toThrow('El NIT no es válido');
  });

  it('proveedor: no actualiza con un correo inválido', async () => {
    const repo = { buscarPorNit: jest.fn().mockResolvedValue({ nit: '900123456' }), guardar: jest.fn() };
    const s = new ProveedorService(repo, {});
    await expect(s.actualizar('900123456', { correo: 'malo' })).rejects.toThrow('Formato de correo inválido');
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('proveedor: avisa cuando el proveedor no existe', async () => {
    const s = new ProveedorService({ buscarPorNit: jest.fn().mockResolvedValue(null) }, {});
    await expect(s.consultar('999999999')).rejects.toThrow('El proveedor no existe');
  });

  it('orden: avisa cuando la orden no existe', async () => {
    const s = new OrdenCompraService({ buscarPorId: jest.fn().mockResolvedValue(null) });
    await expect(s.aprobar('OC-0000')).rejects.toThrow('La orden no existe');
    await expect(s.cancelar('OC-0000', 'x')).rejects.toThrow('La orden no existe');
  });

  it('orden: no aprueba ni cancela una orden cancelada', async () => {
    const s = new OrdenCompraService({ buscarPorId: jest.fn().mockResolvedValue({ id: 'OC-1', estado: 'CANCELADA', monto: 1 }) });
    await expect(s.aprobar('OC-1')).rejects.toThrow('Solo se aprueban órdenes pendientes');
    await expect(s.cancelar('OC-1', 'motivo')).rejects.toThrow('Solo se cancelan órdenes pendientes');
  });

  it('inventario: exige código, nombre y unidad', async () => {
    const s = new InventarioService({ existePorCodigo: jest.fn() });
    await expect(s.registrarInsumo({ codigo: 'INS-9', nombre: 'Sal' })).rejects.toThrow('obligatorios');
  });

  it('inventario: no acepta una entrada en cero', async () => {
    const s = new InventarioService({});
    await expect(s.registrarEntrada('INS-1', 0)).rejects.toThrow('La cantidad debe ser mayor que cero');
  });
});
