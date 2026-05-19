# DATABASE_DESIGN.md — Servis Takip SaaS Veritabanı Tasarımı

## 1. Genel Prensipler

Veritabanı PostgreSQL üzerinde çalışacaktır. ORM olarak Prisma kullanılacaktır.

Temel kurallar:

- Tüm ana tablolarda `id UUID` kullanılmalıdır.
- SaaS tenant ayrımı için ilgili her tabloda `company_id` bulunmalıdır.
- Kritik tablolarda `created_at`, `updated_at` bulunmalıdır.
- Silinmesi riskli verilerde hard delete yerine `deleted_at` ile soft delete kullanılmalıdır.
- Tüm parasal alanlar `DECIMAL(12,2)` veya Prisma `Decimal` olarak tutulmalıdır.
- Para birimi için `currency` alanı kullanılmalıdır. MVP default `TRY`.
- Tarihler UTC saklanmalı, frontend kullanıcı saat dilimine göre göstermelidir.
- Her kritik write işlemi audit log üretmelidir.
- Müşteri, cihaz, servis, ödeme gibi tenant verileri company scope olmadan sorgulanmamalıdır.

## 2. Ana Entity Listesi

```text
companies
users
company_users
roles
permissions
role_permissions

customers
customer_addresses
devices

service_records
service_status_history
service_notes
service_photos
service_assignments

appointments

parts
service_parts
stock_movements

payments
expenses

public_tracking_links
audit_logs
notifications
files
```

## 3. Enumlar

### 3.1 UserStatus

```text
ACTIVE
INVITED
SUSPENDED
DELETED
```

### 3.2 CompanyStatus

```text
ACTIVE
TRIAL
SUSPENDED
CANCELLED
```

### 3.3 ServiceStatus

```text
NEW
APPOINTMENT_SCHEDULED
ASSIGNED
IN_PROGRESS
WAITING_PART
WAITING_CUSTOMER_APPROVAL
REPAIRING
READY_FOR_DELIVERY
DELIVERED
CANCELLED
UNREACHABLE
UNPAID
```

### 3.4 ServicePriority

```text
LOW
NORMAL
HIGH
URGENT
```

### 3.5 ServiceType

```text
ON_SITE
WORKSHOP
PICKUP
INSTALLATION
MAINTENANCE
```

### 3.6 PaymentType

```text
CASH
CARD
BANK_TRANSFER
OTHER
```

### 3.7 PaymentStatus

```text
PENDING
PAID
PARTIAL
CANCELLED
REFUNDED
```

### 3.8 FileVisibility

```text
PRIVATE
STAFF_ONLY
CUSTOMER_VISIBLE
```

### 3.9 TransactionDirection

```text
INCOME
EXPENSE
```

### 3.10 AuditAction

String olarak tutulabilir. Örnekler:

```text
customer.created
customer.updated
device.created
service.created
service.updated
service.status_changed
service.assigned
payment.created
expense.created
file.uploaded
settings.updated
role.updated
```

## 4. Tablolar

## 4.1 companies

Firmaları tutar.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| name | String | Firma adı |
| slug | String | URL dostu benzersiz ad |
| short_code | String? | Takip no için kısa kod |
| phone | String? | Firma telefonu |
| email | String? | Firma e-posta |
| address | Text? | Firma adresi |
| city | String? | Şehir |
| district | String? | İlçe |
| logo_file_id | UUID? | Firma logosu |
| status | CompanyStatus | ACTIVE/TRIAL vb. |
| default_locale | String | tr |
| timezone | String | Europe/Istanbul |
| currency | String | TRY |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
unique(slug)
index(status)
```

## 4.2 users

Sistem kullanıcıları.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| name | String | Ad soyad |
| email | String | Benzersiz e-posta |
| phone | String? | Telefon |
| password_hash | String | Hash'li parola |
| avatar_file_id | UUID? | Profil görseli |
| status | UserStatus | ACTIVE vb. |
| locale | String | tr/en |
| last_login_at | DateTime? | Son giriş |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
unique(email)
index(status)
```

