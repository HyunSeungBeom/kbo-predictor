package com.seungbeom.kbo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class KboPredictorApplication

fun main(args: Array<String>) {
	runApplication<KboPredictorApplication>(*args)
}
