package com.succulentshop.backend.dto;

public class DeleteImageResponse {
    private boolean deleted;
    private String target;

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
}
