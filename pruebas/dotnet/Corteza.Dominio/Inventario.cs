namespace Corteza.Dominio;

public class Insumo
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public required string Unidad { get; init; }
    public int Minimo { get; init; }
    public int Stock { get; set; }
    public string Estado { get; set; } = "ACTIVO";
}

public class InsumoInvalidoException(string mensaje) : Exception(mensaje);
public class StockInsuficienteException(string mensaje) : Exception(mensaje);

public interface IRepositorioInventario
{
    bool ExistePorCodigo(string codigo);
    Insumo? BuscarPorCodigo(string codigo);
    void Guardar(Insumo insumo);
}

public class RepositorioInventarioMemoria : IRepositorioInventario
{
    private readonly Dictionary<string, Insumo> _datos = new();
    public bool ExistePorCodigo(string codigo) => _datos.ContainsKey(codigo);
    public Insumo? BuscarPorCodigo(string codigo) => _datos.GetValueOrDefault(codigo);
    public void Guardar(Insumo insumo) => _datos[insumo.Codigo] = insumo;
}

/// <summary>
/// Módulo 03 · Inventarios de Corteza ERP: registro de insumos, entradas y salidas de stock.
/// </summary>
public class InventarioService(IRepositorioInventario repositorio)
{
    public Insumo RegistrarInsumo(string codigo, string nombre, string unidad, int minimo)
    {
        if (string.IsNullOrWhiteSpace(codigo) || string.IsNullOrWhiteSpace(nombre) || string.IsNullOrWhiteSpace(unidad))
            throw new InsumoInvalidoException("Código, nombre y unidad son obligatorios");
        if (repositorio.ExistePorCodigo(codigo))
            throw new InsumoInvalidoException("El código ya está registrado");

        var insumo = new Insumo { Codigo = codigo, Nombre = nombre, Unidad = unidad, Minimo = minimo, Stock = 0 };
        repositorio.Guardar(insumo);
        return insumo;
    }

    public Insumo RegistrarEntrada(string codigo, int cantidad)
    {
        if (cantidad <= 0) throw new InsumoInvalidoException("La cantidad debe ser mayor que cero");
        var insumo = Buscar(codigo);
        insumo.Stock += cantidad;
        repositorio.Guardar(insumo);
        return insumo;
    }

    public (Insumo Insumo, bool AlertaReposicion) Retirar(string codigo, int cantidad)
    {
        var insumo = Buscar(codigo);
        if (cantidad > insumo.Stock) throw new StockInsuficienteException("Stock insuficiente");
        insumo.Stock -= cantidad;
        repositorio.Guardar(insumo);
        return (insumo, insumo.Stock < insumo.Minimo);
    }

    private Insumo Buscar(string codigo) =>
        repositorio.BuscarPorCodigo(codigo) ?? throw new InsumoInvalidoException("El insumo no existe");
}
