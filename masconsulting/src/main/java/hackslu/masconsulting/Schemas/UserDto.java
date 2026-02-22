package hackslu.gens.Schemas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDto {
    private String uid;
    private String email;
    private String expectedSalary;
    private String familySize;
    private String fullName;
    private String housingBudget;
    private String interests;
    private String monthlyDebt;
    private String rentOrOwn;
    private String savedAt;



}