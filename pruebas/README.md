# Pruebas de Corteza ERP

Pruebas unitarias y de comportamiento (BDD) de los módulos de **Proveedores**, **Cotizaciones**,
**Órdenes de compra** e **Inventario** de Corteza ERP (Panadería La Espiga).
Corresponden al taller *Herramientas de Prueba para CRUD Empresariales* de Ingeniería de Software II.

| Carpeta | Herramientas | Qué prueba |
|---|---|---|
| `especificaciones/` | Gherkin (español) | Los escenarios de negocio, escritos una sola vez y usados por Cucumber y Reqnroll |
| `node/` | Jest, Cucumber-JS, Font Awesome | Los 4 servicios con mocks del repositorio, los 4 `.feature` y el reporte HTML |
| `java/` | JUnit 5, Mockito, Cucumber-JVM | Proveedores (CRUD, mock de órdenes) y cotizaciones (`@CsvSource`) |
| `dotnet/` | xUnit, Moq, FluentAssertions, Reqnroll | Inventario y órdenes de compra, en el stack del proyecto (.NET) |

> SpecFlow fue retirado el 31 de diciembre de 2024. Por eso en .NET usamos **Reqnroll**, su sucesor,
> que mantiene la misma forma de trabajar (`[Binding]`, `[Given]`, `[When]`, `[Then]`).

## Cómo correrlas

```bash
# Node.js: Jest + Cucumber-JS + reporte con Font Awesome
cd pruebas/node && npm ci && npm test && npm run test:bdd && npm run reporte

# Java: JUnit 5 + Cucumber-JVM
cd pruebas/java && mvn test

# .NET 8: xUnit + Reqnroll
cd pruebas/dotnet && dotnet test Corteza.Pruebas.Unitarias && dotnet test Corteza.Pruebas.Bdd
```

Cada `push` y cada *pull request* ejecuta las tres suites en **GitHub Actions**
(`.github/workflows/pruebas-corteza.yml`) y guarda los reportes como artefactos.

## Reglas de negocio probadas

- **Proveedores:** NIT único y válido, correo con formato correcto, nombre obligatorio y no se desactiva un proveedor con órdenes activas.
- **Cotizaciones:** solo a proveedores activos; cantidad y precio mayores que cero; total = cantidad × precio unitario.
- **Órdenes de compra:** no se aprueba una orden que excede el presupuesto ni una ya aprobada; solo se cancela una orden pendiente y con motivo.
- **Inventario:** código único, stock inicial en cero, no se retira más de lo disponible y se avisa cuando el stock baja del mínimo.
