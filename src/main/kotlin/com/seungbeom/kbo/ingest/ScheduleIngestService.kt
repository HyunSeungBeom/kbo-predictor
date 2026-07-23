package com.seungbeom.kbo.ingest

import com.seungbeom.kbo.game.Game
import com.seungbeom.kbo.game.GameRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.YearMonth

/**
 * 출처에서 한 달치를 가져와 DB에 **upsert**한다(멱등: 여러 번 돌려도 중복 안 생김).
 * 예정 경기는 나중에 결과가 나오면 같은 레코드가 점수·상태만 갱신된다.
 */
@Service
class ScheduleIngestService(
    private val gameRepository: GameRepository,
    private val source: KboScheduleSource,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun ingestMonth(month: YearMonth): Int {
        val scraped = source.fetch(month)
        for (s in scraped) {
            val existing = gameRepository.findByGameDateAndHomeTeamIdAndAwayTeamId(
                s.gameDate, s.homeTeamId, s.awayTeamId,
            )
            gameRepository.save(reconcile(existing, s))
        }
        log.info("ingest {} 완료: {}건 반영", month, scraped.size)
        return scraped.size
    }

    companion object {
        /**
         * 순수 함수: 기존 레코드(없으면 null)와 긁어온 데이터로 저장할 Game 을 만든다.
         * Spring/DB 없이 단독 테스트 가능 — 여기가 스크래퍼의 진짜 로직.
         */
        fun reconcile(existing: Game?, s: ScrapedGame): Game {
            val game = existing ?: Game(
                gameDate = s.gameDate,
                homeTeamId = s.homeTeamId,
                awayTeamId = s.awayTeamId,
            )
            game.homeScore = s.homeScore
            game.awayScore = s.awayScore
            game.status = s.status
            return game
        }
    }
}
