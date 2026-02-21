package hackslu.masconsulting.Schemas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AdzunaResponse {
    private Integer count;
    private List<JobDto> results;
}