package com.seungbeom.kbo.board

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

/**
 * 팬 게시글. 팀별 게시판이라 [teamId] 가 어느 판인지 가리킨다.
 *
 * **지운 글은 바로 없애지 않는다**([deletedAt]) — 신고·분쟁 때 확인할 근거가 남아야 하고,
 * 실수로 지운 것도 되살릴 수 있다. 조회는 전부 deletedAt is null 조건을 건다.
 */
@Entity
@Table(name = "post")
class Post(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val teamId: String,
    val authorId: Long,

    var title: String,
    var content: String,

    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now(),
    var deletedAt: Instant? = null,
)
