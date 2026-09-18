package com.seungbeom.kbo.auth

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestClient
import tools.jackson.databind.JsonNode

/** 카카오에서 받아오는 최소 정보. 이메일·전화번호는 요청하지도 받지도 않는다. */
data class KakaoProfile(val id: String, val nickname: String, val profileImageUrl: String?)

/**
 * 카카오 OAuth — **토큰 교환과 프로필 조회를 서버가 한다.**
 *
 * 브라우저는 인가 코드만 들고 돌아오고, client secret 과 액세스 토큰은 서버 밖으로 나가지 않는다.
 * (프론트에서 토큰을 다루면 XSS 한 번에 계정이 털린다.)
 */
@Component
class KakaoClient(
    @Value("\${app.auth.kakao.client-id:}") private val clientId: String,
    @Value("\${app.auth.kakao.client-secret:}") private val clientSecret: String,
    @Value("\${app.auth.kakao.redirect-uri:}") private val redirectUri: String,
    private val restClient: RestClient = RestClient.create(),
) {
    /** 로그인 설정이 없으면 로그인 기능 자체를 닫는다 — 반쯤 켜진 인증이 제일 위험하다. */
    val configured: Boolean get() = clientId.isNotBlank() && redirectUri.isNotBlank()

    /** 사용자를 보낼 카카오 동의 화면 주소. state 는 CSRF 방지용 1회성 값이다. */
    fun authorizeUrl(state: String): String =
        "https://kauth.kakao.com/oauth/authorize" +
            "?response_type=code" +
            "&client_id=$clientId" +
            "&redirect_uri=$redirectUri" +
            "&state=$state"

    /** 인가 코드 → 액세스 토큰 → 프로필. 어느 단계든 실패하면 null(로그인 실패로 안내). */
    fun profileOf(code: String): KakaoProfile? {
        val accessToken = exchangeToken(code) ?: return null
        return fetchProfile(accessToken)
    }

    private fun exchangeToken(code: String): String? = runCatching {
        val form = LinkedMultiValueMap<String, String>().apply {
            add("grant_type", "authorization_code")
            add("client_id", clientId)
            add("redirect_uri", redirectUri)
            add("code", code)
            if (clientSecret.isNotBlank()) add("client_secret", clientSecret)
        }
        restClient.post()
            .uri("https://kauth.kakao.com/oauth/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(JsonNode::class.java)
            ?.path("access_token")?.asString(null)
    }.getOrNull()

    private fun fetchProfile(accessToken: String): KakaoProfile? = runCatching {
        val body = restClient.get()
            .uri("https://kapi.kakao.com/v2/user/me")
            .header("Authorization", "Bearer $accessToken")
            .retrieve()
            .body(JsonNode::class.java) ?: return null
        parseProfile(body)
    }.getOrNull()

    companion object {
        /** 순수 함수 — 응답 모양이 바뀌어도 여기만 보면 된다. 닉네임이 없으면 로그인 실패로 친다. */
        fun parseProfile(body: JsonNode): KakaoProfile? {
            val id = body.path("id").asString(null) ?: return null
            val account = body.path("kakao_account").path("profile")
            val nickname = account.path("nickname").asString(null)?.takeIf { it.isNotBlank() }
                ?: "팬${id.takeLast(4)}"
            return KakaoProfile(
                id = id,
                nickname = nickname.take(50),
                profileImageUrl = account.path("thumbnail_image_url").asString(null)?.takeIf { it.isNotBlank() },
            )
        }
    }
}
