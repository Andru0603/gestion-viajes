package com.gestionviajes.controller;

import com.gestionviajes.model.Cliente;
import com.gestionviajes.model.Paquete;
import com.gestionviajes.model.Proveedor;
import com.gestionviajes.model.Reserva;
import com.gestionviajes.repository.ClienteRepository;
import com.gestionviajes.repository.PaqueteRepository;
import com.gestionviajes.repository.ProveedorRepository;
import com.gestionviajes.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PaqueteRepository paqueteRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @GetMapping
    public List<Reserva> listar() {
        return reservaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> obtenerPorId(@PathVariable Integer id) {
        return reservaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Reserva> crear(@RequestBody Reserva datos) {
        Cliente cliente = clienteRepository.findById(datos.getCliente().getId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        Paquete paquete = paqueteRepository.findById(datos.getPaquete().getId())
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setPaquete(paquete);
        reserva.setFechaViaje(datos.getFechaViaje());
        reserva.setNumPersonas(datos.getNumPersonas());
        reserva.setPrecioTotal(datos.getPrecioTotal());
        reserva.setEstado(datos.getEstado() != null ? datos.getEstado() : Reserva.Estado.COTIZADO);

        if (datos.getProveedor() != null && datos.getProveedor().getId() != null) {
            Proveedor proveedor = proveedorRepository.findById(datos.getProveedor().getId())
                    .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
            reserva.setProveedor(proveedor);
        }

        return ResponseEntity.ok(reservaRepository.save(reserva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reserva> actualizar(@PathVariable Integer id, @RequestBody Reserva datos) {
        return reservaRepository.findById(id)
                .map(reserva -> {
                    reserva.setFechaViaje(datos.getFechaViaje());
                    reserva.setNumPersonas(datos.getNumPersonas());
                    reserva.setPrecioTotal(datos.getPrecioTotal());
                    reserva.setEstado(datos.getEstado());
                    return ResponseEntity.ok(reservaRepository.save(reserva));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (!reservaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reservaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
