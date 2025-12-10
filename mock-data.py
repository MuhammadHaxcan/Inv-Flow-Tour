import psycopg2
from decimal import Decimal
from datetime import date

# Connection settings for local Postgres
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="invflow",
    user="postgres",
    password="1324",
)

with conn:
    with conn.cursor() as cur:
        # Clean slate (FK-safe)
        cur.execute(
            '''
            TRUNCATE
              "CompanySettings",
              "Signatures",
              "RolePermissions",
              "UserRoles",
              "Payments",
              "InvoiceExpenses",
              "InvoiceServices",
              "Transactions",
              "Invoices",
              "Users",
              "Roles",
              "Permissions",
              "Vendors",
              "ExpenseTypes",
              "Services",
              "Drivers",
              "Customers",
              "Accounts"
            RESTART IDENTITY CASCADE;
            '''
        )

        # Accounts
        cur.execute(
            '''INSERT INTO "Accounts" ("Name","AccountNumber","AccountType","Details","CreatedAt")
               VALUES (%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Main Cash Box", "CASH-001", "cash", "Walk-in cash payments"),
        )
        cash_id = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "Accounts" ("Name","AccountNumber","AccountType","Details","CreatedAt")
               VALUES (%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Operating Bank", "BANK-123456", "bank", "Primary operating account"),
        )
        bank_id = cur.fetchone()[0]

        # Customers
        cur.execute(
            '''INSERT INTO "Customers" ("Name","Phone","Email","Origin","CreatedAt")
               VALUES (%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Aurora Travel Co", "+1-555-1010", "ops@auroratravel.com", "USA"),
        )
        cust1 = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "Customers" ("Name","Phone","Email","Origin","CreatedAt")
               VALUES (%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Desert Breeze Tours", "+971-55-222-3333", "hello@desertbreeze.ae", "UAE"),
        )
        cust2 = cur.fetchone()[0]

        # Drivers
        cur.execute(
            '''INSERT INTO "Drivers" ("Name","Phone","CreatedAt")
               VALUES (%s,%s,NOW()) RETURNING "Id";''',
            ("Saeed Al Mansoori", "+971-50-111-2222"),
        )
        drv1 = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "Drivers" ("Name","Phone","CreatedAt")
               VALUES (%s,%s,NOW()) RETURNING "Id";''',
            ("Lina Qureshi", "+971-55-444-5555"),
        )
        drv2 = cur.fetchone()[0]

        # Services
        cur.execute(
            '''INSERT INTO "Services" ("Name","Description","Charge","VatIncluded","CreatedAt")
               VALUES (%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Desert Safari Premium", "4x4 dunes + dinner + show", Decimal("650.00"), Decimal("0.00")),
        )
        svc1 = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "Services" ("Name","Description","Charge","VatIncluded","CreatedAt")
               VALUES (%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Dubai City Tour", "Half-day guided tour", Decimal("450.00"), Decimal("0.00")),
        )
        svc2 = cur.fetchone()[0]

        # Expense Types
        cur.execute(
            '''INSERT INTO "ExpenseTypes" ("Name","DefaultValue","IsPaxBased","CreatedAt")
               VALUES (%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Fuel", Decimal("150.00"), False),
        )
        exp_fuel = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "ExpenseTypes" ("Name","DefaultValue","IsPaxBased","CreatedAt")
               VALUES (%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Park Entry", Decimal("35.00"), True),
        )
        exp_park = cur.fetchone()[0]

        # Vendors
        cur.execute(
            '''INSERT INTO "Vendors" ("Name","Phone","Email","Address","Notes","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Emirates Fuel Co", "+971-4-700-8000", "billing@emifuel.ae", "Al Quoz", "Preferred fuel vendor"),
        )
        vendor_fuel = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "Vendors" ("Name","Phone","Email","Address","Notes","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Dubai Parks Authority", "+971-600-123456", "accounts@dpa.gov.ae", "Dubai", "Park entry fees"),
        )
        vendor_park = cur.fetchone()[0]

        # Permissions
        perm_defs = [
            ("invoices.read", "View invoices", "invoices", "read"),
            ("invoices.write", "Create/update invoices", "invoices", "write"),
            ("payments.collect", "Record payments", "payments", "write"),
            ("reports.view", "View reports", "reports", "read"),
        ]
        perm_ids = []
        for name, desc, res, act in perm_defs:
            cur.execute(
                '''INSERT INTO "Permissions" ("Name","Description","Resource","Action","CreatedAt")
                   VALUES (%s,%s,%s,%s,NOW()) RETURNING "Id";''',
                (name, desc, res, act),
            )
            perm_ids.append(cur.fetchone()[0])

        # Roles
        cur.execute(
            '''INSERT INTO "Roles" ("Name","Description","CreatedAt")
               VALUES (%s,%s,NOW()) RETURNING "Id";''',
            ("Admin", "Full access"),
        )
        role_admin = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "Roles" ("Name","Description","CreatedAt")
               VALUES (%s,%s,NOW()) RETURNING "Id";''',
            ("Accountant", "Finance & collections"),
        )
        role_acct = cur.fetchone()[0]

        # RolePermissions
        # Admin gets all, Accountant gets read/payments/reports
        for pid in perm_ids:
            cur.execute(
                '''INSERT INTO "RolePermissions" ("RoleId","PermissionId","AssignedAt")
                   VALUES (%s,%s,NOW());''',
                (role_admin, pid),
            )

        for name in ("invoices.read", "payments.collect", "reports.view"):
            pid = perm_ids[[p[0] for p in perm_defs].index(name)]
            cur.execute(
                '''INSERT INTO "RolePermissions" ("RoleId","PermissionId","AssignedAt")
                   VALUES (%s,%s,NOW());''',
                (role_acct, pid),
            )

        # Users (password hashes pre-generated with BCrypt for "Admin123!" and "Account123!")
        admin_hash = "$2a$11$T5cR.V1BjqNG2QmI5c1EFudH0OQ8KRWh6k3i1chQEZunbOcEdUBhS"
        acct_hash = "$2a$11$VQWNeYxQC/jWRWlXTn0CMuL3KrvHrg7rJb9prYUF2Ydr4ZEZxjGPC"

        cur.execute(
            '''INSERT INTO "Users" ("Username","Email","PasswordHash","FullName","IsActive","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("admin", "admin@example.com", admin_hash, "System Admin", True),
        )
        user_admin = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "Users" ("Username","Email","PasswordHash","FullName","IsActive","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,NOW()) RETURNING "Id";''',
            ("accountant", "accountant@example.com", acct_hash, "Finance Officer", True),
        )
        user_acct = cur.fetchone()[0]

        # UserRoles
        cur.execute(
            '''INSERT INTO "UserRoles" ("UserId","RoleId","AssignedAt")
               VALUES (%s,%s,NOW());''',
            (user_admin, role_admin),
        )
        cur.execute(
            '''INSERT INTO "UserRoles" ("UserId","RoleId","AssignedAt")
               VALUES (%s,%s,NOW());''',
            (user_acct, role_acct),
        )

        # Signatures
        cur.execute(
            '''INSERT INTO "Signatures" ("Name","ImageData","IsActive","CreatedAt")
               VALUES (%s,%s,%s,NOW()) RETURNING "Id";''',
            ("Default Signer", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA", True),
        )
        sig_id = cur.fetchone()[0]

        # CompanySettings
        cur.execute(
            '''INSERT INTO "CompanySettings" ("CompanyName","Address","Phone","Email","Website","TRN","ActiveSignatureId","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,NOW());''',
            (
                "Siyyad Khan Tourism LLC",
                "Dubai, UAE",
                "+971-4-123-4567",
                "info@siyyadkhan.ae",
                "https://siyyadkhan.ae",
                "TRN-123456789",
                sig_id,
            ),
        )

        # Invoices
        cur.execute(
            '''INSERT INTO "Invoices"
               ("Number","Date","CustomerId","DriverId","DriverNotes","Persons","Total","Paid","Status","Vat","TripType","TripMode","EmailSentAt","CreatedByUserId","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s,NOW()) RETURNING "Id";''',
            (
                "INV-2025-001",
                date(2025, 1, 15),
                cust1,
                drv1,
                "Pickup at 3:00 PM",
                4,
                Decimal("1200.00"),
                Decimal("300.00"),
                1,  # InvoiceStatus.Partial
                Decimal("50.00"),
                0,  # TripType.Day
                0,  # TripMode.Shared
                user_admin,
            ),
        )
        inv1 = cur.fetchone()[0]

        cur.execute(
            '''INSERT INTO "Invoices"
               ("Number","Date","CustomerId","DriverId","Persons","Total","Paid","Status","Vat","TripType","TripMode","EmailSentAt","CreatedByUserId","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s,NOW()) RETURNING "Id";''',
            (
                "INV-2025-002",
                date(2025, 1, 20),
                cust2,
                drv2,
                2,
                Decimal("900.00"),
                Decimal("900.00"),
                2,  # InvoiceStatus.Paid
                Decimal("0.00"),
                1,  # TripType.Night
                1,  # TripMode.Private
                user_acct,
            ),
        )
        inv2 = cur.fetchone()[0]

        # Invoice services
        cur.execute(
            '''INSERT INTO "InvoiceServices" ("InvoiceId","ServiceId","ServiceName","Rate","CreatedAt")
               VALUES (%s,%s,%s,%s,NOW());''',
            (inv1, svc1, "Desert Safari Premium", Decimal("650.00")),
        )
        cur.execute(
            '''INSERT INTO "InvoiceServices" ("InvoiceId","ServiceId","ServiceName","Rate","CreatedAt")
               VALUES (%s,%s,%s,%s,NOW());''',
            (inv2, svc2, "Dubai City Tour", Decimal("450.00")),
        )

        # Invoice expenses
        cur.execute(
            '''INSERT INTO "InvoiceExpenses"
               ("InvoiceId","ExpenseTypeId","Type","Amount","Date","AccountId","VendorId","VendorName","Pax","PaymentStatus","PaidDate","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW());''',
            (
                inv1,
                exp_fuel,
                "Fuel",
                Decimal("180.00"),
                date(2025, 1, 15),
                cash_id,
                vendor_fuel,
                "Emirates Fuel Co",
                None,
                1,  # ExpensePaymentStatus.Paid
                date(2025, 1, 15),
            ),
        )
        cur.execute(
            '''INSERT INTO "InvoiceExpenses"
               ("InvoiceId","ExpenseTypeId","Type","Amount","Date","AccountId","VendorId","VendorName","Pax","PaymentStatus","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW());''',
            (
                inv2,
                exp_park,
                "Park Entry",
                Decimal("70.00"),
                date(2025, 1, 20),
                bank_id,
                vendor_park,
                "Dubai Parks Authority",
                2,
                0,  # ExpensePaymentStatus.Unpaid
            ),
        )

        # Payments
        cur.execute(
            '''INSERT INTO "Payments" ("InvoiceId","AccountId","Amount","Date","Reference","Vat","Notes","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,NOW());''',
            (
                inv1,
                bank_id,
                Decimal("300.00"),
                date(2025, 1, 16),
                "BANK-TXN-7788",
                Decimal("0.00"),
                "50% advance",
            ),
        )
        cur.execute(
            '''INSERT INTO "Payments" ("InvoiceId","AccountId","Amount","Date","Reference","Vat","Notes","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,NOW());''',
            (
                inv2,
                cash_id,
                Decimal("900.00"),
                date(2025, 1, 21),
                "CASH-REC-009",
                Decimal("0.00"),
                "Full payment collected",
            ),
        )

        # Transactions
        cur.execute(
            '''INSERT INTO "Transactions"
               ("Date","Description","InvoiceId","InvoiceNumber","AccountId","Credit","Debit","Reference","ExpenseType","Notes","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW());''',
            (
                date(2025, 1, 16),
                "Payment received - INV-2025-001",
                inv1,
                "INV-2025-001",
                bank_id,
                Decimal("300.00"),
                Decimal("0.00"),
                "BANK-TXN-7788",
                None,
                "Customer advance",
            ),
        )
        cur.execute(
            '''INSERT INTO "Transactions"
               ("Date","Description","InvoiceId","InvoiceNumber","AccountId","Credit","Debit","Reference","ExpenseType","Notes","CreatedAt")
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW());''',
            (
                date(2025, 1, 21),
                "Payment received - INV-2025-002",
                inv2,
                "INV-2025-002",
                cash_id,
                Decimal("900.00"),
                Decimal("0.00"),
                "CASH-REC-009",
                None,
                "Paid in full",
            ),
        )

print("✔ Seed data inserted successfully.")