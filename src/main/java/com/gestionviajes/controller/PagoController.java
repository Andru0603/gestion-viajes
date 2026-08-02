package com.gestionviajes.controller;

import com.gestionviajes.model.Pago;
import com.gestionviajes.model.Reserva;
import com.gestionviajes.repository.PagoRepository;
import com.gestionviajes.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @GetMapping
    public List<Pago> listar() {
        return pagoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pago> obtenerPorId(@PathVariable Integer id) {
        return pagoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Pago> crear(@RequestBody Pago datos) {
        Reserva reserva = reservaRepository.findById(datos.getReserva().getId())
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMonto(datos.getMonto());
        pago.setFecha(datos.getFecha());
        pago.setMetodoPago(datos.getMetodoPago());
        pago.setNotas(datos.getNotas());

        return ResponseEntity.ok(pagoRepository.save(pago));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pago> actualizar(@PathVariable Integer id, @RequestBody Pago datos) {
        return pagoRepository.findById(id)
                .map(pago -> {
                    pago.setMonto(datos.getMonto());
                    pago.setFecha(datos.getFecha());
                    pago.setMetodoPago(datos.getMetodoPago());
                    pago.setNotas(datos.getNotas());
                    return ResponseEntity.ok(pagoRepository.save(pago));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (!pagoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pagoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
