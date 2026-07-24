package com.jjikboka.app.stats;

import com.jjikboka.auth.UserQueryService;
import com.jjikboka.core.stats.RankEntry;
import com.jjikboka.core.stats.RankingService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 랭킹 조립 (API-20, app 파사드). 랭킹 값(core.stats)과 닉네임(auth)을 엮는다 — auth·core는 다른 슬라이스라
 * app이 양쪽을 불러 순위를 붙인다(13 §2). 닉네임 외 개인정보는 싣지 않는다.
 */
@Service
public class RankingFacade {

    private static final int RANK_LIMIT = 50;

    private final RankingService rankingService;
    private final UserQueryService userQueryService;

    RankingFacade(RankingService rankingService, UserQueryService userQueryService) {
        this.rankingService = rankingService;
        this.userQueryService = userQueryService;
    }

    public RankingResponse getRanking(String scope) {
        String applied = "level".equals(scope) ? "level" : "weekly";   // 기본 weekly
        List<RankEntry> entries = rankingService.getRanking(applied, RANK_LIMIT);
        Map<Long, String> nicknames = userQueryService.getNicknames(
                entries.stream().map(RankEntry::userId).toList());

        List<RankItem> items = new ArrayList<>();
        int rank = 1;
        for (RankEntry entry : entries) {
            items.add(new RankItem(rank++, nicknames.getOrDefault(entry.userId(), "알 수 없음"), entry.value()));
        }
        return new RankingResponse(applied, items);
    }
}
