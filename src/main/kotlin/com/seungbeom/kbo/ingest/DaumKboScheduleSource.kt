package com.seungbeom.kbo.ingest

import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.time.YearMonth

/**
 * 라이브 출처(다음 스포츠 JSON) 어댑터 — `live` 프로필에서만 활성화.
 *
 * ⚠️ TODO(라이브 연결): 다음 스포츠의 스케줄 JSON은 공개 문서가 없어 정확한 요청 파라미터를
 * 헤드리스로 확정하지 못했다. 브라우저에서 sports.daum.net KBO 일정 페이지를 열고
 * DevTools > Network 에서 `schedule.json` 요청의 실제 URL/파라미터를 확인한 뒤,
 * 아래 [endpointTemplate] 과 [parse] 매핑을 채우면 된다. 구조(RestClient fetch → parse)는 완성돼 있음.
 */
@Component
@Profile("live")
class DaumKboScheduleSource(
    private val restClient: RestClient = RestClient.create(),
) : KboScheduleSource {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun fetch(month: YearMonth): List<ScrapedGame> {
        val url = endpointTemplate.format(month.year, month.monthValue)
        return try {
            val body = restClient.get()
                .uri(url)
                .header("User-Agent", "Mozilla/5.0")
                .retrieve()
                .body(String::class.java)
            parse(body)
        } catch (e: Exception) {
            log.warn("다음 스케줄 fetch 실패({}): {}", url, e.message)
            emptyList()
        }
    }

    /** TODO: 라이브 확인 후 실제 엔드포인트로 교체. %d=연, %02d=월. */
    private val endpointTemplate =
        "https://sports.daum.net/prx/hermes/api/game/schedule.json?leagueCode=11&seriesCode=&date=%d%02d"

    /** TODO: 실제 JSON 구조 확인 후 ScrapedGame 리스트로 매핑. */
    private fun parse(@Suppress("UNUSED_PARAMETER") json: String?): List<ScrapedGame> = emptyList()
}
