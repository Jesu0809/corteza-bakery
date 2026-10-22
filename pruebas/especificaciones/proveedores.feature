# language: es
Característica: Gestión de proveedores de la Panadería La Espiga
  Como encargada de proveedores
  Quiero registrar, consultar, actualizar y desactivar proveedores
  Para saber siempre a quién le compramos los insumos

  Antecedentes:
    Dado que el usuario "Camila Ortiz" con rol "Proveedores" ha iniciado sesión

  Escenario: Registrar un proveedor válido
    Dado que no existe un proveedor con NIT "900123456"
    Cuando registro el proveedor con NIT "900123456", nombre "Molinos del Valle" y correo "ventas@molinosdelvalle.com"
    Entonces el proveedor queda con estado "ACTIVO"
    Y el sistema muestra el mensaje "Proveedor registrado exitosamente"

  Escenario: Rechazar un proveedor con NIT duplicado
    Dado que ya existe un proveedor con NIT "900123456"
    Cuando registro el proveedor con NIT "900123456", nombre "Otra Harinera" y correo "otra@harinas.com"
    Entonces el sistema muestra el mensaje "El NIT ya está registrado"
    Y solo existe un proveedor con NIT "900123456"

  Esquema del escenario: Validar el formato del correo
    Cuando registro el proveedor con NIT "901345678", nombre "Avícola El Dorado" y correo "<correo>"
    Entonces el sistema muestra el mensaje "<resultado>"

    Ejemplos:
      | correo                 | resultado                         |
      | pedidos@eldorado.com   | Proveedor registrado exitosamente |
      | sin-arroba.com         | Formato de correo inválido        |
      | usuario@               | Formato de correo inválido        |

  Escenario: Desactivar un proveedor sin órdenes de compra activas
    Dado que ya existe un proveedor con NIT "900123456"
    Y el proveedor "900123456" no tiene órdenes de compra activas
    Cuando solicito desactivar el proveedor "900123456"
    Entonces el proveedor queda con estado "INACTIVO"
    Y el sistema muestra el mensaje "Proveedor desactivado"

  Escenario: No desactivar un proveedor con órdenes de compra activas
    Dado que ya existe un proveedor con NIT "900123456"
    Y el proveedor "900123456" tiene órdenes de compra activas
    Cuando solicito desactivar el proveedor "900123456"
    Entonces el sistema muestra el mensaje "No se puede desactivar: el proveedor tiene órdenes activas"