## 4.3 company_users

Kullanıcının firmadaki üyeliğini tutar. Bir kullanıcı birden fazla firmaya bağlı olabilir.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | companies.id |
| user_id | UUID | users.id |
| role_id | UUID | roles.id |
| title | String? | Firma içi ünvan |
| is_owner | Boolean | Firma sahibi mi |
| status | UserStatus | ACTIVE/INVITED vb. |
| invited_at | DateTime? | Davet tarihi |
| joined_at | DateTime? | Katılım tarihi |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |

Index:

```text
unique(company_id, user_id)
index(company_id)
index(user_id)
index(role_id)
```

## 4.4 roles

Firma bazlı roller.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID? | Null ise sistem default rol olabilir |
| name | String | Admin, Tekniker vb. |
| key | String | ADMIN, TECHNICIAN vb. |
| description | Text? | Açıklama |
| is_system | Boolean | Sistem rolü mü |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |

Index:

```text
unique(company_id, key)
```

Sistem rolleri için `company_id` null olabileceğinden tekillik ayrıca garanti edilmelidir. PostgreSQL'de `null` değerler normal unique index içinde birbirinden farklı sayılır.

Gerekli kural:

```text
unique(company_id, key) where company_id is not null
unique(key) where company_id is null
```

## 4.5 permissions

Yetki tanımları.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| key | String | Örn: service.update |
| module | String | service, customer, cash |
| description | Text? | Açıklama |

Index:

```text
unique(key)
```

## 4.6 role_permissions

Rol-yetki ilişkisi.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| role_id | UUID | roles.id |
| permission_id | UUID | permissions.id |

Index:

```text
unique(role_id, permission_id)
```

## 4.7 customers

Müşteri ana kaydı.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| full_name | String | Ad soyad / firma adı |
| phone | String | Ana telefon |
| secondary_phone | String? | Alternatif telefon |
| email | String? | E-posta |
| tax_number | String? | Vergi no, opsiyonel |
| tax_office | String? | Vergi dairesi |
| note | Text? | İç not |
| created_by_user_id | UUID | Oluşturan kullanıcı |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
index(company_id)
index(company_id, phone)
index(company_id, full_name)
```

## 4.8 customer_addresses

Müşteri adresleri. Bir müşterinin birden fazla adresi olabilir.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| customer_id | UUID | customers.id |
| title | String | Ev, iş, depo vb. |
| city | String? | Şehir |
| district | String? | İlçe |
| neighborhood | String? | Mahalle |
| address_line | Text | Açık adres |
| location_url | Text? | Harita linki |
| latitude | Decimal? | Opsiyonel |
| longitude | Decimal? | Opsiyonel |
| is_default | Boolean | Varsayılan adres |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
index(company_id, customer_id)
```

## 4.9 devices

