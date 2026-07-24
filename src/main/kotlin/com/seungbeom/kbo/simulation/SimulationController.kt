package com.seungbeom.kbo.simulation

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class SimulationController(
    private val simulationService: SimulationService,
) {
    /** 가을야구 진출·우승 확률. GET /api/simulation?iterations=10000 */
    @GetMapping("/simulation")
    fun simulation(
        @RequestParam(defaultValue = "10000") iterations: Int,
    ): List<SimulationResult> = simulationService.simulate(iterations)
}
