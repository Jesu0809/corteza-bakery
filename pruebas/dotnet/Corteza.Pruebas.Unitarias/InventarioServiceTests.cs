using Corteza.Dominio;
using FluentAssertions;
using Moq;
using Xunit;

namespace Corteza.Pruebas.Unitarias;

public class InventarioServiceTests
{
    private readonly Mock<IRepositorioInventario> _repo = new();
    private readonly InventarioService _service;

    public InventarioServiceTests() => _service = new InventarioService(_repo.Object);

    [Fact(DisplayName = "Registra un insumo nuevo con stock cero y guarda una sola vez")]
    public void RegistraInsumoValido()
    {
        var insumo = _service.RegistrarInsumo("INS-001", "Harina de trigo", "bulto de 50 kg", 20);

        insumo.Stock.Should().Be(0);
        insumo.Estado.Should().Be("ACTIVO");
        _repo.Verify(r => r.Guardar(It.IsAny<Insumo>()), Times.Once);
    }

    [Fact(DisplayName = "Rechaza un código de insumo duplicado")]
    public void RechazaCodigoDuplicado()
    {
        _repo.Setup(r => r.ExistePorCodigo("INS-001")).Returns(true);

        var accion = () => _service.RegistrarInsumo("INS-001", "Harina", "bulto", 10);

        accion.Should().Throw<InsumoInvalidoException>().WithMessage("El código ya está registrado");
        _repo.Verify(r => r.Guardar(It.IsAny<Insumo>()), Times.Never);
    }

    [Theory(DisplayName = "Suma las entradas al stock")]
    [InlineData(40, 25, 65)]
    [InlineData(0, 10, 10)]
    public void SumaEntradas(int inicial, int entrada, int esperado)
    {
        _repo.Setup(r => r.BuscarPorCodigo("INS-001"))
             .Returns(new Insumo { Codigo = "INS-001", Nombre = "Harina", Unidad = "bulto", Stock = inicial });

        _service.RegistrarEntrada("INS-001", entrada).Stock.Should().Be(esperado);
    }

    [Fact(DisplayName = "Ejercicio 5: retirar más de lo disponible lanza StockInsuficienteException y el stock no cambia")]
    public void NoRetiraMasDeLoDisponible()
    {
        var leche = new Insumo { Codigo = "INS-002", Nombre = "Leche entera", Unidad = "bolsa", Stock = 2, Minimo = 15 };
        _repo.Setup(r => r.BuscarPorCodigo("INS-002")).Returns(leche);

        var accion = () => _service.Retirar("INS-002", 5);

        accion.Should().Throw<StockInsuficienteException>().WithMessage("Stock insuficiente");
        leche.Stock.Should().Be(2);
        _repo.Verify(r => r.Guardar(It.IsAny<Insumo>()), Times.Never);
    }

    [Fact(DisplayName = "Avisa reposición cuando el stock queda bajo el mínimo")]
    public void AvisaReposicion()
    {
        _repo.Setup(r => r.BuscarPorCodigo("INS-002"))
             .Returns(new Insumo { Codigo = "INS-002", Nombre = "Mantequilla", Unidad = "caja de 25 kg", Stock = 20, Minimo = 15 });

        var (insumo, alerta) = _service.Retirar("INS-002", 12);

        insumo.Stock.Should().Be(8);
        alerta.Should().BeTrue();
    }
}
