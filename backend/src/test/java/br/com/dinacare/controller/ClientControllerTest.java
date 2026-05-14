package br.com.dinacare.controller;

import br.com.dinacare.domain.client.Client;
import br.com.dinacare.repository.client.ClientRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ClientControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ClientRepository clientRepository;

    private MockMvc mockMvc;
    private Client savedClient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        savedClient = clientRepository.save(Client.builder()
                .name("Maria Silva")
                .phone("71999990000")
                .notes("Cliente VIP")
                .build());
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldCreateClient() throws Exception {
        String body = """
                {
                    "name": "João Santos",
                    "phone": "71988880000",
                    "notes": "Alérgico a látex"
                }
                """;

        mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("João Santos"))
                .andExpect(jsonPath("$.phone").value("71988880000"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldReturnBadRequestWhenNameIsBlank() throws Exception {
        String body = """
                {
                    "name": "",
                    "phone": "71988880000"
                }
                """;

        mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").isNotEmpty());
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldReturnBadRequestWhenPhoneIsBlank() throws Exception {
        String body = """
                {
                    "name": "João Santos",
                    "phone": ""
                }
                """;

        mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.phone").isNotEmpty());
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldListOnlyActiveClients() throws Exception {
        clientRepository.save(Client.builder()
                .name("Cliente Inativo")
                .phone("71977770000")
                .active(false)
                .build());

        mockMvc.perform(get("/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Maria Silva"));
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldFindClientById() throws Exception {
        mockMvc.perform(get("/clients/{id}", savedClient.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedClient.getId().toString()))
                .andExpect(jsonPath("$.name").value("Maria Silva"));
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldReturn404WhenClientNotFound() throws Exception {
        mockMvc.perform(get("/clients/{id}", java.util.UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldSearchClientByName() throws Exception {
        mockMvc.perform(get("/clients/search").param("name", "Maria"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Maria Silva"));
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldUpdateClient() throws Exception {
        String body = """
                {
                    "name": "Maria Santos",
                    "phone": "71911110000",
                    "notes": "Atualizado"
                }
                """;

        mockMvc.perform(put("/clients/{id}", savedClient.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Maria Santos"))
                .andExpect(jsonPath("$.phone").value("71911110000"));
    }

    @Test
    @WithMockUser(roles = "PROFESSIONAL")
    void shouldDeactivateClient() throws Exception {
        mockMvc.perform(delete("/clients/{id}", savedClient.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void shouldReturn403WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/clients"))
                .andExpect(status().isForbidden());
    }
}