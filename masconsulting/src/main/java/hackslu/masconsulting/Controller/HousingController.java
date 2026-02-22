package hackslu.masconsulting.Controller;

import hackslu.masconsulting.Schemas.HousingDto;
import hackslu.masconsulting.Service.HousingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/housing") // Root path
@CrossOrigin(origins = "*")
public class HousingController {

    private final HousingService housingService;

    public HousingController(HousingService housingService) {
        this.housingService = housingService;
    }

    @GetMapping("/search-by-city") // Sub-path
    public List<HousingDto.Property> getHousingByCity(@RequestParam String city) {
        return housingService.getHousingForJob(city);
    }
}