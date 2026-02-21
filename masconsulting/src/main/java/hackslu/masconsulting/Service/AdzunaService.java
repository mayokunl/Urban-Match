package hackslu.masconsulting.Service;

import hackslu.masconsulting.Config.UrlConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AdzunaService {

    private final UrlConfig urlConfig;
    private final RestClient restClient;

    public AdzunaService(UrlConfig urlConfig) {
        this.urlConfig = urlConfig;
        this.restClient = RestClient.create();
    }

    public String searchJobs(String what) {
        String finalUrl = UriComponentsBuilder
                .fromHttpUrl(urlConfig.getAdzunaurl())
                .queryParam("app_id", urlConfig.getAppId())
                .queryParam("app_key", urlConfig.getApiKey())
                .queryParam("results_per_page", 10)
                .queryParam("where", "St. Louis")
                .queryParam("what", what) // This is your passed variable
                .toUriString();

        return restClient.get()
                .uri(finalUrl)
                .retrieve()
                .body(String.class);
    }
}