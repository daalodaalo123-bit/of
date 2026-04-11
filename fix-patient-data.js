const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Load environment variables manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  console.log(`🔗 MONGODB_URI length: ${MONGODB_URI.length}`);
  console.log(`🔗 MONGODB_URI starts with: ${MONGODB_URI.substring(0, 20)}...`);
}
const EXCEL_FILE = path.join(__dirname, '..', 'FOD-Clinic-Backup-2026-03-28.xlsx');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const PatientSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  totalDue: Number,
  doctorId: String,
  doctorName: String,
  updatedAt: Date
});

const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

async function run() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: 'healthcare_db' });
    console.log('✅ Connected to healthcare_db');

    console.log(`🔍 Reading Excel file: ${EXCEL_FILE}`);
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`📊 Found ${data.length} rows in Excel`);

    let updated = 0;
    let notFound = 0;

    for (const row of data) {
      const name = row.Name || row.name;
      const phone = String(row.Phone || row.phone || '').trim();
      const totalDue = Number(row['Total Due'] || row.totalDue) || 0;
      const doctorId = row['Doctor ID'] || row.doctorId || null;
      const doctorName = row['Doctor Name'] || row.doctorName || null;

      if (!name || !phone) continue;

      // Try to find patient by phone or name
      const patient = await Patient.findOne({ 
        $or: [
          { phone: phone },
          { name: { $regex: new RegExp(`^${name}$`, 'i') } }
        ]
      });

      if (patient) {
        patient.totalDue = totalDue;
        patient.doctorId = doctorId;
        patient.doctorName = doctorName;
        patient.updatedAt = new Date();
        await patient.save();
        updated++;
        if (updated % 10 === 0) console.log(`✅ Updated ${updated} patients...`);
      } else {
        notFound++;
      }
    }

    console.log('\n--- Migration Finished ---');
    console.log(`✅ Total updated: ${updated}`);
    console.log(`❓ Total not found in DB: ${notFound}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
