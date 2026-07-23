package com.seungbeom.kbo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class KboPredictorApplication

fun main(args: Array<String>) {
	runApplication<KboPredictorApplication>(*args)
}
