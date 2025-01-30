package com.hedgedog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HedgeDogApplication {

	public static void main(String[] args) {
		SpringApplication.run(HedgeDogApplication.class, args);
	}

}