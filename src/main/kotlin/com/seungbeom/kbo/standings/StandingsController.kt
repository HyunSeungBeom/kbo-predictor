package com.seungbeom.kbo.standings

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class StandingsController(
    private val standingsService: StandingsService,
) {
    /** 현재 순위표. GET /api/standings */
    @GetMapping("/standings")
    fun standings(): List<TeamStanding> = standingsService.standings()
}
