package com.seungbeom.kbo.auth

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

/**
 * 서버가 들고 있는 세션. 쿠키에는 원본 토큰이, DB 에는 그 **해시만** 들어간다 —
 * DB 가 새더라도 남의 세션으로 로그인할 수 없다(비밀번호를 해싱해 두는 것과 같은 이유).
 */
@Entity
@Table(name = "user_session")
class UserSession(
    @Id
    val tokenHash: String,
    val userId: Long,
    val expiresAt: Instant,
    val createdAt: Instant = Instant.now(),
)
