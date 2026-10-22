package co.corteza.erp;

public class Proveedor {
    private final String nit;
    private String nombre;
    private String correo;
    private String estado;

    public Proveedor(String nit, String nombre, String correo) {
        this.nit = nit;
        this.nombre = nombre;
        this.correo = correo;
    }

    public String getNit() { return nit; }
    public String getNombre() { return nombre; }
    public String getCorreo() { return correo; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public void setCorreo(String correo) { this.correo = correo; }
}
