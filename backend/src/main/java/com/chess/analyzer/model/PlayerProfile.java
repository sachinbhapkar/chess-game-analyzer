package com.chess.analyzer.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PlayerProfile {
    private String username;
    private String name;
    private String avatar;
    private String title;
    private String url;
    private String country;
    private int followers;

    @JsonProperty("joined")
    private Long joinedTimestamp;

    @JsonProperty("last_online")
    private Long lastOnlineTimestamp;

    // Optional aggregated stats
    private Map<String, Object> stats;
}
