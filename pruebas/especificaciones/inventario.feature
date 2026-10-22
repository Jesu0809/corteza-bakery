# language: es
Característica: Registro de insumos y movimientos de inventario
  Como encargada de inventarios
  Quiero registrar insumos y sus entradas y salidas
  Para saber cuánto hay en la bodega y cuándo pedir más

  Escenario: Registrar un insumo nuevo
    Dado que no existe un insumo con código "INS-001"
    Cuando registro el insumo "INS-001" "Harina de trigo" en "bulto de 50 kg" con mínimo 20
    Entonces el insumo "INS-001" queda con stock 0 y estado "ACTIVO"

  Escenario: Rechazar un código de insumo duplicado
    Dado que existe el insumo "INS-001" con stock 40 y mínimo 20
    Cuando registro el insumo "INS-001" "Harina integral" en "bulto de 50 kg" con mínimo 10
    Entonces el sistema muestra el mensaje "El código ya está registrado"

  Esquema del escenario: Actualizar el stock con entradas y salidas
    Dado que existe el insumo "<codigo>" con stock <inicial> y mínimo <minimo>
    Cuando registro una "<movimiento>" de <cantidad> unidades del insumo "<codigo>"
    Entonces el insumo "<codigo>" queda con stock <final>

    Ejemplos:
      | codigo  | inicial | minimo | movimiento | cantidad | final |
      | INS-001 | 40      | 20     | entrada    | 25       | 65    |
      | INS-002 | 20      | 15     | salida     | 12       | 8     |
      | INS-003 | 10      | 5      | salida     | 10       | 0     |

  Escenario: No retirar más de lo disponible
    Dado que existe el insumo "INS-002" con stock 2 y mínimo 15
    Cuando registro una "salida" de 5 unidades del insumo "INS-002"
    Entonces el sistema muestra el mensaje "Stock insuficiente"
    Y el insumo "INS-002" queda con stock 2
