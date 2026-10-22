// Errores de negocio de Corteza ERP (Panadería La Espiga)
class ErrorNegocio extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = this.constructor.name;
  }
}

class ProveedorInvalidoError extends ErrorNegocio {}
class ProveedorConOrdenesActivasError extends ErrorNegocio {}
class CotizacionInvalidaError extends ErrorNegocio {}
class OrdenCompraError extends ErrorNegocio {}
class StockInsuficienteError extends ErrorNegocio {}
class InsumoInvalidoError extends ErrorNegocio {}

module.exports = {
  ErrorNegocio,
  ProveedorInvalidoError,
  ProveedorConOrdenesActivasError,
  CotizacionInvalidaError,
  OrdenCompraError,
  StockInsuficienteError,
  InsumoInvalidoError,
};
