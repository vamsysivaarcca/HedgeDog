package com.hedgedog.repository;
import com.hedgedog.model.MonitoredEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MonitoredEventRepository extends JpaRepository<MonitoredEvent, Long> {
    List<MonitoredEvent> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}