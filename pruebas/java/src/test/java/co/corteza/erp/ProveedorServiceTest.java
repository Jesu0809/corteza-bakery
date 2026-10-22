package co.corteza.erp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Taller 1 · CRUD de proveedores (JUnit 5)")
class ProveedorServiceTest {

    @Mock private RepositorioOrdenes ordenes;
    private RepositorioProveedoresMemoria repositorio;
    private ProveedorService service;

    @BeforeEach
    void setUp() {
        repositorio = new RepositorioProveedoresMemoria();
        service = new ProveedorService(repositorio, ordenes);
    }

    @Test
    @DisplayName("Debe crear un proveedor con NIT válido y estado ACTIVO")
    void deberiaCrearProveedorConNitValido() {
        Proveedor creado = service.registrar(new Proveedor("900123456", "Molinos del Valle", "ventas@molinosdelvalle.com"));

        assertEquals("ACTIVO", creado.getEstado());
        assertTrue(service.existePorNit("900123456"));
    }

    @Test
    @DisplayName("Debe rechazar un NIT duplicado")
    void noDeberiaCrearProveedorConNitDuplicado() {
        service.registrar(new Proveedor("900123456", "Molinos del Valle", "a@molinos.com"));

        ProveedorInvalidoException error = assertThrows(ProveedorInvalidoException.class,
                () -> service.registrar(new Proveedor("900123456", "Otra Harinera", "b@harinas.com")));

        assertEquals("El NIT ya está registrado", error.getMessage());
        assertEquals(1, repositorio.cantidad());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "sin-arroba", "usuario@"})
    @DisplayName("Debe rechazar correos inválidos")
    void noDeberiaAceptarCorreosInvalidos(String correo) {
        assertThrows(ProveedorInvalidoException.class,
                () -> service.registrar(new Proveedor("900999999", "Prueba", correo)));
    }

    @Test
    @DisplayName("Debe desactivar un proveedor sin órdenes activas")
    void deberiaDesactivarProveedorSinOrdenesActivas() {
        service.registrar(new Proveedor("900123456", "ACME", "a@acme.com"));
        when(ordenes.tieneOrdenesActivas("900123456")).thenReturn(false);

        assertEquals("Proveedor desactivado", service.desactivar("900123456"));
        assertEquals("INACTIVO", repositorio.buscarPorNit("900123456").orElseThrow().getEstado());
    }

    @Test
    @DisplayName("No debe desactivar un proveedor con órdenes activas (mock del repositorio de órdenes)")
    void noDeberiaEliminarProveedorConOrdenesActivas() {
        RepositorioProveedores repoMock = mock(RepositorioProveedores.class);
        Proveedor acme = new Proveedor("900123456", "ACME", "a@acme.com");
        acme.setEstado("ACTIVO");
        when(repoMock.buscarPorNit("900123456")).thenReturn(Optional.of(acme));
        when(ordenes.tieneOrdenesActivas("900123456")).thenReturn(true);
        ProveedorService conMock = new ProveedorService(repoMock, ordenes);

        assertThrows(ProveedorConOrdenesActivasException.class, () -> conMock.desactivar("900123456"));
        verify(repoMock, never()).guardar(any());
        assertEquals("ACTIVO", acme.getEstado());
    }
}
