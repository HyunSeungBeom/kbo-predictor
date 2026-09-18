package com.seungbeom.kbo.board

import java.time.Duration

/** 글이 규칙을 어겼을 때의 이유. 화면에 그대로 보여준다. */
enum class PostViolation(val message: String) {
    EMPTY_TITLE("제목을 입력해 주세요"),
    LONG_TITLE("제목은 100자까지 쓸 수 있어요"),
    EMPTY_CONTENT("내용을 입력해 주세요"),
    LONG_CONTENT("내용은 2000자까지 쓸 수 있어요"),
    UNKNOWN_TEAM("없는 게시판이에요"),
    TOO_MANY("잠시 후에 다시 써주세요 (1분에 3개까지)"),
}

/**
 * 게시글 규칙 — **순수 함수**라 DB·Spring 없이 검증한다.
 *
 * 내용은 **평문으로만** 다룬다(HTML·마크다운 없음). 태그를 허용하는 순간 XSS 를 막는 책임이
 * 생기는데, 응원 글에 그만한 값이 없다. 화면은 React 가 escape 한 채로 그린다.
 */
object PostRules {

    const val MAX_TITLE = 100
    const val MAX_CONTENT = 2000

    /** 도배 방지: 같은 사람이 1분에 3개까지 */
    val RATE_WINDOW: Duration = Duration.ofMinutes(1)
    const val RATE_LIMIT = 3

    fun validate(title: String, content: String, knownTeamIds: Set<String>, teamId: String): List<PostViolation> =
        buildList {
            val trimmedTitle = title.trim()
            val trimmedContent = content.trim()
            if (trimmedTitle.isEmpty()) add(PostViolation.EMPTY_TITLE)
            else if (trimmedTitle.length > MAX_TITLE) add(PostViolation.LONG_TITLE)
            if (trimmedContent.isEmpty()) add(PostViolation.EMPTY_CONTENT)
            else if (trimmedContent.length > MAX_CONTENT) add(PostViolation.LONG_CONTENT)
            if (teamId !in knownTeamIds) add(PostViolation.UNKNOWN_TEAM)
        }

    /** 글을 고치거나 지울 수 있는 사람은 **글쓴이 본인뿐**이다. */
    fun canModify(post: Post, userId: Long?): Boolean = userId != null && post.authorId == userId
}
