package com.seungbeom.kbo.auth

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

/**
 * 세션 토큰 — 여기가 뚫리면 남의 계정으로 글을 쓸 수 있다.
 * 값이 «추측 불가» 하고 «DB 에 원본이 남지 않는다» 는 두 성질을 고정한다.
 */
class SessionTokensTest {

    @Test
    fun `토큰은 매번 다르다 — 같은 값이 나오면 남의 세션과 겹친다`() {
        val tokens = (1..500).map { SessionTokens.newToken() }

        assertEquals(500, tokens.toSet().size)
    }

    @Test
    fun `토큰은 URL 에 그대로 담을 수 있고 충분히 길다`() {
        val token = SessionTokens.newToken()

        assertTrue(token.length >= 40, "너무 짧다: ${token.length}자")
        assertTrue(token.all { it.isLetterOrDigit() || it == '-' || it == '_' }, "URL 안전 문자가 아니다: $token")
    }

    @Test
    fun `해시는 같은 토큰에 항상 같고 다른 토큰에 다르다`() {
        val token = SessionTokens.newToken()

        assertEquals(SessionTokens.hash(token), SessionTokens.hash(token))
        assertNotEquals(SessionTokens.hash(token), SessionTokens.hash(SessionTokens.newToken()))
    }

    @Test
    fun `해시에서 토큰을 되돌릴 수 없다 — 원본이 그대로 들어 있지 않다`() {
        val token = SessionTokens.newToken()

        val hash = SessionTokens.hash(token)

        assertNotEquals(token, hash)
        assertTrue(!hash.contains(token.take(8)), "해시에 토큰 조각이 남아 있다")
        assertEquals(64, hash.length) // SHA-256 16진수 표기
    }
}

/** 만료 경계 — 만료된 세션이 한 번이라도 통과하면 로그아웃이 의미를 잃는다. */
class SessionExpiryTest {

    private val issued = java.time.Instant.parse("2026-09-18T00:00:00Z")
    private val session = UserSession("hash", userId = 1, expiresAt = issued.plusSeconds(60))

    @kotlin.test.Test
    fun `만료 시각 전에는 살아 있다`() {
        kotlin.test.assertFalse(SessionService.expired(session, issued.plusSeconds(59)))
    }

    @kotlin.test.Test
    fun `만료 시각이 되면 끝난다 — 경계는 만료 쪽`() {
        kotlin.test.assertTrue(SessionService.expired(session, issued.plusSeconds(60)))
        kotlin.test.assertTrue(SessionService.expired(session, issued.plusSeconds(61)))
    }
}
