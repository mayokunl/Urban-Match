package hackslu.masconsulting.Service;

import hackslu.masconsulting.Config.UrlConfig;
import hackslu.masconsulting.Schemas.HousingDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HousingService {

    private final RestClient restClient = RestClient.create();
    private final UrlConfig urlConfig;

    public HousingService(UrlConfig urlConfig) {
        this.urlConfig = urlConfig;
    }

    public List<HousingDto.Property> getHousingForJob(String location) {
        // If the input is a city name, the API usually wants "City, State"
        // If it's a Zip, it works as is.
        String locationParam = location.matches("\\d{5}") ? location : location + ", MO";

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
}