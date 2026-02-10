-- Fix duty_assignments table to support Santral shifts

-- Drop existing CHECK constraint
ALTER TABLE duty_assignments DROP CONSTRAINT IF EXISTS duty_assignments_shift_check;

-- Add new CHECK constraint with Santral shifts
ALTER TABLE duty_assignments ADD CONSTRAINT duty_assignments_shift_check 
CHECK (shift IS NULL OR shift IN (
  'Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2',
  'Santral Gündüz', 'Santral Gece'
));

SELECT 'Duty assignments schema updated!' as status;
