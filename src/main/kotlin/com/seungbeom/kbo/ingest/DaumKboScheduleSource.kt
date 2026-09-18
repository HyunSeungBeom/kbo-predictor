package com.seungbeom.kbo.ingest

import com.seungbeom.kbo.game.GameStatus
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

/**
 * 라이브 출처(다음 스포츠 일정 API) 어댑터 — `live` 프로필에서만 활성화.
 *
 * 엔드포인트는 공개 문서가 없어 sports.daum.net 의 KBO 일정 페이지가 실제로 호출하는
 * XHR 을 확인해 확정했다(2026-08 기준). 문서화되지 않은 API이므로 **언제든 깨질 수 있다** —
 * 그래서 fetch 실패는 예외를 던지지 않고 빈 리스트 + 경고 로그로 흡수하고([fetch]),
 * 파싱은 필드 누락에 전부 null-safe 하게 대응한다([parseGame]).
 * 깨지면 시드 데이터로 자동 폴백되는 게 아니라 "그 달만 반영 0건"이 되므로 로그를 봐야 한다.
 */
@Component
@Profile("live")
class DaumKboScheduleSource(
    private val restClient: RestClient = RestClient.create(),
) : KboScheduleSource {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun fetch(month: YearMonth): List<ScrapedGame> {
        val url = buildUrl(month)
        return try {
            val body = restClient.get()
                .uri(url)
                // 이 두 헤더가 없으면 봇으로 보고 막는 경우가 있어 브라우저처럼 보이게 한다.
                .header("User-Agent", USER_AGENT)
                .header("Referer", "https://sports.daum.net/")
                .retrieve()
                .body(String::class.java)
            parse(body).also { log.info("다음 일정 {}건 수신 ({})", it.size, month) }
        } catch (e: Exception) {
            log.warn("다음 스케줄 fetch 실패({}): {}", url, e.message)
            emptyList()
        }
    }

    companion object {
        private const val USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
                "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

        private val DATE_KEY = DateTimeFormatter.ofPattern("yyyyMMdd")
        private val mapper = ObjectMapper()

        /**
         * 다음 팀 id → 우리 DB 팀 코드([com.seungbeom.kbo.team.Team]).
         * 팀명("SSG")은 구단 브랜드 변경으로 바뀔 수 있지만 id 는 안 바뀌므로 id 를 1차 키로 쓴다.
         */
        private val TEAM_BY_ID = mapOf(
            382L to "WO",     // 키움 히어로즈
            383L to "SS",     // 삼성 라이온즈
            384L to "SK",     // SSG 랜더스
            385L to "OB",     // 두산 베어스
            386L to "LT",     // 롯데 자이언츠
            387L to "LG",     // LG 트윈스
            389L to "HT",     // KIA 타이거즈
            390L to "HH",     // 한화 이글스
            172615L to "NC",  // NC 다이노스
            394601L to "KT",  // KT 위즈
        )

        /** id 가 바뀌거나 새 구단이 생겼을 때를 위한 2차 폴백(팀명 기준). */
        private val TEAM_BY_NAME = mapOf(
            "키움" to "WO", "삼성" to "SS", "SSG" to "SK", "두산" to "OB", "롯데" to "LT",
            "LG" to "LG", "KIA" to "HT", "한화" to "HH", "NC" to "NC", "KT" to "KT",
        )

        fun buildUrl(month: YearMonth): String =
            "https://issue.daum.net/api/arms/SPORTS_SCHEDULE" +
                "?leagueCode=kbo" +
                "&fromDate=${month.atDay(1).format(DATE_KEY)}" +
                "&toDate=${month.atEndOfMonth().format(DATE_KEY)}" +
                "&seasonKey=${month.year}"

        /**
         * 순수 함수: 응답 JSON 문자열 → [ScrapedGame] 목록.
         * 네트워크 없이 단독 테스트 가능하게 분리했다(스크래퍼의 진짜 로직은 여기).
         *
         * 응답 형태: `{ document: { schedule: { "20260804": [ {경기}, ... ], ... } } }`
         */
        fun parse(json: String?): List<ScrapedGame> {
            if (json.isNullOrBlank()) return emptyList()
            val schedule = mapper.readTree(json).path("document").path("schedule")
            if (!schedule.isObject) return emptyList()

            return schedule.properties()
                .flatMap { (_, gamesOfDay) -> gamesOfDay }
                .mapNotNull { parseGame(it) }
                .sortedWith(compareBy({ it.gameDate }, { it.homeTeamId }))
        }

        /** 경기 1건 매핑. 매핑 불가(팀 미상)거나 집계에서 빼야 할 경기면 null. */
        private fun parseGame(n: JsonNode): ScrapedGame? {
            // 취소 경기는 아예 버린다. SCHEDULED 로 넣으면 몬테카를로가 "남은 경기"로 세어
            // 잔여 일정을 부풀리고, 우천 순연분은 어차피 새 날짜로 다시 내려온다.
            val rawStatus = n.path("gameStatus").asString(null)
            if (rawStatus == "CANCEL") return null

            // 페넌트레이스만 사용(시범경기·올스타·포스트시즌 제외). 필드가 없으면 통과시킨다.
            val detailType = n.path("gameDetailType").path("nameKo").asString(null)
            if (detailType != null && detailType != "페넌트레이스") return null

            val date = n.path("startDate").asString(null)?.let {
                runCatching { LocalDate.parse(it, DATE_KEY) }.getOrNull()
            } ?: return null

            val home = teamCode(n, "home") ?: return null
            val away = teamCode(n, "away") ?: return null

            val finished = rawStatus == "END"
            return ScrapedGame(
                gameDate = date,
                homeTeamId = home,
                awayTeamId = away,
                // 점수는 문자열("10")로 내려온다. 종료 경기가 아니면 null.
                homeScore = if (finished) n.path("homeResult").asString(null)?.toIntOrNull() else null,
                awayScore = if (finished) n.path("awayResult").asString(null)?.toIntOrNull() else null,
                status = if (finished) GameStatus.FINAL else GameStatus.SCHEDULED,
                // 선발은 경기 당일에 확정·변경된다. 발표 전이면 필드가 없거나 빈 문자열이다.
                homeStartPitcher = n.path("homeStartPitcher").asString(null)?.ifBlank { null },
                awayStartPitcher = n.path("awayStartPitcher").asString(null)?.ifBlank { null },
                // "1830" → "18:30". 형식이 다르면 버린다(화면 표시용이라 없어도 무방).
                startTime = n.path("startTime").asString(null)?.let(::formatTime),
                stadium = n.path("fieldName").asString(null)?.ifBlank { null },
                externalId = n.path("gameId").asString(null)?.ifBlank { null },
            )
        }

        /** "1830" → "18:30". 네 자리 숫자가 아니면 null. */
        fun formatTime(raw: String): String? =
            if (raw.length == 4 && raw.all(Char::isDigit)) "${raw.take(2)}:${raw.drop(2)}" else null

        private fun teamCode(n: JsonNode, side: String): String? {
            val id = n.path("${side}TeamId").asLong(0L)
            TEAM_BY_ID[id]?.let { return it }
            val name = n.path("${side}TeamName").asString(null)
            return TEAM_BY_NAME[name]
        }
    }
}
