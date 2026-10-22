package co.corteza.erp;

import java.util.Optional;

public interface RepositorioProveedores {
    boolean existePorNit(String nit);
    Optional<Proveedor> buscarPorNit(String nit);
    Proveedor guardar(Proveedor proveedor);
}
