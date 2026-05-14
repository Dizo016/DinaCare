package br.com.dinacare.controller;

import br.com.dinacare.domain.procedure.Procedure;
import br.com.dinacare.repository.procedure.ProcedureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProcedureControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ProcedureRepository procedureRepository;

    private MockMvc mockMvc;
    private Procedure savedProcedure;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        savedProcedure = procedureRepository.save(Procedure.builder()
                .name("Manicure")
                .duration(60)
                .price(new BigDecimal("50.00"))
                .build());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldCreateProcedure() throws Exception {
        String body = """
                {
                    "name": "Pedicure",
                    "duration": 90,
                    "price": 70.00
                }
                """;

        mockMvc.perform(post("/procedures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Pedicure"))
                .andExpect(jsonPath("$.duration").value(90))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnBadRequestWhenNameIsBlank() throws Exception {
        String body = """
                {
                    "name": "",
                    "duration": 60,
                    "price": 50.00
                }
                """;

        mockMvc.perform(post("/procedures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").isNotEmpty());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnBadRequestWhenPriceIsNegative() throws Exception {
        String body = """
                {
                    "name": "Hidratação",
                    "duration": 60,
                    "price": -10.00
                }
                """;

        mockMvc.perform(post("/procedures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.price").isNotEmpty());
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldListOnlyActiveProcedures() throws Exception {
        procedureRepository.save(Procedure.builder()
                .name("Depilação")
                .duration(45)
                .price(new BigDecimal("80.00"))
                .active(false)
                .build());

        mockMvc.perform(get("/procedures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Manicure"));
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldFindProcedureById() throws Exception {
        mockMvc.perform(get("/procedures/{id}", savedProcedure.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedProcedure.getId().toString()))
                .andExpect(jsonPath("$.name").value("Manicure"));
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldReturn404WhenProcedureNotFound() throws Exception {
        mockMvc.perform(get("/procedures/{id}", java.util.UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldUpdateProcedure() throws Exception {
        String body = """
                {
                    "name": "Manicure Premium",
                    "duration": 75,
                    "price": 65.00
                }
                """;

        mockMvc.perform(put("/procedures/{id}", savedProcedure.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Manicure Premium"))
                .andExpect(jsonPath("$.duration").value(75));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldDeactivateProcedure() throws Exception {
        mockMvc.perform(delete("/procedures/{id}", savedProcedure.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/procedures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void shouldReturn403WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/procedures"))
                .andExpect(status().isForbidden());
    }
}