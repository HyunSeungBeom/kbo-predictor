package com.seungbeom.kbo.auth

import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64

/**
 * 세션 토큰을 만들고 해시한다 — 순수 함수라 DB·Spring 없이 검증할 수 있다.
 *
 * **왜 해시로 저장하나**: 쿠키에 담기는 원본 토큰은 그 자체가 «비밀번호» 다. DB 에 원본을 그대로
 * 두면 DB 유출 = 전원 계정 탈취다. 해시만 저장하면 유출돼도 그것으로 로그인할 수 없다.
 * 비밀번호와 달리 토큰은 길고 무작위라 느린 해시(bcrypt)가 필요 없다 — SHA-256 이면 충분하다.
 */
object SessionTokens {

    /** 32바이트(256비트). 추측으로 맞힐 수 없는 길이 */
    private const val TOKEN_BYTES = 32
    private val random = SecureRandom()
    private val encoder = Base64.getUrlEncoder().withoutPadding()

    fun newToken(): String {
        val bytes = ByteArray(TOKEN_BYTES)
        random.nextBytes(bytes)
        return encoder.encodeToString(bytes)
    }

    fun hash(token: String): String =
        MessageDigest.getInstance("SHA-256")
            .digest(token.toByteArray())
            .joinToString("") { "%02x".format(it) }
}
