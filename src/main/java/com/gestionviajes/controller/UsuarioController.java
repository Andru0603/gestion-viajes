package com.gestionviajes.controller;

import com.gestionviajes.model.Usuario;
import com.gestionviajes.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping("/cambiar-password")
    public ResponseEntity<String> cambiarPassword(@RequestBody Map<String, String> datos,
            Authentication authentication) {
        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String actual = datos.get("passwordActual");
        String nueva = datos.get("passwordNueva");

        if (!passwordEncoder.matches(actual, usuario.getPasswordHash())) {
            return ResponseEntity.badRequest().body("La contraseña actual no es correcta");
        }

        usuario.setPasswordHash(passwordEncoder.encode(nueva));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Contraseña actualizada");
    }
}
