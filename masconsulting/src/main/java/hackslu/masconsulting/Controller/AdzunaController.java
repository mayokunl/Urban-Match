package hackslu.masconsulting.Controller;

import hackslu.masconsulting.Schemas.JobDto;
import hackslu.masconsulting.Service.AdzunaService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class AdzunaController {

    private final AdzunaService adzunaService;

    public AdzunaController(AdzunaService adzunaService) {
        this.adzunaService = adzunaService;
    }

    @GetMapping("/search")
    public List<JobDto> getJobs(@RequestParam(value = "role", defaultValue = "Software Engineer") String role) {
        return adzunaService.searchJobs(role);
    }
}