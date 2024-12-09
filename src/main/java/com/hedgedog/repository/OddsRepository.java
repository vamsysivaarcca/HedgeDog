package com.hedgedog.repository;

import com.hedgedog.model.Odds;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OddsRepository extends JpaRepository<Odds, Long> {
}
