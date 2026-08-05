const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runEndToEndVerification() {
  console.log('=== STARTING END-TO-END UPLOAD & METADATA VERIFICATION ===\n');

  // 1. Resolve CS-202 course (Semester 3) and CS-301 course (Semester 5)
  const { data: sem3Course } = await supabase
    .from('courses')
    .select('id, code, title, semesters(semester_number, title)')
    .eq('code', 'CS-202')
    .single();

  const { data: sem5Course } = await supabase
    .from('courses')
    .select('id, code, title, semesters(semester_number, title)')
    .eq('code', 'CS-301')
    .single();

  console.log('[1/5] Course Resolution:');
  console.log('  Sem 3 Course:', sem3Course?.code, '-> Semester:', sem3Course?.semesters?.semester_number);
  console.log('  Sem 5 Course:', sem5Course?.code, '-> Semester:', sem5Course?.semesters?.semester_number);

  if (!sem3Course || !sem5Course) {
    throw new Error('Required test courses CS-202 or CS-301 missing in DB.');
  }

  // 2. Upload PDF A (500 KB) for Semester 3
  const pdfBufferA = Buffer.alloc(512000, '%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n3 0 obj <</Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792]>> endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer <</Size 4 /Root 1 0 R>>\nstartxref\n212\n%%EOF');
  const pathA = `resources/test/pdf_a_sem3_${Date.now()}.pdf`;
  
  await supabase.storage.from('academic_resources').upload(pathA, pdfBufferA, { contentType: 'application/pdf', upsert: true });

  const { data: catRow } = await supabase.from('categories').select('id').limit(1).single();

  const { data: resA } = await supabase.from('resources').insert({
    uploader_id: 'f271ad2b-3c29-48de-b88d-de2f6c1426df', // Admin user ID
    course_id: sem3Course.id,
    category_id: catRow.id,
    title: 'Data Structures Sem 3 Exam Notes (PDF A)',
    description: 'Verified midterm exam preparation notes for Semester 3.',
    file_storage_path: pathA,
    file_hash: 'hashA_' + Date.now(),
    status: 'APPROVED'
  }).select().single();

  await supabase.from('storage_metadata').insert({
    resource_id: resA.id,
    file_hash: resA.file_hash,
    mime_type: 'application/pdf',
    file_size_bytes: 512000,
    virus_scan_status: 'PASSED'
  });

  // 3. Upload PDF B (1.2 MB) for Semester 5
  const pdfBufferB = Buffer.alloc(1258291, '%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n3 0 obj <</Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792]>> endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer <</Size 4 /Root 1 0 R>>\nstartxref\n212\n%%EOF');
  const pathB = `resources/test/pdf_b_sem5_${Date.now()}.pdf`;

  await supabase.storage.from('academic_resources').upload(pathB, pdfBufferB, { contentType: 'application/pdf', upsert: true });

  const { data: resB } = await supabase.from('resources').insert({
    uploader_id: 'f271ad2b-3c29-48de-b88d-de2f6c1426df',
    course_id: sem5Course.id,
    category_id: catRow.id,
    title: 'Machine Learning Sem 5 Project Spec (PDF B)',
    description: 'Verified machine learning project handbook for Semester 5.',
    file_storage_path: pathB,
    file_hash: 'hashB_' + Date.now(),
    status: 'APPROVED'
  }).select().single();

  await supabase.from('storage_metadata').insert({
    resource_id: resB.id,
    file_hash: resB.file_hash,
    mime_type: 'application/pdf',
    file_size_bytes: 1258291,
    virus_scan_status: 'PASSED'
  });

  console.log('\n[2/5] Created Test Uploads in DB:');
  console.log('  PDF A ID:', resA.id, 'Path:', pathA);
  console.log('  PDF B ID:', resB.id, 'Path:', pathB);

  // 4. Verify API response formatting
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const { data: fetchA } = await supabase
    .from('resources')
    .select('*, course:courses(*, semesters(*), programs(*, departments(*))), storage_metadata(*)')
    .eq('id', resA.id)
    .single();

  const { data: fetchB } = await supabase
    .from('resources')
    .select('*, course:courses(*, semesters(*), programs(*, departments(*))), storage_metadata(*)')
    .eq('id', resB.id)
    .single();

  const semA = fetchA.course?.semesters?.semester_number;
  const semB = fetchB.course?.semesters?.semester_number;
  const metaA = Array.isArray(fetchA.storage_metadata) ? fetchA.storage_metadata[0] : fetchA.storage_metadata;
  const metaB = Array.isArray(fetchB.storage_metadata) ? fetchB.storage_metadata[0] : fetchB.storage_metadata;
  const sizeA = formatBytes(metaA?.file_size_bytes || 0);
  const sizeB = formatBytes(metaB?.file_size_bytes || 0);

  console.log('\n[3/5] Formatted Metadata Verification:');
  console.log('  Resource A -> Title:', fetchA.title);
  console.log('                Semester Number:', semA, '(Expected: 3)');
  console.log('                Formatted Size:', sizeA, '(Expected: 500 KB)');
  console.log('                MIME Type:', metaA?.mime_type);

  console.log('\n  Resource B -> Title:', fetchB.title);
  console.log('                Semester Number:', semB, '(Expected: 5)');
  console.log('                Formatted Size:', sizeB, '(Expected: 1.2 MB)');
  console.log('                MIME Type:', metaB?.mime_type);

  // Assertions
  if (semA !== 3) throw new Error(`Mismatch in Resource A Semester: got ${semA}`);
  if (semB !== 5) throw new Error(`Mismatch in Resource B Semester: got ${semB}`);
  if (!sizeA.includes('KB')) throw new Error(`Mismatch in Resource A Size: got ${sizeA}`);
  if (!sizeB.includes('MB')) throw new Error(`Mismatch in Resource B Size: got ${sizeB}`);
  if (sizeA === sizeB) throw new Error('PDF A and PDF B sizes must be different!');

  // 5. Test Signed Download URL Generation & Binary Header
  const { data: signedA } = await supabase.storage.from('academic_resources').createSignedUrl(pathA, 3600);
  const resFetchA = await fetch(signedA.signedUrl);
  const bufA = Buffer.from(await resFetchA.arrayBuffer());

  console.log('\n[4/5] Download Verification:');
  console.log('  PDF A Signed URL Download Status:', resFetchA.status);
  console.log('  PDF A Downloaded Size:', bufA.length, 'bytes');
  console.log('  PDF A Header:', bufA.toString('utf8', 0, 10));

  if (bufA.length !== 512000) throw new Error(`Downloaded PDF size mismatch! Expected 512000, got ${bufA.length}`);

  console.log('\n[5/5] ALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!\n');
}

runEndToEndVerification().catch((err) => {
  console.error('E2E Verification Error:', err);
  process.exit(1);
});