Müşteriye ait cihazlar.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| customer_id | UUID | customers.id |
| category | String | Buzdolabı, çamaşır makinesi vb. |
| brand | String? | Marka |
| model | String? | Model |
| serial_no | String? | Seri no |
| purchase_date | DateTime? | Satın alma tarihi |
| warranty_until | DateTime? | Garanti bitiş tarihi |
| note | Text? | İç not |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
index(company_id)
index(company_id, customer_id)
index(company_id, serial_no)
```

## 4.10 service_records

Uygulamanın ana tablosudur. İş emri / servis kaydı bilgisini tutar.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| tracking_no | String | SRV-2026-000001 gibi |
| customer_id | UUID | customers.id |
| customer_address_id | UUID? | Adres |
| device_id | UUID | devices.id |
| service_type | ServiceType | ON_SITE/WORKSHOP vb. |
| status | ServiceStatus | Güncel durum |
| priority | ServicePriority | Öncelik |
| fault_description | Text | Müşterinin arıza açıklaması |
| diagnosis | Text? | Teknik tespit |
| internal_note | Text? | Sadece personel |
| customer_visible_note | Text? | Public takipte gösterilebilir not |
| estimated_price | Decimal? | Tahmini fiyat |
| approved_price | Decimal? | Onaylanan fiyat |
| total_paid | Decimal | Toplam tahsilat |
| currency | String | TRY |
| assigned_user_id | UUID? | Ana sorumlu personel |
| appointment_at | DateTime? | Randevu zamanı |
| received_at | DateTime? | Cihaz teslim alındıysa |
| completed_at | DateTime? | Tamamlanma |
| delivered_at | DateTime? | Teslim |
| due_at | DateTime? | Yasal/operasyonel son tarih |
| created_by_user_id | UUID | Oluşturan kullanıcı |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
unique(company_id, tracking_no)
index(company_id, status)
index(company_id, customer_id)
index(company_id, device_id)
index(company_id, assigned_user_id)
index(company_id, appointment_at)
index(company_id, due_at)
```

`total_paid`, `payments` tablosundan türeyen denormalize bir alandır. Ödeme oluşturma, güncelleme, silme veya iptal işlemleri aynı transaction içinde `service_records.total_paid` değerini yeniden hesaplamalıdır. Bu senkronizasyon yapılamayacaksa API yanıtlarında `payments` üzerinden hesaplanan değer kullanılmalı ve `total_paid` kolonu tutulmamalıdır.

## 4.11 service_status_history

Servis durum geçmişi / timeline.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID | service_records.id |
| old_status | ServiceStatus? | Eski durum |
| new_status | ServiceStatus | Yeni durum |
| note | Text? | Açıklama |
| changed_by_user_id | UUID | Değiştiren kullanıcı |
| created_at | DateTime | Oluşturma |

Index:

```text
index(company_id, service_record_id)
index(company_id, created_at)
```

## 4.12 service_notes

Servis kaydı notları.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID | service_records.id |
| author_user_id | UUID | Not yazan kullanıcı |
| body | Text | Not içeriği |
| is_customer_visible | Boolean | Public takipte gösterilsin mi |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
index(company_id, service_record_id)
```

## 4.13 files

Genel dosya metadata tablosu.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| uploaded_by_user_id | UUID? | Yükleyen kullanıcı |
| bucket | String | Storage bucket |
| object_key | Text | Storage path |
| original_name | String | Orijinal dosya adı |
| mime_type | String | MIME type |
| size_bytes | BigInt | Boyut |
| visibility | FileVisibility | PRIVATE vb. |
| created_at | DateTime | Oluşturma |
| deleted_at | DateTime? | Soft delete |

Index:

```text
index(company_id)
index(company_id, uploaded_by_user_id)
```

## 4.14 service_photos

Servis kaydına bağlı fotoğraflar.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID | service_records.id |
| file_id | UUID | files.id |
| title | String? | Fotoğraf başlığı |
| description | Text? | Açıklama |
| is_customer_visible | Boolean | Müşteri görebilir mi |
| created_at | DateTime | Oluşturma |

Index:

```text
index(company_id, service_record_id)
```

## 4.15 service_assignments

Bir servis kaydına birden fazla personel atanabilir.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID | service_records.id |
| user_id | UUID | users.id |
| assigned_by_user_id | UUID | Atayan |
| note | Text? | Açıklama |
| assigned_at | DateTime | Atama tarihi |
| unassigned_at | DateTime? | Atamadan çıkarılma |

Index:

```text
index(company_id, service_record_id)
index(company_id, user_id)
```

## 4.16 appointments

Randevu kayıtları. MVP'de servis kaydındaki `appointment_at` yeterli olabilir; tekrar planlama geçmişi için bu tablo kullanılır.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID | service_records.id |
| start_at | DateTime | Başlangıç |
| end_at | DateTime? | Bitiş |
| assigned_user_id | UUID? | Personel |
| note | Text? | Not |
| created_by_user_id | UUID | Oluşturan |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| cancelled_at | DateTime? | İptal |

Index:

```text
index(company_id, start_at)
index(company_id, assigned_user_id, start_at)
```

## 4.17 parts

Parça kartı. MVP'de basit tutulur.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| name | String | Parça adı |
| code | String? | Parça kodu |
| brand | String? | Marka |
| unit | String | adet vb. |
| purchase_price | Decimal? | Alış fiyatı |
| sale_price | Decimal? | Satış fiyatı |
| stock_quantity | Decimal | Basit stok adedi |
| currency | String | TRY |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
index(company_id)
unique(company_id, code)
```

