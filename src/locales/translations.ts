export const translations = {
  en: {
    // Navigation
    home: "Home",
    monitoring: "Live Monitoring",
    signalControl: "Signal Control",
    analytics: "Analytics",
    admin: "Admin",
    settings: "Settings",
    
    // Dashboard
    totalVehicles: "Total Vehicles",
    averageDensity: "Average Density",
    activeCameras: "Active Cameras",
    alerts: "Alerts",
    
    // Monitoring
    vehicleDetection: "Vehicle Detection",
    cars: "Cars",
    bikes: "Bikes",
    trucks: "Trucks",
    buses: "Buses",
    density: "Density",
    
    // Signal Control
    smartSignal: "Smart Signal Control",
    greenTime: "Green Time",
    redTime: "Red Time",
    manualOverride: "Manual Override",
    autoMode: "Auto Mode",
    
    // Analytics
    trafficAnalytics: "Traffic Analytics",
    peakHours: "Peak Hours",
    dailyReport: "Daily Report",
    congestionAnalysis: "Congestion Analysis",
    
    // Admin
    adminPanel: "Admin Panel",
    cameraManagement: "Camera Management",
    addCamera: "Add Camera",
    downloadReport: "Download Report",
    exportReport: "Export Report",
    
    // Settings
    settingsTitle: "Settings",
    language: "Language",
    developer: "Developer",
    theme: "Theme",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading..."
  },
  
  fa: {
    // Navigation
    home: "خانه",
    monitoring: "پایش زنده",
    signalControl: "کنترل سیگنال",
    analytics: "تحلیل داده",
    admin: "مدیریت",
    settings: "تنظیمات",
    
    // Dashboard
    totalVehicles: "مجموع وسایل نقلیه",
    averageDensity: "میانگین تراکم",
    activeCameras: "دوربینهای فعال",
    alerts: "هشدارها",
    
    // Monitoring
    vehicleDetection: "تشخیص وسایل نقلیه",
    cars: "ماشین",
    bikes: "موتور",
    trucks: "کامیون",
    buses: "اتوبوس",
    density: "تراکم",
    
    // Signal Control
    smartSignal: "کنترل هوشمند چراغ",
    greenTime: "زمان چراغ سبز",
    redTime: "زمان چراغ قرمز",
    manualOverride: "کنترل دستی",
    autoMode: "حالت خودکار",
    
    // Analytics
    trafficAnalytics: "تحلیل ترافیک",
    peakHours: "ساعات اوج ترافیک",
    dailyReport: "گزارش روزانه",
    congestionAnalysis: "تحلیل تراکم",
    
    // Admin
    adminPanel: "پنل مدیریت",
    cameraManagement: "مدیریت دوربینها",
    addCamera: "افزودن دوربین",
    downloadReport: "دانلود گزارش",
    exportReport: "خروجی گزارش",
    
    // Settings
    settingsTitle: "تنظیمات",
    language: "زبان",
    developer: "سازنده",
    theme: "تم",
    
    // Common
    save: "ذخیره",
    cancel: "انصراف",
    delete: "حذف",
    edit: "ویرایش",
    loading: "در حال بارگذاری..."
  }
};

export type Language = 'en' | 'fa';
export type TranslationKey = keyof typeof translations.en;
