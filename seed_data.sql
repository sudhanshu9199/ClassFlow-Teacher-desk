-- ============================================================================
-- ClassFlow: Realistic Seed Data for Indian Primary School (Class 4-A)
-- Run this in Supabase SQL Editor AFTER running supabase_schema.sql
-- ============================================================================

DO $$
DECLARE
    v_teacher_id UUID := gen_random_uuid();
    v_coordinator_id UUID := gen_random_uuid();
    v_class_id UUID := gen_random_uuid();
    v_student1_id UUID := gen_random_uuid();
    v_student2_id UUID := gen_random_uuid();
    v_student3_id UUID := gen_random_uuid();
    v_student4_id UUID := gen_random_uuid();
    v_student5_id UUID := gen_random_uuid();
    v_student6_id UUID := gen_random_uuid();
    v_asg1_id UUID := gen_random_uuid();
    v_asg2_id UUID := gen_random_uuid();
    v_asg3_id UUID := gen_random_uuid();
    v_quiz_id UUID := gen_random_uuid();
BEGIN
    -- 0. Create Auth Users (ensures public.staff FK constraints succeed without manual signups)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES
        (
            v_teacher_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'sunita.sharma@dps-model.edu.in',
            crypt('Password@123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Mrs. Sunita Sharma"}',
            now(),
            now()
        ),
        (
            v_coordinator_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'rajesh.gupta@dps-model.edu.in',
            crypt('Password@123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Mr. Rajesh Gupta"}',
            now(),
            now()
        )
    ON CONFLICT (id) DO NOTHING;

    -- 1. Insert Staff profiles
    INSERT INTO public.staff (id, email, full_name, role, school_name)
    VALUES
        (v_teacher_id, 'sunita.sharma@dps-model.edu.in', 'Mrs. Sunita Sharma', 'teacher', 'Delhi Public Model School (Primary Wing)'),
        (v_coordinator_id, 'rajesh.gupta@dps-model.edu.in', 'Mr. Rajesh Gupta', 'coordinator', 'Delhi Public Model School (Primary Wing)')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Class (Class 4-A Mathematics)
    INSERT INTO public.classes (id, name, grade_level, section, subject, class_teacher_id, academic_year)
    VALUES
        (v_class_id, 'Class 4-A', 4, 'A', 'Mathematics', v_teacher_id, '2026-2027')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Students (Roll 1 to 6)
    INSERT INTO public.students (id, admission_number, roll_number, first_name, last_name, father_name, mother_name, primary_contact)
    VALUES
        (v_student1_id, 'ADM-2026-101', 1, 'Aarav', 'Sharma', 'Mr. Vivek Sharma', 'Mrs. Priya Sharma', '+91 98111-22331'),
        (v_student2_id, 'ADM-2026-102', 2, 'Ananya', 'Patel', 'Mr. Rajesh Patel', 'Mrs. Meena Patel', '+91 98222-33442'),
        (v_student3_id, 'ADM-2026-103', 3, 'Devansh', 'Gupta', 'Mr. Amit Gupta', 'Mrs. Ritu Gupta', '+91 98333-44553'),
        (v_student4_id, 'ADM-2026-104', 4, 'Ishaan', 'Verma', 'Mr. Sanjay Verma', 'Mrs. Pooja Verma', '+91 98444-55664'),
        (v_student5_id, 'ADM-2026-105', 5, 'Diya', 'Iyer', 'Mr. Karthik Iyer', 'Mrs. Deepa Iyer', '+91 98555-66775'),
        (v_student6_id, 'ADM-2026-106', 6, 'Kabir', 'Mehta', 'Mr. Rahul Mehta', 'Mrs. Suman Mehta', '+91 98666-77886')
    ON CONFLICT (id) DO NOTHING;

    -- 4. Enroll Students into Class 4-A
    INSERT INTO public.enrollments (class_id, student_id, academic_year)
    VALUES
        (v_class_id, v_student1_id, '2026-2027'),
        (v_class_id, v_student2_id, '2026-2027'),
        (v_class_id, v_student3_id, '2026-2027'),
        (v_class_id, v_student4_id, '2026-2027'),
        (v_class_id, v_student5_id, '2026-2027'),
        (v_class_id, v_student6_id, '2026-2027')
    ON CONFLICT DO NOTHING;

    -- 5. Insert Recent Assignments (Homework)
    INSERT INTO public.assignments (id, class_id, title, type, due_date)
    VALUES
        (v_asg1_id, v_class_id, 'Ex 4.1: Multiplication Word Problems', 'homework', CURRENT_DATE - INTERVAL '4 days'),
        (v_asg2_id, v_class_id, 'Ex 4.2: Long Division Basics', 'homework', CURRENT_DATE - INTERVAL '2 days'),
        (v_asg3_id, v_class_id, 'Ex 4.3: Division with Remainders', 'homework', CURRENT_DATE)
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Submissions (Ananya missed 2 in a row; Ishaan had 1 incomplete)
    INSERT INTO public.submissions (assignment_id, student_id, status)
    VALUES
        -- Asg 1 (4 days ago)
        (v_asg1_id, v_student1_id, 'submitted'),
        (v_asg1_id, v_student2_id, 'submitted'),
        (v_asg1_id, v_student3_id, 'submitted'),
        (v_asg1_id, v_student4_id, 'submitted'),
        (v_asg1_id, v_student5_id, 'submitted'),
        (v_asg1_id, v_student6_id, 'submitted'),

        -- Asg 2 (2 days ago)
        (v_asg2_id, v_student1_id, 'submitted'),
        (v_asg2_id, v_student2_id, 'missing'),    -- Ananya Missing #1
        (v_asg2_id, v_student3_id, 'submitted'),
        (v_asg2_id, v_student4_id, 'incomplete'), -- Ishaan Incomplete
        (v_asg2_id, v_student5_id, 'submitted'),
        (v_asg2_id, v_student6_id, 'submitted'),

        -- Asg 3 (Today)
        (v_asg3_id, v_student1_id, 'submitted'),
        (v_asg3_id, v_student2_id, 'missing'),    -- Ananya Missing #2 (Triggers RED!)
        (v_asg3_id, v_student3_id, 'submitted'),
        (v_asg3_id, v_student4_id, 'submitted'),
        (v_asg3_id, v_student5_id, 'submitted'),
        (v_asg3_id, v_student6_id, 'submitted')
    ON CONFLICT DO NOTHING;

    -- 7. Insert Assessments (Periodic Test 1)
    INSERT INTO public.assessments (id, class_id, title, max_marks, assessment_date)
    VALUES
        (v_quiz_id, v_class_id, 'Periodic Test 1: Numbers & Operations', 25.00, CURRENT_DATE - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.assessment_scores (assessment_id, student_id, marks_obtained, is_absent, remarks)
    VALUES
        (v_quiz_id, v_student1_id, 24.00, false, 'Excellent problem solving'),
        (v_quiz_id, v_student2_id, 11.50, false, 'Struggling with multi-step division'),
        (v_quiz_id, v_student3_id, 19.00, false, 'Good grasp of concepts'),
        (v_quiz_id, v_student4_id, 09.00, false, 'Needs remedial assistance'),
        (v_quiz_id, v_student5_id, 23.50, false, 'Very neat presentation'),
        (v_quiz_id, v_student6_id, 20.00, false, 'Consistent performance')
    ON CONFLICT DO NOTHING;

    -- 8. Insert Observations & Escalation Flags
    INSERT INTO public.observations (student_id, class_id, teacher_id, category, severity, teacher_note, suggested_admin_action, admin_status)
    VALUES
        (v_student2_id, v_class_id, v_teacher_id, 'incomplete_work', 'red', 'Missed 2 consecutive division homeworks and scored 11.5/25 in PT1. Notebook incomplete.', 'Recommend Parent Call', 'pending_review'),
        (v_student4_id, v_class_id, v_teacher_id, 'academic', 'amber', 'Scored 9/25 in PT1 operations test. Recommended for 3:15 PM remedial batch.', 'Recommend Remedial Class', 'pending_review')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seed data loaded successfully for Class 4-A!';
END $$;
