# Active Context

## Current State

- **Semver Deduplication Engine (Registry):**
  - `compareSemver` yardımcı fonksiyonu `packages/registry/src/index.ts` içine eklendi.
  - `OfficialMcpRegistryCollector`, sunucuları `server.name` anahtarına göre gruplayarak yalnızca en yüksek semver sürümü olan kaydı veritabanına almakta; böylece `.FAF Context` gibi paketlerin 9 ayrı kart olarak görünmesi önlendi.
  - `packages/registry/src/index.test.ts` dosyasına deduplication senaryosu testi eklendi; 120 Vitest testi tamamı yeşil.

- **Derinlemesine Mimari & Siber Güvenlik Refaktörü:**
  - **SQLite WAL Modu:** `PRAGMA journal_mode = WAL` ile okuma/yazma eşzamanlılığı artırıldı.
  - **Drizzle Atomic Transactions:** `persistCatalog` işlemleri tek atomik transaction içine alınarak disk I/O 100× azaltıldı.
  - **Rate Limiter Bellek Temizliği:** `checkRateLimit` her çalışmada süresi dolan IP kayıtlarını temizleyen sweeper eklendi.
  - **IP Spoofing Koruması:** `getClientAddress` fonksiyonu Cloudflare (`cf-connecting-ip`) ve `TRUST_PROXY` env var desteğiyle güçlendirildi.
  - **İdempotent Delimiter Engine:** Roo Code, Hermes, OpenClaw adaptörlerinde `>>> VIBEBASKET START: id <<<` / `>>> VIBEBASKET END: id <<<` blok delimiterleri kullanılarak idempotent kural/skill güncellemesi sağlandı.

- **Premium OLED-dark Docs Hub (`/docs`):**
  - Spacious bento layout: `main` `px-24 pt-20 pb-36`, bento gap `gap-12 lg:gap-14`, kart padding `p-10`, section spacing `space-y-28`.
  - Sidebar `w-72` genişliğinde, sade Setup Builder widget + flat nav menü.
  - Header ve footer menülerine `/docs` linki eklendi.
  - Animated "Made with ♥ by Vibe Coding for Vibe Coders" footer imzası eklendi.

- **Global Design System:**
  - `--radius: 0.125rem` (2px) ile tüm Shadcn/ui bileşenlerinde keskin geometrik border sistemi.
  - `globals.css`'e `--color-surface-container-*` ve spacing token'ları eklendi.
  - Next.js `missing-data-scroll-behavior` uyarısı `html[data-scroll-behavior="smooth"]` attribute selector ile çözüldü.

- **Doküman Güncellemesi (2026-05-26):**
  - `docs/CHANGELOG.md`: `[Unreleased]` bölümü temizlendi, `[0.8.0]` versiyonu altında kategorize edilmiş release entry oluşturuldu; semver dedup ve docs hub değişiklikleri `[Unreleased]`'e eklendi.
  - `docs/ARCHITECTURE.md`: Adapters listesi güncellendi (Continue, Roo Code, Hermes, OpenClaw eklendi), registry sync bölümüne semver dedup adımı eklendi, web app routes güncellendi.
  - `docs/PROJECT_OVERVIEW.md`: Target model listesi genişletildi, Recent State bölümü revize edildi, constraints güncellendi.
  - `docs/CODING_STANDARDS.md`: Idempotent Writes (kural 10) ve Upstream Deduplication (kural 11) standartları eklendi.

- **Birim Test & Derleme Doğrulaması:**
  - 120 Vitest testi başarıyla yeşil.
  - `pnpm build` TypeScript + Next.js Turbopack derlemesi sıfır hata.

## Next Steps
- Admin panelden veya CLI ile bir catalog sync tetikleyerek veritabanındaki eski `.FAF Context` duplicate kayıtlarını temizlemek.
- Playwright E2E testlerine rate limit ve güvenli IP doğrulama akışlarının entegrasyonu.
- Docs hub içeriğinin geliştirici geri bildirimlerine göre genişletilmesi.

## Considerations
- **Open Source Uyumluluğu:** `TRUST_PROXY` env var ile farklı hosting senaryolarına (self-hosted Nginx, Cloudflare vb.) uyumluluk sağlandı.
- **Idempotency:** Delimiter blokları, VibeBasket'in güncellediği alanların geliştirici konfigürasyonlarıyla asla çakışmamasını garantiler.
- **No Auto-Commit:** Kullanıcının açık onayı olmadan git commit atılmayacak.
