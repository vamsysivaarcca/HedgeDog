package com.hedgedog.repository;

import com.hedgedog.model.MonitoredEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonitoredEventRepository extends JpaRepository<MonitoredEvent, Long> {
    MonitoredEvent findByUserId(Long userId);
}
