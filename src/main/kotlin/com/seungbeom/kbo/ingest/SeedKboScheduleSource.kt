package com.seungbeom.kbo.ingest

import com.seungbeom.kbo.game.GameStatus
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.time.YearMonth

/**
 * 기본(개발용) 출처: 실제 스크래핑 없이 그럴듯한 샘플 경기를 만들어 파이프라인이
 * 지금 당장 동작하게 한다. `live` 프로필이 아닐 때 활성화.
 *
 * → 라이브 데이터로 바꾸려면 [DaumKboScheduleSource] 를 완성하고 `--spring.profiles.active=live` 로 실행.
 */
@Component
@Profile("!live")
class SeedKboScheduleSource : KboScheduleSource {

    override fun fetch(month: YearMonth): List<ScrapedGame> {
        val d = { day: Int -> month.atDay(day) }
        // 대진은 예시. 일부는 종료(점수 있음), 일부는 예정.
        return listOf(
            ScrapedGame(d(1), "OB", "LG", 5, 3, GameStatus.FINAL),
            ScrapedGame(d(1), "HT", "SS", 2, 7, GameStatus.FINAL),
            ScrapedGame(d(2), "LT", "NC", 4, 4, GameStatus.FINAL),
            ScrapedGame(d(3), "SK", "KT", null, null, GameStatus.SCHEDULED),
            ScrapedGame(d(3), "WO", "HH", null, null, GameStatus.SCHEDULED),
            ScrapedGame(d(4), "LG", "OB", null, null, GameStatus.SCHEDULED),
        )
    }
}
