package hackslu.masconsulting.Schemas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobDto {
    private String id;
    private String title;
    private String description;

    @JsonProperty("salary_min")
    private Double salaryMin;

    @JsonProperty("salary_max")
    private Double salaryMax;

    @JsonProperty("redirect_url")
    private String redirectUrl;

    // Added nested objects
    private CompanyDto company;
    private LocationDto location;

    @JsonProperty("contract_type")
    private String contractType;

    @JsonProperty("contract_time")
    private String contractTime;
}