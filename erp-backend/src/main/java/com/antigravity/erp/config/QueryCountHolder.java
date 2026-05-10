package com.antigravity.erp.config;

public class QueryCountHolder {
    private static final ThreadLocal<Long> queryCount = new ThreadLocal<>();
    private static final ThreadLocal<Long> startTime = new ThreadLocal<>();

    public static void init() {
        queryCount.set(0L);
        startTime.set(System.currentTimeMillis());
    }

    public static void increment() {
        Long count = queryCount.get();
        if (count != null) {
            queryCount.set(count + 1);
        }
    }

    public static Long getCount() {
        return queryCount.get();
    }

    public static Long getTimeElapsed() {
        Long start = startTime.get();
        if (start == null) return 0L;
        return System.currentTimeMillis() - start;
    }

    public static void clear() {
        queryCount.remove();
        startTime.remove();
    }
}