## 4.18 service_parts

Servis kaydında kullanılan veya beklenen parçalar.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID | service_records.id |
| part_id | UUID? | parts.id, opsiyonel |
| name | String | Parça adı, manuel giriş için |
| quantity | Decimal | Adet |
| purchase_price | Decimal? | Maliyet |
| sale_price | Decimal? | Müşteriye satış |
| currency | String | TRY |
| is_required | Boolean | Gerekli mi |
| is_supplied | Boolean | Tedarik edildi mi |
| supplied_at | DateTime? | Tedarik tarihi |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |

Index:

```text
index(company_id, service_record_id)
index(company_id, part_id)
```

## 4.19 stock_movements

Basit stok hareketleri. MVP'de kullanılmayabilir ama model hazır tutulabilir.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| part_id | UUID | parts.id |
| service_record_id | UUID? | İlgili servis |
| type | String | IN/OUT/ADJUSTMENT |
| quantity | Decimal | Miktar |
| unit_cost | Decimal? | Birim maliyet |
| note | Text? | Açıklama |
| created_by_user_id | UUID | Oluşturan |
| created_at | DateTime | Oluşturma |

Index:

```text
index(company_id, part_id)
index(company_id, service_record_id)
```

## 4.20 payments

Tahsilat kayıtları.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID? | İlgili servis |
| customer_id | UUID? | Müşteri |
| amount | Decimal | Tutar |
| currency | String | TRY |
| payment_type | PaymentType | Nakit/kart/havale |
| status | PaymentStatus | PAID/PENDING vb. |
| description | Text? | Açıklama |
| paid_at | DateTime | Ödeme tarihi |
| created_by_user_id | UUID | Oluşturan |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
index(company_id, paid_at)
index(company_id, service_record_id)
index(company_id, customer_id)
```

## 4.21 expenses

Gider kayıtları.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID? | Servise bağlı gider olabilir |
| category | String | Parça alımı, yakıt vb. |
| amount | Decimal | Tutar |
| currency | String | TRY |
| description | Text? | Açıklama |
| spent_at | DateTime | Gider tarihi |
| created_by_user_id | UUID | Oluşturan |
| created_at | DateTime | Oluşturma |
| updated_at | DateTime | Güncelleme |
| deleted_at | DateTime? | Soft delete |

Index:

```text
index(company_id, spent_at)
index(company_id, service_record_id)
```

## 4.22 public_tracking_links

Müşterinin cihaz durumunu link ile görmesini sağlar.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| service_record_id | UUID | service_records.id |
| code | String | Tahmin edilemez public kod |
| is_active | Boolean | Aktif mi |
| expires_at | DateTime? | Son kullanma |
| created_at | DateTime | Oluşturma |
| revoked_at | DateTime? | İptal |

Index:

```text
unique(code)
index(company_id, service_record_id)
```

Public tracking sayfası sadece şu bilgileri döndürmelidir:

- firma adı ve iletişim bilgisi
- takip no
- cihaz türü/marka/model
- güncel durum
- müşteriye açık notlar
- müşteriye açık fotoğraflar, varsa
- tahmini teslim tarihi, varsa
- onay bekleyen teklif tutarı, gerekiyorsa

Şunlar gösterilmemelidir:

- iç notlar
- parça alış fiyatı
- personel iç konuşmaları
- audit log
- diğer müşteriler
- kasa raporları

## 4.23 audit_logs

Kimin ne yaptığını tutar.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID? | Tenant loglarında zorunlu; sadece sistem kapsamlı loglarda null olabilir |
| actor_user_id | UUID? | İşlemi yapan kullanıcı |
| action | String | service.created vb. |
| entity_type | String | service_record, customer vb. |
| entity_id | UUID? | İlgili kayıt |
| old_values | Json? | Önceki değerler |
| new_values | Json? | Yeni değerler |
| ip_address | String? | IP |
| user_agent | Text? | User agent |
| created_at | DateTime | Oluşturma |

Index:

```text
index(company_id, created_at)
index(company_id, entity_type, entity_id)
index(actor_user_id, created_at)
```

Tenant içindeki tüm audit log kayıtlarında `company_id` dolu olmalıdır. `company_id = null` yalnızca tenant'a bağlı olmayan sistem olayları için kullanılabilir; müşteri, cihaz, servis, ödeme, gider, dosya, ayar ve rol işlemlerinde null kabul edilmez.

## 4.24 notifications

Uygulama içi bildirimler.

| Alan | Tip | Açıklama |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | Tenant |
| user_id | UUID | Alıcı kullanıcı |
| title | String | Başlık |
| body | Text? | İçerik |
| type | String | appointment, service, payment vb. |
| entity_type | String? | İlgili entity |
| entity_id | UUID? | İlgili kayıt |
| read_at | DateTime? | Okunma |
| created_at | DateTime | Oluşturma |

Index:

```text
index(company_id, user_id, read_at)
index(company_id, created_at)
```

## 5. Takip No Üretimi

Servis takip no formatı:

```text
SRV-YYYY-000001
```

Alternatif firma kodlu format:

```text
CT-2026-000001
```

Kurallar:

- Firma bazında benzersiz olmalıdır.
- Kullanıcıya gösterilen ana numaradır.
- UUID yerine takip no aranabilir olmalıdır.
- Yarış durumlarına karşı transaction veya sequence benzeri güvenli yöntem kullanılmalıdır.

## 6. Tenant Güvenliği

Her backend sorgusunda şu mantık uygulanır:

```ts
where: {
  company_id: currentCompanyId,
  id: recordId,
  deleted_at: null
}
```

Yasak:

```ts
where: { id: recordId }
```

Public tracking endpointleri hariç hiçbir tenant verisi company filtresi olmadan dönmemelidir.

## 7. MVP İçin Minimum İlişkiler

MVP'nin çalışması için minimum ilişki zinciri:

```text
company
  -> users via company_users
  -> customers
      -> customer_addresses
      -> devices
          -> service_records
              -> service_status_history
              -> service_notes
              -> service_photos
              -> service_parts
              -> payments
  -> expenses
  -> audit_logs
```

## 8. Prisma Notları

Prisma schema yazılırken:

- Model adları PascalCase olabilir, tablo adları `@@map` ile snake_case'e maplenebilir.
- Decimal alanlarda `@db.Decimal(12, 2)` kullanılmalıdır.
- UUID için `@default(uuid())` kullanılmalıdır.
- `createdAt`, `updatedAt` alanları Prisma standardında olabilir ancak DB kolonları snake_case maplenmelidir.
- Soft delete query filtreleri service katmanında unutulmamalıdır.

Örnek yaklaşım:

```prisma
model ServiceRecord {
  id          String   @id @default(uuid()) @db.Uuid
  companyId   String   @map("company_id") @db.Uuid
  trackingNo  String   @map("tracking_no")
  status      String
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  @@unique([companyId, trackingNo])
  @@map("service_records")
}
```
