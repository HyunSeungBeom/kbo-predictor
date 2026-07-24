package com.seungbeom.kbo.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * 프론트(Next.js dev 서버 등)가 API를 호출할 수 있도록 CORS 허용.
 * 허용 오리진은 `app.cors.allowed-origins`(콤마 구분)로 설정, 기본은 로컬 dev.
 */
@Configuration
class WebConfig(
    @Value("\${app.cors.allowed-origins:http://localhost:3000}")
    private val allowedOrigins: String,
) : WebMvcConfigurer {

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOrigins(*allowedOrigins.split(",").map { it.trim() }.toTypedArray())
            .allowedMethods("GET", "POST")
    }
}
