# How to Migrate Your Old System Data to FOD Clinic

## Step 1: Prepare Your Excel File

Create an Excel file (.xlsx or .xls) with your patient and payment data.

### Minimum columns (required):
| Name  | Phone     |
|-------|-----------|
| John  | 0612345678|
| Mary  | 0619999999|

### With payment history (recommended):
| Name  | Phone     | AmountPaid | TotalAmount | PaymentDate  | PaymentMethod | Notes   |
|-------|-----------|------------|-------------|--------------|---------------|---------|
| John  | 0612345678| 50         | 100         | 2024-01-15   | zaad          | Visit 1 |
| John  | 0612345678| 50         | 100         | 2024-02-01   | zaad          | Visit 2 |
| Mary  | 0619999999| 75         | 75          | 2024-01-20   | edahab        |         |

### Column names accepted (any of these work):
- **Name:** Name, name, Patient, patient
- **Phone:** Phone, phone, Tel, tel
- **AmountPaid:** AmountPaid, Amount Paid, amountPaid, Paid, paid
- **TotalAmount:** TotalAmount, Total Amount, totalAmount, Total, total
- **PaymentDate:** PaymentDate, Payment Date, Date, date
- **PaymentMethod:** PaymentMethod, Payment Method, Method, method (values: zaad, edahab, premier_bank)
- **Notes:** Notes, notes

### Optional patient columns:
- Email, Gender, Address, DateOfBirth, MedicalHistory, Allergies

## Step 2: Import in the App

1. Go to **Patients** page
2. Click **Import Excel**
3. Select **Migration (Patients + Payments)** mode
4. Choose your Excel file
5. Click **Import**

## Tips

- **Multiple payments per patient:** Use multiple rows with the same Name + Phone. Each row creates one payment.
- **Patients without payments:** Rows with only Name + Phone (no amount) create the patient only.
- **Duplicate phone:** If a phone number already exists in the system, new payments will be linked to that patient (no duplicate patient created).
