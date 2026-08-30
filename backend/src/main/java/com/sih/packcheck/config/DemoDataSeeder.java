package com.sih.packcheck.config;

import com.sih.packcheck.entity.User;
import com.sih.packcheck.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo-users.enabled:true}")
    private boolean demoUsersEnabled;

    public DemoDataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!demoUsersEnabled) {
            logger.info("Demo user seeding is disabled (app.demo-users.enabled=false).");
            return;
        }

        logger.info("Checking and seeding prototype demo user accounts if absent...");

        String defaultPasswordHash = passwordEncoder.encode("PackCheck@123");

        // 1. ADMIN
        createDemoUserIfAbsent("admin@packcheck.ai", "System Admin", defaultPasswordHash, User.Role.ADMIN, "Zone-HQ");

        // 2. ENFORCEMENT_OFFICER
        createDemoUserIfAbsent("officer@packcheck.ai", "Demo Officer", defaultPasswordHash, User.Role.ENFORCEMENT_OFFICER, "Zone-A");

        // 3. SUPERVISOR
        createDemoUserIfAbsent("supervisor@packcheck.ai", "Demo Supervisor", defaultPasswordHash, User.Role.SUPERVISOR, "Zone-HQ");
    }

    private void createDemoUserIfAbsent(String email, String fullName, String passwordHash, User.Role role, String zone) {
        if (userRepository.findByEmail(email.toLowerCase()).isEmpty()) {
            User user = new User(fullName, email.toLowerCase(), passwordHash, role, zone);
            user.setActive(true);
            userRepository.save(user);
            logger.info("Seeded demo user account: {} ({})", email, role);
        } else {
            logger.debug("Demo user account already exists: {}", email);
        }
    }
}
