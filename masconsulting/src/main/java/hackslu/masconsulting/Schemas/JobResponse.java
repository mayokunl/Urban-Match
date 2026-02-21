package hackslu.masconsulting.Schemas;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public record JobResponse(
        String title,
        @JsonProperty("display_name") String companyName,
        String description,
        @JsonProperty("redirect_url") String redirectUrl,
        Map<String, Object> location,
        Double salary_min
) {}