package hackslu.masconsulting.Service;

import hackslu.masconsulting.Config.UrlConfig;
import hackslu.masconsulting.Schemas.*; // This brings in the correct JobDto and AdzunaResponse

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Service
public class AdzunaService {

    private final UrlConfig urlConfig;
    private final RestClient restClient;

    public AdzunaService(UrlConfig urlConfig) {
        this.urlConfig = urlConfig;
        this.restClient = RestClient.create();
    }

    // Change return type to the one imported from Schemas
    public List<JobDto> searchJobs(String role) {
        String location = "Saint Louis";

        // 1. Build the URI and explicitly call .encode()
        String finalUrl = UriComponentsBuilder
                .fromHttpUrl(urlConfig.getAdzunaurl())
                .queryParam("app_id", urlConfig.getAppId())
                .queryParam("app_key", urlConfig.getApiKey())
                .queryParam("results_per_page", 10)
                .queryParam("where", "SaintLouis")
                .queryParam("what", role)
                .build()
                .encode() // This safely turns "Saint Louis" into "Saint%20Louis"
                .toUriString();

        System.out.println("Final Request URL: " + finalUrl);

        try {
            AdzunaResponse response = restClient.get()
                    .uri(finalUrl)
                    .retrieve()
                    .body(AdzunaResponse.class);

            return (response != null && response.getResults() != null)
                    ? response.getResults()
                    : List.of();
        } catch (Exception e) {
            // Log the error so you can see it in the IntelliJ console
            System.err.println("Search failed: " + e.getMessage());
            return List.of();
        }
    }
}