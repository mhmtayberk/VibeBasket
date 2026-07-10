"use client";

import type { AppLocale } from "@/i18n/config";
import { Check, Clock, Loader2, Settings, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

interface BackupEntry {
  key: string;
  sizeBytes: number;
  lastModified: string;
}

interface DbConfig {
  backend: string;
  hasS3: boolean;
  hasAzure: boolean;
  hasGcs: boolean;
}

interface BackendInfo {
  id: string;
  configuredId: string;
  isFallback: boolean;
  warning: string | null;
}

interface BackendStatus {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
  isConfigured: boolean;
  missingVars: string[];
  envPrefix: string;
}

interface BackupRuntimeStatus {
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  lastBackupKey: string | null;
  lastBackupSizeBytes: number | null;
  lastStorageLabel: string | null;
}

type ConfigMode = { backend: string; label: string } | null;

async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return response.json() as Promise<T>;
}

const FIELD_LABELS: Record<
  string,
  { en: string; tr: string; es: string; zh: string; hi: string; ru: string }
> = {
  endpoint: {
    en: "Endpoint URL",
    tr: "Endpoint URL",
    es: "URL de endpoint",
    zh: "端点 URL",
    hi: "एंडपॉइंट URL",
    ru: "URL endpoint’а",
  },
  bucket: {
    en: "Bucket / Container Name",
    tr: "Bucket / Container Adı",
    es: "Nombre de bucket / contenedor",
    zh: "Bucket/Container adı",
    hi: "बकेट / कंटेनर नाम",
    ru: "Имя bucket / container",
  },
  region: {
    en: "Region",
    tr: "Bölge",
    es: "Región",
    zh: "地区",
    hi: "क्षेत्र",
    ru: "Регион",
  },
  accessKey: {
    en: "Access Key ID",
    tr: "Erişim Anahtarı ID",
    es: "Access Key ID",
    zh: "访问密钥 ID",
    hi: "एक्सेस की ID",
    ru: "ID access key",
  },
  secretKey: {
    en: "Secret Access Key",
    tr: "Gizli Erişim Anahtarı",
    es: "Secret Access Key",
    zh: "密钥",
    hi: "सीक्रेट एक्सेस की",
    ru: "Secret access key",
  },
  connectionString: {
    en: "Connection String",
    tr: "Bağlantı Dizesi",
    es: "Cadena de conexión",
    zh: "连接字符串",
    hi: "कनेक्शन स्ट्रिंग",
    ru: "Строка подключения",
  },
  container: {
    en: "Container Name",
    tr: "Container Adı",
    es: "Nombre del contenedor",
    zh: "容器名称",
    hi: "कंटेनर नाम",
    ru: "Имя container",
  },
  projectId: {
    en: "Project ID",
    tr: "Proje ID",
    es: "ID del proyecto",
    zh: "项目 ID",
    hi: "प्रोजेक्ट ID",
    ru: "ID проекта",
  },
};

function backendFields(backend: string): string[] {
  switch (backend) {
    case "s3":
    case "r2":
    case "spaces":
      return ["endpoint", "region", "bucket", "accessKey", "secretKey"];
    case "azure":
      return ["connectionString", "container"];
    case "gcs":
      return ["bucket", "projectId"];
    default:
      return [];
  }
}

