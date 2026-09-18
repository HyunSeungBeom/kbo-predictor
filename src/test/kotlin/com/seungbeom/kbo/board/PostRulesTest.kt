package com.seungbeom.kbo.board

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/** 게시글 규칙. 권한 판정이 틀리면 **남의 글을 고칠 수 있게 된다** — 여기가 제일 중요하다. */
class PostRulesTest {

    private val teams = setOf("OB", "LG")

    private fun validate(title: String = "제목", content: String = "내용", teamId: String = "OB") =
        PostRules.validate(title, content, teams, teamId)

    @Test
    fun `제목과 내용이 있으면 통과한다`() {
        assertEquals(emptyList(), validate())
    }

    @Test
    fun `공백만 있는 것은 빈 것으로 본다 — 스페이스로 우회하지 못하게`() {
        assertEquals(listOf(PostViolation.EMPTY_TITLE), validate(title = "   "))
        assertEquals(listOf(PostViolation.EMPTY_CONTENT), validate(content = "\n \t "))
    }

    @Test
    fun `길이 제한은 경계에서 갈린다`() {
        assertEquals(emptyList(), validate(title = "가".repeat(PostRules.MAX_TITLE)))
        assertEquals(listOf(PostViolation.LONG_TITLE), validate(title = "가".repeat(PostRules.MAX_TITLE + 1)))
        assertEquals(emptyList(), validate(content = "가".repeat(PostRules.MAX_CONTENT)))
        assertEquals(listOf(PostViolation.LONG_CONTENT), validate(content = "가".repeat(PostRules.MAX_CONTENT + 1)))
    }

    @Test
    fun `없는 게시판에는 쓸 수 없다`() {
        assertEquals(listOf(PostViolation.UNKNOWN_TEAM), validate(teamId = "XX"))
    }

    @Test
    fun `위반이 여러 개면 모두 알려준다 — 고치고 다시 막히는 일이 없게`() {
        assertEquals(
            listOf(PostViolation.EMPTY_TITLE, PostViolation.EMPTY_CONTENT, PostViolation.UNKNOWN_TEAM),
            validate(title = "", content = "", teamId = "ZZ"),
        )
    }

    @Test
    fun `글은 글쓴이만 고치고 지울 수 있다`() {
        val post = Post(id = 1, teamId = "OB", authorId = 7, title = "t", content = "c")

        assertTrue(PostRules.canModify(post, userId = 7))
        assertFalse(PostRules.canModify(post, userId = 8))
        assertFalse(PostRules.canModify(post, userId = null), "로그인하지 않은 사람이 통과했다")
    }
}
