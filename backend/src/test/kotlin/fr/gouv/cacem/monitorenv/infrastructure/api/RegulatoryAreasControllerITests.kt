 package fr.gouv.cacem.monitorenv.infrastructure.api

 import fr.gouv.cacem.monitorenv.MeterRegistryConfiguration
 import fr.gouv.cacem.monitorenv.domain.use_cases.crud.regulatoryAreas.*
 import fr.gouv.cacem.monitorenv.domain.entities.regulatoryAreas.RegulatoryAreaEntity
 import fr.gouv.cacem.monitorenv.infrastructure.api.endpoints.RegulatoryAreasController

 import org.hamcrest.Matchers.equalTo
 import org.junit.jupiter.api.Test
 import org.junit.jupiter.api.extension.ExtendWith
 import org.mockito.BDDMockito.given
 import org.springframework.beans.factory.annotation.Autowired
 import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
 import org.springframework.boot.test.mock.mockito.MockBean
 import org.springframework.context.annotation.Import
 import org.springframework.test.context.junit.jupiter.SpringExtension
 import org.springframework.test.web.servlet.MockMvc
 import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
 import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
 import java.time.ZonedDateTime
 import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
 import com.fasterxml.jackson.databind.ObjectMapper
 import org.locationtech.jts.geom.MultiPolygon
 import org.locationtech.jts.io.WKTReader

 @Import(MeterRegistryConfiguration::class)
 @ExtendWith(SpringExtension::class)
 @WebMvcTest(value = [(RegulatoryAreasController::class)])
 class RegulatoryAreasControllerITests {

     @Autowired
     private lateinit var mockMvc: MockMvc

     @MockBean
     private lateinit var getRegulatoryAreas: GetRegulatoryAreas

     @MockBean
     private lateinit var getRegulatoryAreaById: GetRegulatoryAreaById

     @Autowired
     private lateinit var objectMapper: ObjectMapper

     @Test
     fun `Should get all regulatory Areas`() {
         // Given
         val WKTreader = WKTReader()
         val multipolygonString="MULTIPOLYGON (((-4.54877816747593 48.305559876971, -4.54997332394943 48.3059760121399, -4.54998501370013 48.3071882334181, -4.54879290083417 48.3067746138142, -4.54877816747593 48.305559876971)))"
         val Polygon = WKTreader.read(multipolygonString) as MultiPolygon
         val regulaotyrArea = RegulatoryAreaEntity(
           id = 17,
           geom = Polygon,
           entity_name = "Zone au sud de la cale",
           url = "http://extranet.legicem.metier.developpement-durable.gouv.fr/zmel-roscanvel-a3474.html?id_rub=1098",
           layer_name = "ZMEL_Cale_Querlen",
           facade = "NAMO",
           ref_reg = "Arrêté inter-préfectoral N°2020118-0003 autorisant l'occupation temporaire du domaine public maritime par une zone de mouillages et d'équipements légers au lit-dit \"Cale de Quérlen\" sur le littoral de la commune de Roscanvel ",
           edition = "2021-11-02",
           editeur = "Alexis Pré",
           source = "",
           observation = "",
           thematique = "Mouillage",
           echelle = "1:1000",
           date = "2020-07-01",
           duree_validite = "15 ans",
           date_fin = "2035-07-01",
           temporalite = "temporaire",
           objet = "",
           signataire = ""
         )
         given(this.getRegulatoryAreas.execute()).willReturn(listOf(regulaotyrArea))

         // When
         mockMvc.perform(get("/bff/v1/regulatory"))
                 // Then
                 .andExpect(status().isOk)
                 .andExpect(jsonPath("$[0].id", equalTo(regulaotyrArea.id)))
                 .andExpect(jsonPath("$[0].entity_name", equalTo(regulaotyrArea.entity_name)))
                 .andExpect(jsonPath("$[0].layer_name", equalTo(regulaotyrArea.layer_name)))
                 .andExpect(jsonPath("$[0].facade", equalTo(regulaotyrArea.facade)))
                 .andExpect(jsonPath("$[0].ref_reg", equalTo(regulaotyrArea.ref_reg)))
                 .andExpect(jsonPath("$[0].thematique", equalTo(regulaotyrArea.thematique)))
                 .andExpect(jsonPath("$[0].echelle", equalTo(regulaotyrArea.echelle)))
                 .andExpect(jsonPath("$[0].date", equalTo(regulaotyrArea.date)))
                 .andExpect(jsonPath("$[0].duree_validite", equalTo(regulaotyrArea.duree_validite)))
     }

     @Test
     fun `Should get specific operation when requested by Id` () {
         // Given
       val WKTreader = WKTReader()
       val multipolygonString="MULTIPOLYGON (((-4.54877816747593 48.305559876971, -4.54997332394943 48.3059760121399, -4.54998501370013 48.3071882334181, -4.54879290083417 48.3067746138142, -4.54877816747593 48.305559876971)))"
       val Polygon = WKTreader.read(multipolygonString) as MultiPolygon
       val regulaotryArea = RegulatoryAreaEntity(
         id = 17,
         geom = Polygon,
         entity_name = "Zone au sud de la cale",
         url = "http://extranet.legicem.metier.developpement-durable.gouv.fr/zmel-roscanvel-a3474.html?id_rub=1098",
         layer_name = "ZMEL_Cale_Querlen",
         facade = "NAMO",
         ref_reg = "Arrêté inter-préfectoral N°2020118-0003 autorisant l'occupation temporaire du domaine public maritime par une zone de mouillages et d'équipements légers au lit-dit \"Cale de Quérlen\" sur le littoral de la commune de Roscanvel ",
         edition = "2021-11-02",
         editeur = "Alexis Pré",
         source = "",
         observation = "",
         thematique = "Mouillage",
         echelle = "1:1000",
         date = "2020-07-01",
         duree_validite = "15 ans",
         date_fin = "2035-07-01",
         temporalite = "temporaire",
         objet = "",
         signataire = ""
       )

         given(this.getRegulatoryAreaById.execute(17)).willReturn(regulaotryArea)

         // When
         mockMvc.perform(get("/bff/v1/regulatory/17"))
             // Then
             .andExpect(status().isOk)
             .andExpect(jsonPath("$.id", equalTo(regulaotryArea.id)))
             .andExpect(jsonPath("$.entity_name", equalTo(regulaotryArea.entity_name)))
             .andExpect(jsonPath("$.url", equalTo(regulaotryArea.url)))
             .andExpect(jsonPath("$.facade", equalTo(regulaotryArea.facade)))
             .andExpect(jsonPath("$.thematique", equalTo(regulaotryArea.thematique)))
             .andExpect(jsonPath("$.layer_name", equalTo(regulaotryArea.layer_name)))
             .andExpect(jsonPath("$.ref_reg", equalTo(regulaotryArea.ref_reg)))
             .andExpect(jsonPath("$.date", equalTo(regulaotryArea.date)))
             .andExpect(jsonPath("$.temporalite", equalTo(regulaotryArea.temporalite)))
     }
 }