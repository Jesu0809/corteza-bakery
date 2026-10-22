namespace Corteza.Dominio;

public class OrdenCompra
{
    public required string Id { get; init; }
    public long Monto { get; init; }
    public string Estado { get; set; } = "PENDIENTE";
    public string? Motivo { get; set; }
}

public class OrdenCompraException(string mensaje) : Exception(mensaje);

public interface IRepositorioOrdenes
{
    OrdenCompra? BuscarPorId(string id);
    long ObtenerPresupuesto();
    void Guardar(OrdenCompra orden);
}

public class RepositorioOrdenesMemoria : IRepositorioOrdenes
{
    private readonly Dictionary<string, OrdenCompra> _datos = new();
    public long Presupuesto { get; set; } = 10_000_000;
    public OrdenCompra? BuscarPorId(string id) => _datos.GetValueOrDefault(id);
    public long ObtenerPresupuesto() => Presupuesto;
    public void Guardar(OrdenCompra orden) => _datos[orden.Id] = orden;
}

/// <summary>
/// Módulo 05 · Compras: aprobación y cancelación de órdenes de compra de insumos.
/// </summary>
public class OrdenCompraService(IRepositorioOrdenes repositorio)
{
    public OrdenCompra Aprobar(string id)
    {
        var orden = repositorio.BuscarPorId(id) ?? throw new OrdenCompraException("La orden no existe");
        if (orden.Estado == "APROBADA") throw new OrdenCompraException("La orden ya está aprobada");
        if (orden.Estado != "PENDIENTE") throw new OrdenCompraException("Solo se aprueban órdenes pendientes");
        if (orden.Monto > repositorio.ObtenerPresupuesto()) throw new OrdenCompraException("Presupuesto insuficiente");

        orden.Estado = "APROBADA";
        repositorio.Guardar(orden);
        return orden;
    }

    public OrdenCompra Cancelar(string id, string motivo)
    {
        var orden = repositorio.BuscarPorId(id) ?? throw new OrdenCompraException("La orden no existe");
        if (string.IsNullOrWhiteSpace(motivo)) throw new OrdenCompraException("Debe indicar el motivo de la cancelación");
        if (orden.Estado != "PENDIENTE") throw new OrdenCompraException("Solo se cancelan órdenes pendientes");

        orden.Estado = "CANCELADA";
        orden.Motivo = motivo.Trim();
        repositorio.Guardar(orden);
        return orden;
    }
}