const COPY = {
  en: {
    loading: "Loading backup and storage controls...",
    loadErrorDefault: "Failed to load backup controls.",
    loadErrorStorage: "Failed to load storage configuration.",
    configure: "Configure",
    cancel: "Cancel",
    saveAndActivate: "Save & Activate",
    saving: "Saving...",
    credentialsHelp: "Credentials are encrypted with AES-256-GCM. Never stored in plaintext.",
    fallbackTitle: "Storage fallback active",
    backends: "Storage Backends",
    resetToEnv: "Reset to Env",
    dbManaged: "DB-managed",
    envManaged: "ENV-managed",
    table: {
      backend: "Backend",
      status: "Status",
    },
    status: {
      alwaysReady: "Always Ready",
      ready: "Ready",
      missing: "Missing",
      active: "Active",
      edit: "Edit",
      setup: "Setup",
    },
    scheduledBackups: "Scheduled Backups",
    periodicSnapshots: "Automated periodic snapshots",
    enable: "Enable",
    every: "Every",
    hours: "hours",
    saveSchedule: "Save Schedule",
    scheduleHelp:
      "When enabled, a backup should be triggered every {hours} by calling the protected scheduler endpoint. Schedule state persists across restarts and the last run metadata is tracked below.",
    runtime: {
      lastSuccess: "Last Success",
      lastAttempt: "Last Attempt",
      lastResult: "Last Result",
      noSuccess: "No successful backup recorded",
      noAttempt: "No attempts recorded",
      waiting: "Waiting for first run",
    },
    operations: "Backup Operations",
    activeCount: (count: number) => ` (${count} active)`,
    create: "Create Backup",
    creating: "Creating...",
    showBackups: (count: number) => `Show Backups (${count})`,
    hideBackups: "Hide Backups",
    createFailed: "Failed to create backup.",
    saveFailed: "Failed to save.",
    saveFailedMessage: "Failed to save configuration.",
    deleteFailed: "Delete failed.",
    deleteMessage: "Deleted",
    deletedMessage: "Deleted:",
    restorePrompt: (key: string) => `Restore from "${key}"? Overwrites current DB.`,
    restoring: "...",
    restore: "Restore",
    delete: "Delete",
    restoreFailed: "Restore failed.",
    restoreSuccess: "Restored.",
    restoreError: "Restore failed.",
    restoreMessagePrefix: "Restore from",
    restoreFrom: (key: string) => `Restore from "${key}"? Overwrites current DB.`,
    deletePrompt: (key: string) => `Delete "${key}"?`,
    localFilesystem: "Local Filesystem",
    scheduleSaved: "Schedule saved.",
    scheduleFailed: "Failed.",
    removeConfigPrompt: "Remove stored configuration? Falls back to env vars or local.",
    removeConfigMessage: "Configuration removed.",
    removeConfigFailed: "Failed to remove.",
    noBackups: "No backups found",
    errorLoadingBackups: "Failed to load backups.",
    switched: (label: string) => `Switched to ${label}.`,
    loadingBackups: "Loading backups...",
    statusText: {
      noSuccess: "No successful backup recorded",
      noAttempt: "No attempts recorded",
      waiting: "Waiting for first run",
    },
    restMessage: {
      ok: "[OK]",
      err: "[ERR]",
    },
  },
  tr: {
    loading: "Yedekleme ve depolama kontrolleri yükleniyor...",
    loadErrorDefault: "Yedekleme kontrolleri yüklenemedi.",
    loadErrorStorage: "Depolama yapılandırması yüklenemedi.",
    configure: "Yapılandır",
    cancel: "İptal",
    saveAndActivate: "Kaydet ve Aktifleştir",
    saving: "Kaydediliyor...",
    credentialsHelp:
      "Kimlik bilgileri AES-256-GCM ile şifrelenir. Hiçbir zaman düz metin olarak saklanmaz.",
    fallbackTitle: "Depolama fallback aktif",
    backends: "Depolama Backends",
    resetToEnv: "Ortam Değişkenlerine Dön",
    dbManaged: "DB yönetimli",
    envManaged: "ENV yönetimli",
    table: {
      backend: "Backend",
      status: "Durum",
    },
    status: {
      alwaysReady: "Her zaman hazır",
      ready: "Hazır",
      missing: "Eksik",
      active: "Aktif",
      edit: "Düzenle",
      setup: "Kur",
    },
    scheduledBackups: "Planlı Yedeklemeler",
    periodicSnapshots: "Otomatik periyodik snapshotlar",
    enable: "Etkin",
    every: "Her",
    hours: "saat",
    saveSchedule: "Zamanlamayı Kaydet",
    scheduleHelp:
      "Etkinleştirildiğinde, korunmuş scheduler endpoint çağrısıyla her {hours} süresinde bir yedekleme tetiklenir. Zamanlama durumu yeniden başlatmalar arasında kalır ve son çalışma metaverisi aşağıda görünür.",
    runtime: {
      lastSuccess: "Son Başarılı",
      lastAttempt: "Son Deneme",
      lastResult: "Son Sonuç",
      noSuccess: "Başarılı yedekleme kaydı yok",
      noAttempt: "Deneme kaydı yok",
      waiting: "İlk çalışma için bekleniyor",
    },
    operations: "Yedekleme İşlemleri",
    activeCount: (count: number) => ` (${count} aktif)`,
    create: "Yedekleme Oluştur",
    creating: "Oluşturuluyor...",
    showBackups: (count: number) => `Yedekleri Göster (${count})`,
    hideBackups: "Yedekleri Gizle",
    createFailed: "Yedekleme oluşturulamadı.",
    deleteFailed: "Silme başarısız.",
    deleteMessage: "Silindi",
    deletedMessage: "Silindi:",
    restorePrompt: (key: string) => `"${key}" geri yüklensin mi? Mevcut DB üzerine yazar.`,
    restoring: "...",
    restoreFrom: (key: string) => `"${key}" geri yüklensin mi? Mevcut DB üzerine yazar.`,
    restoreSuccess: "Geri yüklendi.",
    restoreError: "Geri yükleme başarısız.",
    restoreMessagePrefix: "Restore from",
    deletePrompt: (key: string) => `"${key}" silinsin mi?`,
    localFilesystem: "Yerel Dosya Sistemi",
    scheduleSaved: "Zamanlama kaydedildi.",
    scheduleFailed: "Kaydedilemedi.",
    removeConfigPrompt:
      "Kayıtlı yapılandırma kaldırılsın mı? Ortam değişkenlerine veya local'e döner.",
    removeConfigMessage: "Yapılandırma kaldırıldı.",
    removeConfigFailed: "Kaldırılamadı.",
    saveFailed: "Kaydetme başarısız.",
    saveFailedMessage: "Ayarlar kaydedilemedi.",
    statusText: {
      noSuccess: "Başarılı yedekleme kaydı yok",
      noAttempt: "Deneme kaydı yok",
      waiting: "İlk çalışma için bekleniyor",
    },
    loadingBackups: "Yedeklemeler yükleniyor...",
    restore: "Geri Yükle",
    delete: "Sil",
    restoreFailed: "Geri yükleme başarısız.",
    restMessage: {
      ok: "[TAMAM]",
      err: "[HATA]",
    },
    noBackups: "Yedek bulunamadı",
    errorLoadingBackups: "Yedeklemeler yüklenemedi.",
    switched: (label: string) => `${label} seçildi.`,
  },
  es: {
    loading: "Cargando controles de respaldo y almacenamiento...",
    loadErrorDefault: "No se pudieron cargar los controles de backup.",
    loadErrorStorage: "No se pudo cargar la configuración de almacenamiento.",
    configure: "Configurar",
    cancel: "Cancelar",
    saveAndActivate: "Guardar y activar",
    saving: "Guardando...",
    credentialsHelp:
      "Las credenciales están cifradas con AES-256-GCM. Nunca se almacenan en texto plano.",
    fallbackTitle: "Fallback de storage activo",
    backends: "Almacenamientos",
    resetToEnv: "Restablecer a env",
    dbManaged: "Gestión DB",
    envManaged: "Gestionado por ENV",
    table: {
      backend: "Backend",
      status: "Estado",
    },
    status: {
      alwaysReady: "Siempre listo",
      ready: "Listo",
      missing: "Falta",
      active: "Activo",
      edit: "Editar",
      setup: "Configurar",
    },
    scheduledBackups: "Backups programados",
    periodicSnapshots: "Snapshots periódicos automatizados",
    enable: "Habilitar",
    every: "Cada",
    hours: "horas",
    saveSchedule: "Guardar programación",
    scheduleHelp:
      "Cuando está activo, se debería disparar un backup cada {hours} llamando al endpoint programado protegido. El estado se conserva entre reinicios y los metadatos del último run están abajo.",
    runtime: {
      lastSuccess: "Último éxito",
      lastAttempt: "Último intento",
      lastResult: "Último resultado",
      noSuccess: "No hay backup exitoso registrado",
      noAttempt: "No hay intentos registrados",
      waiting: "Esperando primer run",
    },
    operations: "Operaciones de backup",
    activeCount: (count: number) => ` (${count} activos)`,
    create: "Crear backup",
    creating: "Creando...",
    showBackups: (count: number) => `Ver backups (${count})`,
    hideBackups: "Ocultar backups",
    createFailed: "No se pudo crear backup.",
    deleteFailed: "Fallo al borrar.",
    deleteMessage: "Borrado",
    deletedMessage: "Borrado:",
    restorePrompt: (key: string) => `¿Restaurar desde "${key}"? Sobrescribe la DB actual.`,
    restoring: "...",
    restoreFrom: (key: string) => `¿Restaurar desde "${key}"? Sobrescribe la DB actual.`,
    restoreSuccess: "Restaurado.",
    restoreError: "Error al restaurar.",
    restoreMessagePrefix: "Restaurar desde",
    deletePrompt: (key: string) => `¿Borrar "${key}"?`,
    localFilesystem: "Sistema de archivos local",
    scheduleSaved: "Programación guardada.",
    scheduleFailed: "No se pudo guardar.",
    removeConfigPrompt: "¿Eliminar la configuración guardada? Usará variables de entorno o local.",
    removeConfigMessage: "Configuración eliminada.",
    removeConfigFailed: "No se pudo eliminar.",
    saveFailed: "No se pudo guardar.",
    saveFailedMessage: "No se pudo guardar la configuración.",
    statusText: {
      noSuccess: "No hay backup exitoso registrado",
      noAttempt: "No hay intentos registrados",
      waiting: "Esperando primer run",
    },
    loadingBackups: "Cargando backups...",
    restore: "Restaurar",
    delete: "Borrar",
    restoreFailed: "Fallo al restaurar.",
    errorLoadingBackups: "No se pudieron cargar los backups.",
    restMessage: {
      ok: "[OK]",
      err: "[ERR]",
    },
    noBackups: "No se encontraron backups",
    switched: (label: string) => `Cambiado a ${label}.`,
  },
  zh: {
    loading: "正在加载备份和存储控制...",
    loadErrorDefault: "无法加载备份控制项。",
    loadErrorStorage: "无法加载存储配置。",
    configure: "配置",
    cancel: "取消",
    saveAndActivate: "保存并激活",
    saving: "保存中...",
    credentialsHelp: "凭据使用 AES-256-GCM 加密，不会明文存储。",
    fallbackTitle: "存储回退已启用",
    backends: "存储后端",
    resetToEnv: "恢复到环境变量",
    dbManaged: "数据库托管",
    envManaged: "环境变量托管",
    table: {
      backend: "后端",
      status: "状态",
    },
    status: {
      alwaysReady: "始终就绪",
      ready: "就绪",
      missing: "缺失",
      active: "激活",
      edit: "编辑",
      setup: "设置",
    },
    scheduledBackups: "计划备份",
    periodicSnapshots: "自动周期快照",
    enable: "启用",
    every: "每",
    hours: "小时",
    saveSchedule: "保存计划",
    scheduleHelp:
      "启用后，将通过受保护的调度器端点每 {hours} 触发一次备份。计划状态跨重启持久化，最近执行元数据展示如下。",
    runtime: {
      lastSuccess: "最近成功",
      lastAttempt: "最近尝试",
      lastResult: "最近结果",
      noSuccess: "未记录成功备份",
      noAttempt: "未记录尝试",
      waiting: "等待首次运行",
    },
    operations: "备份操作",
    activeCount: (count: number) => ` (${count} 个进行中)`,
    create: "创建备份",
    creating: "创建中...",
    showBackups: (count: number) => `显示备份 (${count})`,
    hideBackups: "隐藏备份",
    createFailed: "备份创建失败。",
    deleteFailed: "删除失败。",
    deleteMessage: "已删除",
    deletedMessage: "已删除：",
    restorePrompt: (key: string) => `从 "${key}" 恢复？将覆盖当前数据库。`,
    restoring: "...",
    restoreFrom: (key: string) => `从 "${key}" 恢复？将覆盖当前数据库。`,
    restoreSuccess: "恢复成功。",
    restoreError: "恢复失败。",
    restoreMessagePrefix: "恢复自",
    deletePrompt: (key: string) => `删除 "${key}"？`,
    localFilesystem: "本地文件系统",
    scheduleSaved: "计划已保存。",
    scheduleFailed: "保存失败。",
    removeConfigPrompt: "移除存储的配置？将回退到环境变量或本地配置。",
    removeConfigMessage: "配置已移除。",
    removeConfigFailed: "移除失败。",
    saveFailed: "保存失败。",
    saveFailedMessage: "无法保存配置。",
    statusText: {
      noSuccess: "未记录成功备份",
      noAttempt: "未记录尝试",
      waiting: "等待首次运行",
    },
    loadingBackups: "备份加载中...",
    restore: "恢复",
    delete: "删除",
    restoreFailed: "恢复失败。",
    errorLoadingBackups: "无法加载备份。",
    restMessage: {
      ok: "[完成]",
      err: "[错误]",
    },
    noBackups: "未找到备份",
    switched: (label: string) => `已切换到 ${label}。`,
  },
  hi: {
    loading: "बैकअप और स्टोरेज कंट्रोल लोड हो रहे हैं...",
    loadErrorDefault: "बैकअप कंट्रोल लोड नहीं हुए।",
    loadErrorStorage: "स्टोरेज कॉन्फ़िगरेशन लोड नहीं हुआ।",
    configure: "कॉन्फ़िगर करें",
    cancel: "रद्द करें",
    saveAndActivate: "सहेजें और सक्रिय करें",
    saving: "सहेज रहा है...",
    credentialsHelp: "क्रेडेंशियल्स AES-256-GCM से एन्क्रिप्ट होते हैं। कभी भी प्लेन टेक्स्ट में नहीं रखते।",
    fallbackTitle: "स्टोरेज fallback सक्रिय",
    backends: "स्टोरेज बैकएंड",
    resetToEnv: "ENV पर रीसेट करें",
    dbManaged: "DB-प्रबंधित",
    envManaged: "ENV-प्रबंधित",
    table: {
      backend: "बैकएंड",
      status: "स्थिति",
    },
    status: {
      alwaysReady: "हमेशा तैयार",
      ready: "तैयार",
      missing: "गायब",
      active: "सक्रिय",
      edit: "संपादित करें",
      setup: "सेटअप",
    },
    scheduledBackups: "अनुसूचित बैकअप",
    periodicSnapshots: "स्वचालित आवधिक स्नैपशॉट",
    enable: "सक्षम करें",
    every: "हर",
    hours: "घंटे",
    saveSchedule: "शेड्यूल सेव करें",
    scheduleHelp:
      "सक्षम होने पर, प्रोटेक्टेड शेड्यूलर endpoint के कॉल से हर {hours} पर बैकअप ट्रिगर होगा। शेड्यूल स्टेट रिस्टार्ट के बाद भी रहता है और अंतिम रन मेटाडेटा नीचे दिखता है।",
    runtime: {
      lastSuccess: "पिछला सफल रन",
      lastAttempt: "पिछला प्रयास",
      lastResult: "पिछला परिणाम",
      noSuccess: "कोई सफल बैकअप रिकॉर्ड नहीं",
      noAttempt: "कोई प्रयास रिकॉर्ड नहीं",
      waiting: "पहले रन की प्रतीक्षा",
    },
    operations: "बैकअप ऑपरेशन",
    activeCount: (count: number) => ` (${count} सक्रिय)`,
    create: "बैकअप बनाएं",
    creating: "बनाया जा रहा है...",
    showBackups: (count: number) => `बैकअप दिखाएं (${count})`,
    hideBackups: "बैकअप छिपाएं",
    createFailed: "बैकअप निर्माण विफल।",
    deleteFailed: "डिलीट फेल।",
    deleteMessage: "डिलीटेड",
    deletedMessage: "हटा दिया गया:",
    restorePrompt: (key: string) => `"${key}" से रिस्टोर करें? वर्तमान DB ओवरराइट होगा।`,
    restoring: "...",
    restoreFrom: (key: string) => `"${key}" से रिस्टोर करें? वर्तमान DB ओवरराइट होगा।`,
    restoreSuccess: "रिस्टोर हो गया।",
    restoreError: "रिस्टोर फेल।",
    restoreMessagePrefix: "रिस्टोर करें",
    deletePrompt: (key: string) => `"${key}" डिलीट करें?`,
    localFilesystem: "लोकल फाइल सिस्टम",
    scheduleSaved: "शेड्यूल सेव हो गया।",
    scheduleFailed: "सेव नहीं हुआ।",
    removeConfigPrompt: "संग्रहीत कॉन्फ़िगरेशन हटाएं? env vars/local पर वापस जाएगा।",
    removeConfigMessage: "कॉन्फ़िगरेशन हट गया।",
    removeConfigFailed: "हटाया नहीं जा सका।",
    saveFailed: "सेव नहीं हुआ।",
    saveFailedMessage: "कॉन्फ़िगरेशन सेव नहीं हो सका।",
    statusText: {
      noSuccess: "कोई सफल बैकअप रिकॉर्ड नहीं",
      noAttempt: "कोई प्रयास रिकॉर्ड नहीं",
      waiting: "पहले रन की प्रतीक्षा",
    },
    loadingBackups: "बैकअप लोड हो रहे हैं...",
    restore: "रिस्टोर",
    delete: "डिलीट",
    restoreFailed: "रिस्टोर फेल।",
    errorLoadingBackups: "बैकअप लोड नहीं हो सके।",
    restMessage: {
      ok: "[OK]",
      err: "[ERR]",
    },
    noBackups: "कोई बैकअप नहीं मिला",
    switched: (label: string) => `${label} पर बदल गया।`,
  },
  ru: {
    loading: "Загружаются элементы управления backup и storage...",
    loadErrorDefault: "Не удалось загрузить элементы управления backup.",
    loadErrorStorage: "Не удалось загрузить конфигурацию storage.",
    configure: "Настроить",
    cancel: "Отмена",
    saveAndActivate: "Сохранить и активировать",
    saving: "Сохранение...",
    credentialsHelp:
      "Credentials шифруются с помощью AES-256-GCM. Никогда не хранятся в открытом виде.",
    fallbackTitle: "Активен fallback storage",
    backends: "Storage backends",
    resetToEnv: "Сбросить к env",
    dbManaged: "Управляется БД",
    envManaged: "Управляется ENV",
    table: {
      backend: "Backend",
      status: "Статус",
    },
    status: {
      alwaysReady: "Всегда готово",
      ready: "Готово",
      missing: "Отсутствует",
      active: "Активно",
      edit: "Изменить",
      setup: "Настроить",
    },
    scheduledBackups: "Запланированные backup’ы",
    periodicSnapshots: "Автоматические периодические snapshots",
    enable: "Включить",
    every: "Каждые",
    hours: "часов",
    saveSchedule: "Сохранить расписание",
    scheduleHelp:
      "Когда опция включена, backup должен запускаться каждые {hours} через вызов защищённого scheduler endpoint. Состояние расписания сохраняется между restart’ами, а метаданные последнего запуска отображаются ниже.",
    runtime: {
      lastSuccess: "Последний успешный запуск",
      lastAttempt: "Последняя попытка",
      lastResult: "Последний результат",
      noSuccess: "Нет записей об успешном backup",
      noAttempt: "Нет записей о попытках",
      waiting: "Ожидание первого запуска",
    },
    operations: "Операции backup",
    activeCount: (count: number) => ` (${count} активных)`,
    create: "Создать backup",
    creating: "Создание...",
    showBackups: (count: number) => `Показать backup’ы (${count})`,
    hideBackups: "Скрыть backup’ы",
    createFailed: "Не удалось создать backup.",
    deleteFailed: "Удаление не удалось.",
    deleteMessage: "Удалено",
    deletedMessage: "Удалено:",
    restorePrompt: (key: string) => `Восстановить из "${key}"? Текущая БД будет перезаписана.`,
    restoring: "...",
    restoreFrom: (key: string) => `Восстановить из "${key}"? Текущая БД будет перезаписана.`,
    restoreSuccess: "Восстановлено.",
    restoreError: "Восстановление не удалось.",
    restoreMessagePrefix: "Восстановить из",
    deletePrompt: (key: string) => `Удалить "${key}"?`,
    localFilesystem: "Локальная файловая система",
    scheduleSaved: "Расписание сохранено.",
    scheduleFailed: "Не удалось сохранить.",
    removeConfigPrompt:
      "Удалить сохранённую конфигурацию? Система вернётся к env vars или local storage.",
    removeConfigMessage: "Конфигурация удалена.",
    removeConfigFailed: "Не удалось удалить.",
    saveFailed: "Не удалось сохранить.",
    saveFailedMessage: "Не удалось сохранить конфигурацию.",
    statusText: {
      noSuccess: "Нет записей об успешном backup",
      noAttempt: "Нет записей о попытках",
      waiting: "Ожидание первого запуска",
    },
    loadingBackups: "Загрузка backup’ов...",
    restore: "Восстановить",
    delete: "Удалить",
    restoreFailed: "Восстановление не удалось.",
    errorLoadingBackups: "Не удалось загрузить backup’ы.",
    restMessage: {
      ok: "[OK]",
      err: "[ERR]",
    },
    noBackups: "Backup’ы не найдены",
    switched: (label: string) => `Переключено на ${label}.`,
  },
} as const;

