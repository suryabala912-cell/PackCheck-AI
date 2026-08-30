package com.sih.packcheck.security;

import com.sih.packcheck.config.DemoDataSeeder;
import com.sih.packcheck.entity.User;
import com.sih.packcheck.repository.ManualReviewLogRepository;
import com.sih.packcheck.repository.ProductScanRepository;
import com.sih.packcheck.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductScanRepository productScanRepository;

    @Autowired
    private ManualReviewLogRepository manualReviewLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private DemoDataSeeder demoDataSeeder;

    private User officerUser;
    private User adminUser;
    private String officerJwtToken;
    private String adminJwtToken;

    @BeforeEach
    public void setUp() {
        manualReviewLogRepository.deleteAll();
        productScanRepository.deleteAll();
        userRepository.deleteAll();

        officerUser = new User("Officer Test", "officer@packcheck.ai", passwordEncoder.encode("PackCheck@123"), User.Role.ENFORCEMENT_OFFICER, "Zone-A");
        officerUser = userRepository.save(officerUser);
        officerJwtToken = jwtService.generateToken(officerUser);

        adminUser = new User("Admin Test", "admin@packcheck.ai", passwordEncoder.encode("PackCheck@123"), User.Role.ADMIN, "Zone-HQ");
        adminUser = userRepository.save(adminUser);
        adminJwtToken = jwtService.generateToken(adminUser);
    }

    @Test
    public void testProtectedEndpointRejectsUnauthenticatedRequest() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "label.jpg", "image/jpeg", "image bytes".getBytes());

        mockMvc.perform(multipart("/api/v1/scans/analyze").file(file))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").value("Authentication token is missing or invalid"));
    }

    @Test
    public void testValidJwtAllowsAuthenticatedRequest() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "label.jpg", "image/jpeg", new byte[0]);

        mockMvc.perform(multipart("/api/v1/scans/analyze")
                        .file(emptyFile)
                        .header("Authorization", "Bearer " + officerJwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    public void testRoleAuthorizationForbiddenForUnauthorizedRole() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + officerJwtToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message").value("You do not have permission to perform this action."));
    }

    @Test
    public void testRoleAuthorizationAccessGrantedForAllowedRole() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + adminJwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDemoUsersNotDuplicatedOnRestart() {
        demoDataSeeder.run();
        long initialCount = userRepository.count();

        demoDataSeeder.run();
        long finalCount = userRepository.count();

        assertEquals(initialCount, finalCount, "Demo user seeder must not create duplicate users on application restart.");
    }
}
