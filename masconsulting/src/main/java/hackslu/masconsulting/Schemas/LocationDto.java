package hackslu.masconsulting.Schemas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LocationDto {
    @JsonProperty("display_name")
    private String displayName;
    private List<String> area;
}