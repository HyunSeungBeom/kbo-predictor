package com.seungbeom.kbo.auth

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import java.time.Instant

interface UserRepository : JpaRepository<User, Long> {
    fun findByProviderAndProviderUserId(provider: String, providerUserId: String): User?
}

interface UserSessionRepository : JpaRepository<UserSession, String> {
    @Modifying
    @Query("delete from UserSession s where s.expiresAt < :now")
    fun deleteExpired(now: Instant): Int
}
