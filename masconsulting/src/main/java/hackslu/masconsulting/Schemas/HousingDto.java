package hackslu.masconsulting.Schemas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HousingDto {

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Root {
        private List<Property> data;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Property {
        @JsonProperty("property_id")
        private String propertyId;

        @JsonProperty("list_price_min")
        private Integer priceMin;

        @JsonProperty("list_price_max")
        private Integer priceMax;

        private String href;
        private Location location;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Location {
        private Address address;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Address {
        private String line;
        private String city;
        private String state;
        @JsonProperty("postal_code")
        private String zip;
    }
}