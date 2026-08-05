const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedCivil() {
  const { data: civilProgs } = await supabase.from('programs').select('id, name, code').eq('department_id', 'a5555555-5555-5555-5555-555555555555');
  for (const prog of civilProgs || []) {
    const { data: sems } = await supabase.from('semesters').select('id, semester_number').eq('program_id', prog.id);
    for (const sem of sems || []) {
      const c1Code = `CE-${sem.semester_number}01`;
      const c2Code = `CE-${sem.semester_number}02`;
      await supabase.from('courses').upsert([
        {
          program_id: prog.id,
          semester_id: sem.id,
          code: c1Code,
          title: `Civil Engineering Core I (Sem ${sem.semester_number})`,
          slug: `ce-${sem.semester_number}01-core-1`,
          description: `Structural mechanics, surveying, and fluid dynamics for Civil Engineering Semester ${sem.semester_number}.`,
          instructor_name: 'Engr. Bilal Raza',
          credit_hours: 4
        },
        {
          program_id: prog.id,
          semester_id: sem.id,
          code: c2Code,
          title: `Civil Engineering Core II (Sem ${sem.semester_number})`,
          slug: `ce-${sem.semester_number}02-core-2`,
          description: `Concrete technology, soil mechanics, and lab practices for Civil Engineering Semester ${sem.semester_number}.`,
          instructor_name: 'Prof. Civil Lead',
          credit_hours: 3
        }
      ], { onConflict: 'program_id,code' });
    }
  }
  console.log('Civil Engineering courses populated!');
}

seedCivil().catch(console.error);
