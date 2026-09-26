package com.chess.analyzer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameSummary {
    private String id;
    private String url;
    private String pgn;
    private String timeControl;
    private String timeClass;
    private boolean rated;

    private String whiteUsername;
    private Integer whiteRating;
    private String whiteResult;

    private String blackUsername;
    private Integer blackRating;
    private String blackResult;

    private Long endTime;
    private String opening;
    private String eco;
}
