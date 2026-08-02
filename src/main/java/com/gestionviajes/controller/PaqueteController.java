package com.gestionviajes.controller;

import com.gestionviajes.model.Paquete;
import com.gestionviajes.repository.PaqueteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paquetes")
public class PaqueteController {

    @Autowired
    private PaqueteRepository paqueteRepository;

    @GetMapping
    public List<Paquete> listar() {
        return paqueteRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paquete> obtenerPorId(@PathVariable Integer id) {
        return paqueteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Paquete crear(@RequestBody Paquete paquete) {
        return paqueteRepository.save(paquete);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paquete> actualizar(@PathVariable Integer id, @RequestBody Paquete datos) {
        return paqueteRepository.findById(id)
                .map(paquete -> {
                    paquete.setNombre(datos.getNombre());
                    paquete.setDestino(datos.getDestino());
                    paquete.setDescripcion(datos.getDescripcion());
                    paquete.setMedioTransporte(datos.getMedioTransporte());
                    paquete.setPrecioBase(datos.getPrecioBase());
                    paquete.setDuracionDias(datos.getDuracionDias());
                    paquete.setCupoMaximo(datos.getCupoMaximo());
                    return ResponseEntity.ok(paqueteRepository.save(paquete));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (!paqueteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        paqueteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