const copyForLocale = (locale: AppLocale) => COPY[locale as keyof typeof COPY] ?? COPY.en;

export function BackupSection({ locale }: { locale: AppLocale }) {
  const copy = copyForLocale(locale);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [backends, setBackends] = useState<BackendStatus[]>([]);
  const [dbConfig, setDbConfig] = useState<DbConfig | null>(null);
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [restoringKey, setRestoringKey] = useState<string | null>(null);
  const [configMode, setConfigMode] = useState<ConfigMode>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [pendingBackups, setPendingBackups] = useState<Set<string>>(new Set());
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleHours, setScheduleHours] = useState(24);
  const [runtimeStatus, setRuntimeStatus] = useState<BackupRuntimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshBackups = useCallback(() => {
    getJson<{ success: boolean; backups: BackupEntry[] }>("/api/admin/backup", {
      cache: "no-store",
    })
      .then((res) => {
        if (res.success) {
          setBackups(
            res.backups.map((b) => ({
              ...b,
              lastModified: String(b.lastModified),
            })),
          );
          return;
        }

        throw new Error(copy.errorLoadingBackups);
      })
      .catch((error: unknown) => {
        throw error instanceof Error ? error : new Error(copy.errorLoadingBackups);
      });
  }, [copy]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const [storageResponse] = await Promise.all([
        getJson<{
          success: boolean;
          config: DbConfig | null;
          schedule?: { enabled: boolean; intervalHours: number } | null;
          runtimeStatus?: BackupRuntimeStatus | null;
          backends: BackendStatus[];
          backendInfo?: BackendInfo | null;
          error?: string;
        }>("/api/admin/storage", {
          cache: "no-store",
        }),
        refreshBackups(),
      ]);

      if (!storageResponse.success) {
        throw new Error(storageResponse.error ?? copy.loadErrorStorage);
      }

      setDbConfig(storageResponse.config);
      setBackends(storageResponse.backends);
      setBackendInfo(storageResponse.backendInfo ?? null);
      setRuntimeStatus(storageResponse.runtimeStatus ?? null);
      if (storageResponse.schedule) {
        setScheduleEnabled(storageResponse.schedule.enabled);
        setScheduleHours(storageResponse.schedule.intervalHours);
      } else {
        setScheduleEnabled(false);
        setScheduleHours(24);
      }
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : copy.loadErrorDefault);
    } finally {
      setLoading(false);
    }
  }, [copy, refreshBackups]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleBackup = () => {
    setResult(null);
    const opKey = `backup-${Date.now()}`;
    setPendingBackups((prev) => new Set(prev).add(opKey));

    (async () => {
      try {
        const response = await getJson<{
          success: boolean;
          backup?: { storageLabel: string; key: string; sizeBytes: number };
          error?: string;
        }>("/api/admin/backup", { method: "POST" });
        if (response.success && response.backup) {
          setResult({
            success: true,
            message: `${response.backup.storageLabel}: ${response.backup.key} (${(response.backup.sizeBytes / 1024).toFixed(1)} KB)`,
          });
          await refreshAll();
        } else {
          setResult({
            success: false,
            message: response.error || copy.createFailed,
          });
        }
      } catch (err: unknown) {
        setResult({
          success: false,
          message: err instanceof Error ? err.message : copy.createFailed,
        });
      } finally {
        setPendingBackups((prev) => {
          const next = new Set(prev);
          next.delete(opKey);
          return next;
        });
      }
    })();

    return opKey;
  };

  const handleDelete = (key: string) => {
    startTransition(async () => {
      try {
        const response = await getJson<{ success: boolean; error?: string }>(
          `/api/admin/backup?key=${encodeURIComponent(key)}`,
          { method: "DELETE" },
        );
        setResult({
          success: response.success,
          message: response.success
            ? `${copy.deletedMessage} ${key}`
            : (response.error ?? copy.deleteFailed),
        });
        if (response.success) refreshBackups();
      } catch {
        setResult({ success: false, message: copy.deleteFailed });
      }
    });
  };

  const handleRestore = (key: string) => {
    if (!window.confirm(copy.restoreFrom(key))) return;
    setRestoringKey(key);
    startTransition(async () => {
      try {
        const response = await getJson<{ success: boolean; message?: string; error?: string }>(
          "/api/admin/backup/restore",
          {
            method: "POST",
            body: JSON.stringify({ key }),
          },
        );
        setResult({
          success: response.success,
          message: response.success
            ? (response.message ?? copy.restoreSuccess)
            : (response.error ?? copy.restoreError),
        });
      } catch {
        setResult({ success: false, message: copy.restoreError });
      } finally {
        setRestoringKey(null);
      }
    });
  };

  const handleSaveConfig = () => {
    if (!configMode) return;
    setResult(null);
    startTransition(async () => {
      try {
        const response = await getJson<{ success: boolean; error?: string }>("/api/admin/storage", {
          method: "POST",
          body: JSON.stringify({
            backend: configMode.backend,
            credentials: formValues,
          }),
        });
        if (response.success) {
          setResult({ success: true, message: copy.switched(configMode.label) });
          setConfigMode(null);
          refreshAll();
        } else {
          setResult({ success: false, message: response.error ?? copy.saveFailedMessage });
        }
      } catch {
        setResult({ success: false, message: copy.saveFailed });
      }
    });
  };

  const handleRemoveConfig = () => {
    if (!window.confirm(copy.removeConfigPrompt)) return;
    startTransition(async () => {
      try {
        const response = await getJson<{ success: boolean; error?: string }>("/api/admin/storage", {
          method: "DELETE",
        });
        if (response.success) {
          setResult({ success: true, message: copy.removeConfigMessage });
          refreshAll();
        }
      } catch {
        setResult({ success: false, message: copy.removeConfigFailed });
      }
    });
  };

  const isDbConfigured = dbConfig && dbConfig.backend !== "local";
  const hasPendingBackups = pendingBackups.size > 0;

  return (
    <section id="backups" className="scroll-mt-40 space-y-8">
      {loading ? (
        <div className="border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
          {copy.loading}
        </div>
      ) : null}

      {loadError ? (
        <div className="border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      {/* ── Config Form ── */}
      {configMode && (
        <div className="border border-accent/40 bg-accent/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              {copy.configure} {configMode.label}
            </span>
            <button
              type="button"
              onClick={() => setConfigMode(null)}
              className="inline-flex h-8 items-center border border-border/60 bg-background/40 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-all hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
            >
              {copy.cancel}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {backendFields(configMode.backend).map((field) => (
              <div key={field}>
                <label
                  htmlFor={`storage-config-${field}`}
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-1"
                >
                  {FIELD_LABELS[field]?.[locale] ?? field}
                </label>
                <input
                  id={`storage-config-${field}`}
                  type={field === "secretKey" ? "password" : "text"}
                  value={formValues[field] ?? ""}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, [field]: e.target.value }))}
                  className="w-full border border-border/70 bg-background/50 px-3 py-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
                  placeholder={FIELD_LABELS[field]?.[locale] ?? field}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 border border-accent bg-accent px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? copy.saving : copy.saveAndActivate}
            </button>
          </div>

          <p className="font-mono text-[9px] text-muted-foreground/70 leading-relaxed">
            {copy.credentialsHelp}
          </p>
        </div>
      )}

      {/* ── Backend Table ── */}
      <div id="storage" className="scroll-mt-40">
        {backendInfo?.isFallback ? (
          <div className="mb-4 border border-amber-500/35 bg-amber-500/8 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">
              {copy.fallbackTitle}
            </p>
            <p className="mt-1 text-sm text-amber-100/85">{backendInfo.warning}</p>
          </div>
        ) : null}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            {copy.backends}
          </span>
          <div className="flex items-center gap-3">
            {isDbConfigured && (
              <button
                type="button"
                onClick={handleRemoveConfig}
                className="inline-flex items-center gap-1 border border-border/50 bg-background/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground transition-all hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                {copy.resetToEnv}
              </button>
            )}
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/60">
              {isDbConfigured ? copy.dbManaged : copy.envManaged}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/70">
                <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground w-8" />
                <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {copy.table.backend}
                </th>
                <th className="pb-3 pr-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hidden sm:table-cell">
                  {copy.table.status}
                </th>
                <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground w-20" />
              </tr>
            </thead>
            <tbody>
              {backends.map((backend) => (
                <tr
                  key={backend.id}
                  className={`border-b border-border/50 last:border-b-0 ${backend.isActive ? "bg-accent/5" : ""}`}
                >
                  <td className="py-2.5 pr-4">
                    {backend.isActive ? (
                      <span className="inline-flex items-center justify-center h-5 w-5 border border-accent/50 bg-accent/10">
                        <Check className="h-3 w-3 text-accent" />
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="text-sm font-medium text-foreground">{backend.label}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {backend.description}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border ${
                        backend.isConfigured
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-border/50 bg-background/30 text-muted-foreground"
                      }`}
                    >
                      {backend.isConfigured ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {backend.id === "local"
                        ? copy.status.alwaysReady
                        : backend.isConfigured
                          ? copy.status.ready
                          : copy.status.missing}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {backend.id !== "local" ? (
                      configMode && configMode.backend === backend.id ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] text-accent px-1.5 py-1">
                          {copy.status.active}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setConfigMode({ backend: backend.id, label: backend.label });
                            setFormValues({});
                          }}
                          className="inline-flex items-center gap-1 border border-border/50 bg-background/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground transition-all hover:border-accent/60 hover:bg-accent/10 hover:text-accent"
                        >
                          <Settings className="h-3 w-3" />
                          {backend.isConfigured ? copy.status.edit : copy.status.setup}
                        </button>
                      )
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Schedule ── */}
      <div id="schedules" className="border-t border-border/70 pt-6 scroll-mt-40">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            {copy.scheduledBackups}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {copy.periodicSnapshots}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="h-4 w-4 border border-border/70 bg-background accent-accent"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
              {copy.enable}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {copy.every}
            </span>
            <input
              type="number"
              min={1}
              max={720}
              value={scheduleHours}
              onChange={(e) => setScheduleHours(Number(e.target.value))}
              disabled={!scheduleEnabled}
              className="w-20 border border-border/70 bg-background/50 px-2 py-1.5 font-mono text-[11px] text-foreground text-center outline-none focus:border-accent/50 disabled:opacity-40"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {copy.hours}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setResult(null);
              startTransition(async () => {
                const response = await getJson<{ success: boolean; error?: string }>(
                  "/api/admin/storage",
                  {
                    method: "PATCH",
                    body: JSON.stringify({
                      enabled: scheduleEnabled,
                      intervalHours: scheduleHours,
                    }),
                  },
                );
                setResult({
                  success: response.success,
                  message: response.success
                    ? copy.scheduleSaved
                    : (response.error ?? copy.scheduleFailed),
                });
              });
            }}
            disabled={isPending}
            className="inline-flex h-9 items-center gap-1.5 border border-border/60 bg-background/40 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:bg-accent/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Clock className="h-3.5 w-3.5" />
            {copy.saveSchedule}
          </button>
        </div>

        <p className="mt-3 font-mono text-[9px] text-muted-foreground/70 leading-relaxed">
          {copy.scheduleHelp.replace("{hours}", String(scheduleHours))}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="border border-border/60 bg-background/30 p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              {copy.runtime.lastSuccess}
            </div>
            <div className="mt-1 text-xs text-foreground">
              {runtimeStatus?.lastSuccessAt
                ? new Date(runtimeStatus.lastSuccessAt).toLocaleString()
                : copy.runtime.noSuccess}
            </div>
          </div>
          <div className="border border-border/60 bg-background/30 p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              {copy.runtime.lastAttempt}
            </div>
            <div className="mt-1 text-xs text-foreground">
              {runtimeStatus?.lastAttemptAt
                ? new Date(runtimeStatus.lastAttemptAt).toLocaleString()
                : copy.runtime.noAttempt}
            </div>
          </div>
          <div className="border border-border/60 bg-background/30 p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              {copy.runtime.lastResult}
            </div>
            <div
              className={`mt-1 text-xs ${
                runtimeStatus?.lastError ? "text-amber-300" : "text-foreground"
              }`}
            >
              {runtimeStatus?.lastError ?? runtimeStatus?.lastBackupKey ?? copy.runtime.waiting}
            </div>
          </div>
        </div>
      </div>

      {/* ── Backup Operations ── */}
      <div id="backup-operations" className="border-t border-border/70 pt-6 scroll-mt-40">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            {copy.operations}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {backends.find((b) => b.isActive)?.label ?? copy.localFilesystem}
            {hasPendingBackups ? copy.activeCount(pendingBackups.size) : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleBackup()}
            disabled={isPending}
            className={`inline-flex h-10 items-center justify-center gap-2 border px-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-all ${
              isPending
                ? "border-border/50 bg-background/30 text-muted-foreground cursor-not-allowed"
                : "border-accent bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(160,253,218,0.15)]"
            }`}
          >
            {hasPendingBackups ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {copy.creating}
              </>
            ) : (
              copy.create
            )}
          </button>

          {backups.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setShowBackups(!showBackups);
                if (!showBackups) refreshBackups();
              }}
              className="inline-flex h-10 items-center justify-center gap-2 border border-border/70 bg-background/40 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:bg-accent/5"
            >
              {showBackups ? copy.hideBackups : copy.showBackups(backups.length)}
            </button>
          ) : null}
        </div>

        {result && (
          <div
            className={`border p-3 font-mono text-[10px] leading-relaxed mb-4 ${
              result.success
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <span className="font-bold">
              {result.success ? copy.restMessage.ok : copy.restMessage.err}
            </span>{" "}
            {result.message}
          </div>
        )}

        {showBackups ? (
          <div className="max-h-80 overflow-y-auto space-y-1 border border-border/50">
            {backups.length > 0 ? (
              backups.map((backup) => (
                <div
                  key={backup.key}
                  className="flex items-center justify-between gap-2 border-b border-border/40 py-2 px-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[11px] text-foreground">
                      {backup.key}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                      {(backup.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                      {new Date(backup.lastModified).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestore(backup.key)}
                      disabled={!!restoringKey}
                      className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent hover:text-foreground transition-colors"
                    >
                      {restoringKey === backup.key ? copy.restoring : copy.restore}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(copy.deletePrompt(backup.key))) handleDelete(backup.key);
                      }}
                      disabled={isPending}
                      className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {copy.delete}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground p-3">{copy.noBackups}</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
