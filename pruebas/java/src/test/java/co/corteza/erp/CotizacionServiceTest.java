package co.corteza.erp;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Taller 2 · Cotizaciones (Ejercicio 2: @CsvSource)")
class CotizacionServiceTest {

    private final CotizacionService service = new CotizacionService(new RepositorioProveedoresMemoria());

    @ParameterizedTest(name = "{0} unidades × ${1} = ${2}")
    @CsvSource({
            "20, 92500, 1850000",
            "60, 4200, 252000",
            "8, 185000, 1480000"
    })
    @DisplayName("Debe calcular el total de la cotización")
    void deberiaCalcularTotal(int cantidad, long precioUnitario, long totalEsperado) {
        assertEquals(totalEsperado, service.calcularTotal(cantidad, precioUnitario));
    }

    @Test
    @DisplayName("Debe lanzar excepción si la cantidad es cero")
    void deberiaRechazarCantidadCero() {
        CotizacionInvalidaException error = assertThrows(CotizacionInvalidaException.class,
                () -> service.calcularTotal(0, 4200));
        assertEquals("La cantidad debe ser mayor que cero", error.getMessage());
    }

    @Test
    @DisplayName("Debe lanzar excepción si el monto es cero")
    void deberiaRechazarMontoCero() {
        assertThrows(CotizacionInvalidaException.class, () -> service.calcularTotal(10, 0));
    }
}
