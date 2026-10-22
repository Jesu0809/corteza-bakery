package co.corteza.erp;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/** Repositorio en memoria: reemplaza a SQL Server durante las pruebas. */
public class RepositorioProveedoresMemoria implements RepositorioProveedores {
    private final Map<String, Proveedor> datos = new HashMap<>();

    @Override public boolean existePorNit(String nit) { return datos.containsKey(nit); }
    @Override public Optional<Proveedor> buscarPorNit(String nit) { return Optional.ofNullable(datos.get(nit)); }
    @Override public Proveedor guardar(Proveedor p) { datos.put(p.getNit(), p); return p; }
    public int cantidad() { return datos.size(); }
}
