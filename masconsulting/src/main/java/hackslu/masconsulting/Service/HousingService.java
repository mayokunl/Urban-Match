package hackslu.masconsulting.Service;

import hackslu.masconsulting.Config.UrlConfig;
import hackslu.masconsulting.Schemas.HousingDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class HousingService {

    private final RestClient restClient = RestClient.create();
    private final UrlConfig urlConfig;

    public HousingService(UrlConfig urlConfig) {
        this.urlConfig = urlConfig;
    }

    public List<HousingDto.Property> getHousingForJob(String location) {
        String query = location == null ? "" : location.trim();
        if (query.isEmpty()) query = "St Louis";

        if (query.matches("\\d{5}")) {
            return fetchByLocation(query);
        }

        // RapidAPI SearchRent is much more reliable with ZIP codes than city names.
        LinkedHashSet<String> zipCandidates = new LinkedHashSet<>();
        String low = query.toLowerCase();
        if (low.contains("st louis") || low.contains("saint louis")) {
            zipCandidates.add("63103");
            zipCandidates.add("63104");
            zipCandidates.add("63108");
            zipCandidates.add("63110");
            zipCandidates.add("63118");
            zipCandidates.add("63139");
            zipCandidates.add("63143");
            zipCandidates.add("63031");
        }

        // Try original city string once first (in case provider supports it later).
        List<HousingDto.Property> cityResults = fetchByLocation(query + ", MO");
        if (!cityResults.isEmpty()) {
            return dedupe(cityResults);
        }

        List<HousingDto.Property> merged = new ArrayList<>();
        for (String zip : zipCandidates) {
            merged.addAll(fetchByLocation(zip));
        }
        return dedupe(merged);
    }

    private List<HousingDto.Property> fetchByLocation(String locationParam) {
        String url = UriComponentsBuilder
            .fromHttpUrl("https://realty-base-us.p.rapidapi.com/SearchRent")
            .queryParam("location", locationParam)
            .queryParam("sort", "best_match")
            .build()
            .encode()
            .toUriString();

        try {
            HousingDto.Root response = restClient.get()
                .uri(url)
                .header("x-rapidapi-host", "realty-base-us.p.rapidapi.com")
                .header("x-rapidapi-key", urlConfig.getApiKey2())
                .retrieve()
                .body(HousingDto.Root.class);

            return (response != null && response.getData() != null) ? response.getData() : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<HousingDto.Property> dedupe(List<HousingDto.Property> properties) {
        Map<String, HousingDto.Property> unique = new LinkedHashMap<>();
        for (HousingDto.Property p : properties) {
            if (p == null) continue;
            String key = p.getPropertyId();
            if (key == null || key.isBlank()) {
                HousingDto.Address a = p.getLocation() != null ? p.getLocation().getAddress() : null;
                key = (a != null ? a.getLine() : "") + "|" + p.getHref();
            }
            unique.putIfAbsent(key, p);
        }
        return new ArrayList<>(unique.values());
    }
}
