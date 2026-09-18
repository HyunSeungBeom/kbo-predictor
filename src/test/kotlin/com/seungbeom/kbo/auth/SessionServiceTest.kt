package com.seungbeom.kbo.auth

import org.mockito.ArgumentMatchers
import org.mockito.BDDMockito.given
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import java.time.Instant
import java.util.Optional
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

/**
 * 세션 조회 — «만료됐는데 통과» 하면 로그아웃도 차단도 의미가 없어진다.
 * 저장소는 목으로 두고 판정만 본다.
 */
class SessionServiceTest {

    @Suppress("UNCHECKED_CAST")
    private fun <T> anyArg(): T = ArgumentMatchers.any<T>() as T

    private val sessions = mock(UserSessionRepository::class.java)
    private val users = mock(UserRepository::class.java)
    private val service = SessionService(sessions, users)

    private val user = User(id = 7, providerUserId = "kakao-7", nickname = "두산팬")
    private val token = "token-abc"

    private fun sessionOf(expiresAt: Instant) =
        UserSession(SessionTokens.hash(token), userId = 7, expiresAt = expiresAt)

    @Test
    fun `살아 있는 세션이면 그 사람을 돌려준다`() {
        given(sessions.findById(SessionTokens.hash(token)))
            .willReturn(Optional.of(sessionOf(Instant.now().plusSeconds(600))))
        given(users.findById(7)).willReturn(Optional.of(user))

        assertEquals(user, service.userOf(token))
    }

    @Test
    fun `만료된 세션은 통과시키지 않고 그 자리에서 지운다`() {
        val expired = sessionOf(Instant.now().minusSeconds(1))
        given(sessions.findById(SessionTokens.hash(token))).willReturn(Optional.of(expired))

        assertNull(service.userOf(token), "만료된 세션으로 로그인됐다")
        verify(sessions).delete(expired)
    }

    @Test
    fun `쿠키가 없거나 비어 있으면 비로그인이다`() {
        assertNull(service.userOf(null))
        assertNull(service.userOf(""))
        assertNull(service.userOf("   "))
    }

    @Test
    fun `모르는 토큰은 비로그인이다`() {
        given(sessions.findById(anyArg())).willReturn(Optional.empty())

        assertNull(service.userOf("아무거나"))
    }

    @Test
    fun `로그아웃하면 서버에서 세션을 지운다 — 쿠키를 갖고 있어도 통하지 않는다`() {
        service.revoke(token)

        verify(sessions).deleteById(SessionTokens.hash(token))
    }

    @Test
    fun `로그아웃은 토큰이 없으면 아무것도 하지 않는다`() {
        service.revoke(null)

        verify(sessions, org.mockito.Mockito.never()).deleteById(anyArg())
    }
}
