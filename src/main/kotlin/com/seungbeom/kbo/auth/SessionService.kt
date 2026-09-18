package com.seungbeom.kbo.auth

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant

/** 로그인 세션의 발급·조회·폐기. 컨트롤러는 쿠키만 다루고 «누구인가» 판단은 여기가 한다. */
@Service
class SessionService(
    private val sessions: UserSessionRepository,
    private val users: UserRepository,
) {

    /** 새 세션을 만들고 **쿠키에 담을 원본 토큰**을 돌려준다(DB 에는 해시만 남는다). */
    @Transactional
    fun issue(userId: Long): String {
        val token = SessionTokens.newToken()
        sessions.save(UserSession(SessionTokens.hash(token), userId, Instant.now().plus(LIFETIME)))
        return token
    }

    /** 토큰이 가리키는 사람. 없거나 만료면 null — 만료된 세션은 그 자리에서 지운다. */
    @Transactional
    fun userOf(token: String?): User? {
        if (token.isNullOrBlank()) return null
        val session = sessions.findById(SessionTokens.hash(token)).orElse(null) ?: return null
        if (expired(session, Instant.now())) {
            sessions.delete(session)
            return null
        }
        return users.findById(session.userId).orElse(null)
    }

    /** 로그아웃 — 서버에서 지우므로 쿠키를 갖고 있어도 더는 통하지 않는다(JWT 와 다른 점). */
    @Transactional
    fun revoke(token: String?) {
        if (token.isNullOrBlank()) return
        sessions.deleteById(SessionTokens.hash(token))
    }

    companion object {
        /** 응원 글 쓰러 매번 로그인하게 만들 이유가 없다. 대신 서버에서 언제든 끊을 수 있다. */
        val LIFETIME: Duration = Duration.ofDays(30)

        /** 만료 판정만 떼어 둔 순수 함수 — 시간을 주입해 경계를 테스트한다. */
        fun expired(session: UserSession, now: Instant): Boolean = !session.expiresAt.isAfter(now)
    }
}
