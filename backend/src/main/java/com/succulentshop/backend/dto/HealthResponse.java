package com.succulentshop.backend.dto;

public class HealthResponse {
    private String status;
    private String service;
    private String framework;
    private String database;
    private String timestamp;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getFramework() { return framework; }
    public void setFramework(String framework) { this.framework = framework; }

    public String getDatabase() { return database; }
    public void setDatabase(String database) { this.database = database; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
