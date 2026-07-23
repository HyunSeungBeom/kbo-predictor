package com.seungbeom.kbo.team

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

/**
 * KBO 구단. id 는 약칭 코드(예: "OB" 두산). 승/패/무는 순위·확률 계산의 입력.
 *
 * 계산 로직(승률 등)은 엔티티에 두지 않고 서비스 계층에서 처리한다
 * — JPA 접근 방식(property access)에서 파생 프로퍼티가 컬럼으로 오인되는 것을 피하기 위함.
 */
@Entity
@Table(name = "team")
class Team(
    @Id
    val id: String,
    val name: String,
    var wins: Int = 0,
    var losses: Int = 0,
    var draws: Int = 0,
)
