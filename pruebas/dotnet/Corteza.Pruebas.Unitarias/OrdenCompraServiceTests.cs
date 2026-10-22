using Corteza.Dominio;
using FluentAssertions;
using Moq;
using Xunit;

namespace Corteza.Pruebas.Unitarias;

public class OrdenCompraServiceTests
{
    private readonly Mock<IRepositorioOrdenes> _repo = new();
    private readonly OrdenCompraService _service;

    public OrdenCompraServiceTests()
    {
        _repo.Setup(r => r.ObtenerPresupuesto()).Returns(10_000_000);
        _service = new OrdenCompraService(_repo.Object);
    }

    [Fact(DisplayName = "Aprueba una orden dentro del presupuesto")]
    public void ApruebaDentroDelPresupuesto()
    {
        _repo.Setup(r => r.BuscarPorId("OC-1042")).Returns(new OrdenCompra { Id = "OC-1042", Monto = 1_850_000 });

        _service.Aprobar("OC-1042").Estado.Should().Be("APROBADA");
        _repo.Verify(r => r.Guardar(It.IsAny<OrdenCompra>()), Times.Once);
    }

    [Fact(DisplayName = "Rechaza una orden que excede el presupuesto")]
    public void RechazaSiExcedePresupuesto()
    {
        _repo.Setup(r => r.BuscarPorId("OC-1050")).Returns(new OrdenCompra { Id = "OC-1050", Monto = 15_000_000 });

        var accion = () => _service.Aprobar("OC-1050");

        accion.Should().Throw<OrdenCompraException>().WithMessage("Presupuesto insuficiente");
        _repo.Verify(r => r.Guardar(It.IsAny<OrdenCompra>()), Times.Never);
    }

    [Fact(DisplayName = "No aprueba dos veces la misma orden")]
    public void NoApruebaDosVeces()
    {
        _repo.Setup(r => r.BuscarPorId("OC-1041")).Returns(new OrdenCompra { Id = "OC-1041", Monto = 450_000, Estado = "APROBADA" });

        var accion = () => _service.Aprobar("OC-1041");

        accion.Should().Throw<OrdenCompraException>().WithMessage("La orden ya está aprobada");
    }

    [Theory(DisplayName = "No cancela una orden sin motivo")]
    [InlineData("")]
    [InlineData("   ")]
    public void NoCancelaSinMotivo(string motivo)
    {
        _repo.Setup(r => r.BuscarPorId("OC-1043")).Returns(new OrdenCompra { Id = "OC-1043", Monto = 252_000 });

        var accion = () => _service.Cancelar("OC-1043", motivo);

        accion.Should().Throw<OrdenCompraException>().WithMessage("Debe indicar el motivo de la cancelación");
    }

    [Fact(DisplayName = "Cancela una orden pendiente guardando el motivo")]
    public void CancelaConMotivo()
    {
        _repo.Setup(r => r.BuscarPorId("OC-1043")).Returns(new OrdenCompra { Id = "OC-1043", Monto = 252_000 });

        var orden = _service.Cancelar("OC-1043", "El proveedor no tiene leche esta semana");

        orden.Estado.Should().Be("CANCELADA");
        orden.Motivo.Should().Be("El proveedor no tiene leche esta semana");
    }
}
