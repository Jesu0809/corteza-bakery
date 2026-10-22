package co.corteza.erp.pasos;

import co.corteza.erp.*;
import io.cucumber.java.es.*;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/** Step definitions (Cucumber-JVM, palabras clave en español). */
public class PasosProveedoresYCotizaciones {

    private final RepositorioProveedoresMemoria repositorio = new RepositorioProveedoresMemoria();
    private final Set<String> conOrdenesActivas = new HashSet<>();
    private final ProveedorService proveedores = new ProveedorService(repositorio, conOrdenesActivas::contains);
    private final CotizacionService cotizaciones = new CotizacionService(repositorio);

    private String nitActual;
    private String mensaje;
    private Cotizacion cotizacion;

    @Dado("que el usuario {string} con rol {string} ha iniciado sesión")
    public void usuarioInicioSesion(String nombre, String rol) {
        assertFalse(nombre.isBlank());
    }

    @Dado("que no existe un proveedor con NIT {string}")
    public void queNoExisteProveedorConNit(String nit) {
        assertFalse(proveedores.existePorNit(nit));
    }

    @Dado("que ya existe un proveedor con NIT {string}")
    public void queYaExisteProveedor(String nit) {
        proveedores.registrar(new Proveedor(nit, "Molinos del Valle", "ventas@molinos.com"));
    }

    @Dado("el proveedor {string} no tiene órdenes de compra activas")
    public void sinOrdenesActivas(String nit) { conOrdenesActivas.remove(nit); }

    @Dado("el proveedor {string} tiene órdenes de compra activas")
    public void conOrdenesActivas(String nit) { conOrdenesActivas.add(nit); }

    @Cuando("registro el proveedor con NIT {string}, nombre {string} y correo {string}")
    public void registroProveedor(String nit, String nombre, String correo) {
        nitActual = nit;
        try {
            proveedores.registrar(new Proveedor(nit, nombre, correo));
            mensaje = "Proveedor registrado exitosamente";
        } catch (RuntimeException e) {
            mensaje = e.getMessage();
        }
    }

    @Cuando("solicito desactivar el proveedor {string}")
    public void solicitoDesactivar(String nit) {
        nitActual = nit;
        try {
            mensaje = proveedores.desactivar(nit);
        } catch (RuntimeException e) {
            mensaje = e.getMessage();
        }
    }

    @Entonces("el proveedor queda con estado {string}")
    public void proveedorQuedaConEstado(String estado) {
        assertEquals(estado, repositorio.buscarPorNit(nitActual).orElseThrow().getEstado());
    }

    @Entonces("solo existe un proveedor con NIT {string}")
    public void soloExisteUnProveedor(String nit) {
        assertEquals("Molinos del Valle", repositorio.buscarPorNit(nit).orElseThrow().getNombre());
    }

    @Entonces("el sistema muestra el mensaje {string}")
    public void elSistemaMuestraMensaje(String esperado) {
        assertEquals(esperado, mensaje);
    }

    // ---------- Cotizaciones (Ejercicio 4) ----------
    @Dado("que el proveedor {string} está {string}")
    public void proveedorEsta(String nit, String estado) {
        Proveedor p = new Proveedor(nit, "Proveedor " + nit, "p@p.com");
        p.setEstado(estado);
        repositorio.guardar(p);
    }

    @Cuando("solicito una cotización al proveedor {string} por {int} unidades a {int} pesos")
    public void solicitoCotizacion(String nit, int cantidad, int precio) {
        try {
            cotizacion = cotizaciones.solicitar(nit, cantidad, precio);
            mensaje = "Cotización solicitada";
        } catch (CotizacionInvalidaException e) {
            mensaje = e.getMessage();
        }
    }

    @Entonces("la cotización queda en estado {string}")
    public void cotizacionQuedaEnEstado(String estado) {
        assertEquals(estado, cotizacion.estado());
    }

    @Entonces("el total de la cotización es {int} pesos")
    public void totalDeLaCotizacion(int total) {
        assertEquals(total, cotizacion.total());
    }
}
