package co.corteza.erp;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.FEATURES_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

/** Ejecuta con Cucumber-JVM los mismos escenarios Gherkin de proveedores y cotizaciones. */
@Suite
@IncludeEngines("cucumber")
@ConfigurationParameter(key = FEATURES_PROPERTY_NAME,
        value = "../especificaciones/proveedores.feature,../especificaciones/cotizaciones.feature")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "co.corteza.erp.pasos")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, html:target/cucumber.html")
public class EjecutarCucumberTest { }
