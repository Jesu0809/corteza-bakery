# language: es
Característica: Solicitud de cotizaciones a proveedores
  Como encargado de compras
  Quiero pedir cotizaciones de insumos a los proveedores activos
  Para comparar precios antes de crear la orden de compra

  Antecedentes:
    Dado que el proveedor "900123456" está "ACTIVO"

  Escenario: Calcular el total de una cotización de harina
    Cuando solicito una cotización al proveedor "900123456" por 20 unidades a 92500 pesos
    Entonces la cotización queda en estado "SOLICITADA"
    Y el total de la cotización es 1850000 pesos

  Escenario: Rechazar cotización con monto cero
    Cuando solicito una cotización al proveedor "900123456" por 10 unidades a 0 pesos
    Entonces el sistema muestra el mensaje "El monto debe ser mayor que cero"

  Escenario: Rechazar cotización con cantidad cero
    Cuando solicito una cotización al proveedor "900123456" por 0 unidades a 4200 pesos
    Entonces el sistema muestra el mensaje "La cantidad debe ser mayor que cero"

  Escenario: No cotizar con un proveedor inactivo
    Dado que el proveedor "900890123" está "INACTIVO"
    Cuando solicito una cotización al proveedor "900890123" por 5 unidades a 3000 pesos
    Entonces el sistema muestra el mensaje "Solo se puede cotizar con proveedores activos"
