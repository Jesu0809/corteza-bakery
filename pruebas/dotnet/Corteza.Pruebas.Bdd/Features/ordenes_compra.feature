# language: es
Característica: Aprobación de órdenes de compra
  Como encargado de compras
  Quiero aprobar o cancelar las órdenes de compra de insumos
  Para no gastar más del presupuesto de la panadería

  Antecedentes:
    Dado que el presupuesto de compras es 10000000 pesos

  Escenario: Aprobar una orden dentro del presupuesto
    Dado que existe la orden "OC-1042" por 1850000 pesos en estado "PENDIENTE"
    Cuando apruebo la orden "OC-1042"
    Entonces la orden "OC-1042" queda en estado "APROBADA"

  Escenario: Rechazar una orden que excede el presupuesto
    Dado que existe la orden "OC-1050" por 15000000 pesos en estado "PENDIENTE"
    Cuando apruebo la orden "OC-1050"
    Entonces el sistema muestra el mensaje "Presupuesto insuficiente"
    Y la orden "OC-1050" queda en estado "PENDIENTE"

  Escenario: No aprobar dos veces la misma orden
    Dado que existe la orden "OC-1041" por 450000 pesos en estado "APROBADA"
    Cuando apruebo la orden "OC-1041"
    Entonces el sistema muestra el mensaje "La orden ya está aprobada"

  Escenario: Cancelar una orden pendiente con motivo
    Dado que existe la orden "OC-1043" por 252000 pesos en estado "PENDIENTE"
    Cuando cancelo la orden "OC-1043" con el motivo "El proveedor no tiene leche esta semana"
    Entonces la orden "OC-1043" queda en estado "CANCELADA"
