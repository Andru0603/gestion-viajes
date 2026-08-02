package com.gestionviajes.config;

import com.gestionviajes.model.Usuario;
import com.gestionviajes.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatosIniciales implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setEmail("admin@gestionviajes.com");
            admin.setPasswordHash(passwordEncoder.encode("cambiar123"));
            admin.setRol("ADMIN");
            usuarioRepository.save(admin);

            System.out.println("=========================================");
            System.out.println("Usuario inicial creado");
            System.out.println("Correo: admin@gestionviajes.com");
            System.out.println("Contrasena: cambiar123");
            System.out.println("Cambiala despues de tu primer ingreso");
            System.out.println("=========================================");
        }
    }
}
