package hackslu.masconsulting.Config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class UrlConfig {

    @Value("${adzuna.api_key}")
    private String apiKey;

    @Value("${adzuna.app_id}")
    private String appId;

    @Value("${adzuna.url}")
    private String adzunaurl;

    @PostConstruct
    public void test(){
        System.out.print(adzunaurl);
    }


}