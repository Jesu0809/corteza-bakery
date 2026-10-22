package co.corteza.erp;

import java.util.regex.Pattern;

/**
 * Módulo 04 · Proveedores de Corteza ERP.
 * Reglas: NIT único y válido, correo con formato correcto, nombre obligatorio
 * y no se desactiva un proveedor con órdenes de compra activas.
 */
public class ProveedorService {
    private static final Pattern NIT = Pattern.compile("^\\d{9}(-\\d)?$");
    private static final Pattern CORREO = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final RepositorioProveedores repositorio;
    private final RepositorioOrdenes ordenes;

    public ProveedorService(RepositorioProveedores repositorio, RepositorioOrdenes ordenes) {
        this.repositorio = repositorio;
        this.ordenes = ordenes;
    }

    public Proveedor registrar(Proveedor proveedor) {
        if (proveedor.getNombre() == null || proveedor.getNombre().isBlank()) {
            throw new ProveedorInvalidoException("El nombre es obligatorio");
        }
        if (proveedor.getNit() == null || !NIT.matcher(proveedor.getNit()).matches()) {
            throw new ProveedorInvalidoException("El NIT no es válido");
        }
        if (proveedor.getCorreo() == null || !CORREO.matcher(proveedor.getCorreo()).matches()) {
            throw new ProveedorInvalidoException("Formato de correo inválido");
        }
        if (repositorio.existePorNit(proveedor.getNit())) {
            throw new ProveedorInvalidoException("El NIT ya está registrado");
        }
        proveedor.setEstado("ACTIVO");
        return repositorio.guardar(proveedor);
    }

    public String desactivar(String nit) {
        Proveedor proveedor = repositorio.buscarPorNit(nit)
                .orElseThrow(() -> new ProveedorInvalidoException("El proveedor no existe"));
        if (ordenes.tieneOrdenesActivas(nit)) {
            throw new ProveedorConOrdenesActivasException("No se puede desactivar: el proveedor tiene órdenes activas");
        }
        proveedor.setEstado("INACTIVO");
        repositorio.guardar(proveedor);
        return "Proveedor desactivado";
    }

    public boolean existePorNit(String nit) {
        return repositorio.existePorNit(nit);
    }
}
