package co.corteza.erp;

/**
 * Solicitud de cotizaciones a proveedores.
 * Reglas: solo a proveedores ACTIVOS; total = cantidad × precio unitario, ambos mayores que cero.
 */
public class CotizacionService {
    private final RepositorioProveedores proveedores;

    public CotizacionService(RepositorioProveedores proveedores) {
        this.proveedores = proveedores;
    }

    public long calcularTotal(int cantidad, long precioUnitario) {
        if (cantidad <= 0) {
            throw new CotizacionInvalidaException("La cantidad debe ser mayor que cero");
        }
        if (precioUnitario <= 0) {
            throw new CotizacionInvalidaException("El monto debe ser mayor que cero");
        }
        return Math.multiplyExact(cantidad, precioUnitario);
    }

    public Cotizacion solicitar(String nit, int cantidad, long precioUnitario) {
        boolean activo = proveedores.buscarPorNit(nit)
                .map(p -> "ACTIVO".equals(p.getEstado()))
                .orElse(false);
        if (!activo) {
            throw new CotizacionInvalidaException("Solo se puede cotizar con proveedores activos");
        }
        return new Cotizacion(nit, calcularTotal(cantidad, precioUnitario), "SOLICITADA");
    }
}
