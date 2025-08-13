/**
 * Application Configuration
 * General app settings and constants
 */

export const appConfig = {
    // App info
    name: "Contract Management System",
    shortName: "CMS",
    version: "1.0.0",
    description: "Hệ thống quản lý hợp đồng",

    // UI settings
    theme: {
        defaultTheme: "light",
        availableThemes: ["light", "dark"] as const,
    },

    // Pagination
    pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100] as const,
    },

    // Date/Time
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm:ss",
    dateTimeFormat: "DD/MM/YYYY HH:mm:ss",

    // File upload
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ] as const,
    },

    // Session
    session: {
        timeoutWarning: 5 * 60 * 1000, // 5 minutes before expiry
        maxInactivity: 30 * 60 * 1000, // 30 minutes
    },

    // Features flags
    features: {
        enableDarkMode: true,
        enableNotifications: true,
        enableFileUpload: true,
        enableExport: true,
    },
} as const;

export default appConfig;
