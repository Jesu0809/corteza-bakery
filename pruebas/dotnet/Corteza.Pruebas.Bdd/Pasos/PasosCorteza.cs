using Corteza.Dominio;
using FluentAssertions;
using Reqnroll;

namespace Corteza.Pruebas.Bdd.Pasos;

/// <summary>
/// Step definitions de Reqnroll (sucesor de SpecFlow) para inventario.feature y ordenes_compra.feature.
/// </summary>
[Binding]
public class PasosCorteza
{
    private readonly RepositorioInventarioMemoria _inventario = new();
    private readonly RepositorioOrdenesMemoria _ordenes = new();
    private string? _mensaje;

    private void Ejecutar(Action accion)
    {
        try { accion(); _mensaje = null; }
        catch (Exception e) { _mensaje = e.Message; }
    }

    // ---------- Comunes ----------
    [Then(@"el sistema muestra el mensaje ""(.*)""")]
    public void ElSistemaMuestraElMensaje(string mensaje) => _mensaje.Should().Be(mensaje);

    // ---------- Inventario ----------
    [Given(@"que no existe un insumo con código ""(.*)""")]
    public void NoExisteInsumo(string codigo) => _inventario.ExistePorCodigo(codigo).Should().BeFalse();

    [Given(@"que existe el insumo ""(.*)"" con stock (\d+) y mínimo (\d+)")]
    public void ExisteInsumo(string codigo, int stock, int minimo) =>
        _inventario.Guardar(new Insumo { Codigo = codigo, Nombre = "Insumo", Unidad = "unidad", Stock = stock, Minimo = minimo });

    [When(@"registro el insumo ""(.*)"" ""(.*)"" en ""(.*)"" con mínimo (\d+)")]
    public void RegistroInsumo(string codigo, string nombre, string unidad, int minimo) =>
        Ejecutar(() => new InventarioService(_inventario).RegistrarInsumo(codigo, nombre, unidad, minimo));

    [When(@"registro una ""(.*)"" de (\d+) unidades del insumo ""(.*)""")]
    public void RegistroMovimiento(string movimiento, int cantidad, string codigo) =>
        Ejecutar(() =>
        {
            var servicio = new InventarioService(_inventario);
            if (movimiento == "entrada") servicio.RegistrarEntrada(codigo, cantidad);
            else servicio.Retirar(codigo, cantidad);
        });

    [Then(@"el insumo ""(.*)"" queda con stock (\d+) y estado ""(.*)""")]
    public void QuedaConStockYEstado(string codigo, int stock, string estado)
    {
        var insumo = _inventario.BuscarPorCodigo(codigo)!;
        insumo.Stock.Should().Be(stock);
        insumo.Estado.Should().Be(estado);
    }

    [Then(@"el insumo ""([^""]*)"" queda con stock (\d+)$")]
    public void QuedaConStock(string codigo, int stock) => _inventario.BuscarPorCodigo(codigo)!.Stock.Should().Be(stock);

    // ---------- Órdenes de compra ----------
    [Given(@"que el presupuesto de compras es (\d+) pesos")]
    public void Presupuesto(int presupuesto) => _ordenes.Presupuesto = presupuesto;

    [Given(@"que existe la orden ""(.*)"" por (\d+) pesos en estado ""(.*)""")]
    public void ExisteOrden(string id, int monto, string estado) =>
        _ordenes.Guardar(new OrdenCompra { Id = id, Monto = monto, Estado = estado });

    [When(@"apruebo la orden ""(.*)""")]
    public void ApruebaOrden(string id) => Ejecutar(() => new OrdenCompraService(_ordenes).Aprobar(id));

    [When(@"cancelo la orden ""(.*)"" con el motivo ""(.*)""")]
    public void CancelaOrden(string id, string motivo) => Ejecutar(() => new OrdenCompraService(_ordenes).Cancelar(id, motivo));

    [Then(@"la orden ""(.*)"" queda en estado ""(.*)""")]
    public void OrdenQuedaEnEstado(string id, string estado) => _ordenes.BuscarPorId(id)!.Estado.Should().Be(estado);
}
