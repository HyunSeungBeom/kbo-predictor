package com.seungbeom.kbo.board

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant

interface PostRepository : JpaRepository<Post, Long> {
    fun findByTeamIdAndDeletedAtIsNullOrderByCreatedAtDesc(teamId: String, pageable: Pageable): Page<Post>

    fun findByIdAndDeletedAtIsNull(id: Long): Post?

    /** 도배 방지 — 최근 N분 동안 이 사람이 쓴 글 수. */
    fun countByAuthorIdAndCreatedAtAfter(authorId: Long, since: Instant): Long
}
