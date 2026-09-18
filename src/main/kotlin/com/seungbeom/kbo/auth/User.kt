package com.seungbeom.kbo.auth

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

/** 어떤 소셜로 들어왔는가. 지금은 카카오뿐이고, 네이버를 붙일 자리다. */
enum class AuthProvider { KAKAO }

/**
 * 로그인한 사람. **닉네임과 프로필 이미지만** 갖는다 — 이메일·전화번호는 받지도 저장하지도 않는다.
 * 소셜 로그인만 쓰므로 비밀번호를 보관하지 않는다(해싱·재설정·유출 대응이 통째로 사라진다).
 */
@Entity
@Table(name = "app_user")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val provider: String = AuthProvider.KAKAO.name,
    val providerUserId: String,

    var nickname: String,
    var profileImageUrl: String? = null,

    val createdAt: Instant = Instant.now(),
)
