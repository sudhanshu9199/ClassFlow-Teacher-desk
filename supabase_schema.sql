-- ============================================================================
-- ClassFlow: Teacher Workflow & Student Intervention System (Indian Primary Schools 1-6)
-- Complete Supabase PostgreSQL Schema, RLS Policies, Aggregations & Seed Data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLES & CONSTRAINTS
-- ============================================================================

-- 1.1 Staff Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'coordinator', 'principal', 'admin')),
    school_name TEXT NOT NULL DEFAULT 'Primary Model School',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Classes (e.g., Class 4-A Mathematics)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g. "Class 4-A"
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
    section TEXT NOT NULL DEFAULT 'A',
    subject TEXT NOT NULL, -- e.g. "Mathematics", "EVS", "English"
    class_teacher_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_number TEXT UNIQUE NOT NULL,
    roll_number INT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    primary_contact TEXT NOT NULL, -- Phone / WhatsApp contact of parent
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.4 Enrollments (Class ↔ Student Junction)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_class_student_year UNIQUE (class_id, student_id, academic_year)
);

-- 1.5 Assignments (Daily Homework & Classwork)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'homework' CHECK (type IN ('homework', 'classwork', 'project')),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.6 Submissions (Rapid Entry Grid Records)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('submitted', 'incomplete', 'missing', 'absent', 'pending')),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id)
);

-- 1.7 Assessments (Unit Tests / Periodic Tests)
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- e.g. "Periodic Test 1", "Mental Math Quiz"
    max_marks NUMERIC(5,2) NOT NULL DEFAULT 25.00,
    assessment_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.8 Assessment Scores
CREATE TABLE IF NOT EXISTS public.assessment_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5,2),
    is_absent BOOLEAN NOT NULL DEFAULT false,
    remarks TEXT,
    CONSTRAINT uq_assessment_student UNIQUE (assessment_id, student_id)
);

-- 1.9 Observations & Admin Escalation Flags
CREATE TABLE IF NOT EXISTS public.observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
    category TEXT NOT NULL CHECK (category IN ('academic', 'behavioral', 'incomplete_work', 'attendance', 'diary')),
    severity TEXT NOT NULL CHECK (severity IN ('amber', 'red')),
    teacher_note TEXT NOT NULL,
    suggested_admin_action TEXT NOT NULL CHECK (suggested_admin_action IN (
        'Recommend Parent Call',
        'Recommend Remedial Class',
        'Recommend Official Diary Note',
        'Request PTM Slot'
    )),
    admin_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (admin_status IN ('pending_review', 'approved', 'actioned_by_admin', 'rejected')),
    admin_feedback TEXT,
    approved_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    actioned_at TIMESTAMPTZ
);

-- 1.10 Report Exports Audit Log
CREATE TABLE IF NOT EXISTS public.report_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL, -- NULL if whole-class ledger
    report_type TEXT NOT NULL CHECK (report_type IN ('individual_ptm', 'class_consolidated')),
    timeframe TEXT NOT NULL CHECK (timeframe IN ('daily', 'weekly', 'monthly', 'custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    exported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. INDEXES FOR HIGH-SPEED LOGGING (60-90s RAPID QUERIES)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_due ON public.assignments(class_id, due_date);
CREATE INDEX IF NOT EXISTS idx_submissions_lookup ON public.submissions(assignment_id, student_id);
CREATE INDEX IF NOT EXISTS idx_observations_student_status ON public.observations(student_id, admin_status);
CREATE INDEX IF NOT EXISTS idx_assessments_class ON public.assessments(class_id);

-- ============================================================================
-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin/coordinator
CREATE OR REPLACE FUNCTION public.is_admin_or_coordinator()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.staff
        WHERE staff.id = auth.uid()
        AND staff.role IN ('coordinator', 'principal', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Staff Policies
CREATE POLICY "Staff can view their own profile or admins can view all"
ON public.staff FOR SELECT
USING (auth.uid() = id OR public.is_admin_or_coordinator());

-- Classes Policies
CREATE POLICY "Teachers can view their assigned classes, admins can view all"
ON public.classes FOR SELECT
USING (class_teacher_id = auth.uid() OR public.is_admin_or_coordinator());

-- Students Policies
CREATE POLICY "Staff can view students in their enrolled classes"
ON public.students FOR SELECT
USING (
    public.is_admin_or_coordinator() OR
    EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.classes c ON c.id = e.class_id
        WHERE e.student_id = students.id
        AND c.class_teacher_id = auth.uid()
    )
);

-- Enrollments Policies
CREATE POLICY "Teachers view enrollments for their classes"
ON public.enrollments FOR SELECT
USING (
    public.is_admin_or_coordinator() OR
    EXISTS (
        SELECT 1 FROM public.classes c
        WHERE c.id = enrollments.class_id
        AND c.class_teacher_id = auth.uid()
    )
);

-- Assignments Policies
CREATE POLICY "Teachers can manage assignments for their classes"
ON public.assignments FOR ALL
USING (
    public.is_admin_or_coordinator() OR
    EXISTS (
        SELECT 1 FROM public.classes c
        WHERE c.id = assignments.class_id
        AND c.class_teacher_id = auth.uid()
    )
);

-- Submissions Policies (Rapid Daily Grid)
CREATE POLICY "Teachers can manage submissions for their classes"
ON public.submissions FOR ALL
USING (
    public.is_admin_or_coordinator() OR
    EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.classes c ON c.id = a.class_id
        WHERE a.id = submissions.assignment_id
        AND c.class_teacher_id = auth.uid()
    )
);

-- Assessments & Scores Policies
CREATE POLICY "Teachers can manage assessments for their classes"
ON public.assessments FOR ALL
USING (
    public.is_admin_or_coordinator() OR
    EXISTS (
        SELECT 1 FROM public.classes c
        WHERE c.id = assessments.class_id
        AND c.class_teacher_id = auth.uid()
    )
);

CREATE POLICY "Teachers can manage assessment scores for their classes"
ON public.assessment_scores FOR ALL
USING (
    public.is_admin_or_coordinator() OR
    EXISTS (
        SELECT 1 FROM public.assessments a
        JOIN public.classes c ON c.id = a.class_id
        WHERE a.id = assessment_scores.assessment_id
        AND c.class_teacher_id = auth.uid()
    )
);

-- Observations (Teacher creates/views; Admin reviews/approves)
CREATE POLICY "Teachers can view observations for their classes"
ON public.observations FOR SELECT
USING (
    teacher_id = auth.uid() OR
    public.is_admin_or_coordinator()
);

CREATE POLICY "Teachers can insert observations for their classes"
ON public.observations FOR INSERT
WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.classes c
        WHERE c.id = observations.class_id
        AND c.class_teacher_id = auth.uid()
    )
);

CREATE POLICY "Admins can update observation status and feedback"
ON public.observations FOR UPDATE
USING (public.is_admin_or_coordinator());

-- Report Exports Policies
CREATE POLICY "Teachers can manage their own report exports"
ON public.report_exports FOR ALL
USING (teacher_id = auth.uid() OR public.is_admin_or_coordinator());


-- ============================================================================
-- 4. DETERMINISTIC ATTENTION QUEUE VIEWS
-- ============================================================================

-- Teacher's Attention Queue View (Computes Red / Amber priority on the fly)
CREATE OR REPLACE VIEW public.v_teacher_attention_queue AS
WITH student_missing_hw AS (
    -- Count missing homework in the last 7 days
    SELECT
        sub.student_id,
        asg.class_id,
        COUNT(*) AS recent_missing_count
    FROM public.submissions sub
    JOIN public.assignments asg ON asg.id = sub.assignment_id
    WHERE sub.status IN ('missing', 'incomplete')
      AND asg.due_date >= (CURRENT_DATE - INTERVAL '14 days')
    GROUP BY sub.student_id, asg.class_id
),
active_flags AS (
    -- Count open flags
    SELECT
        obs.student_id,
        obs.class_id,
        COUNT(CASE WHEN obs.severity = 'red' AND obs.admin_status = 'pending_review' THEN 1 END) AS red_flags,
        COUNT(CASE WHEN obs.severity = 'amber' AND obs.admin_status = 'pending_review' THEN 1 END) AS amber_flags,
        MAX(obs.suggested_admin_action) AS latest_suggested_action,
        MAX(obs.teacher_note) AS latest_teacher_note
    FROM public.observations obs
    WHERE obs.admin_status = 'pending_review'
    GROUP BY obs.student_id, obs.class_id
)
SELECT
    s.id AS student_id,
    s.admission_number,
    s.roll_number,
    s.first_name || ' ' || s.last_name AS student_name,
    c.id AS class_id,
    c.name AS class_name,
    c.subject,
    c.class_teacher_id,
    COALESCE(m.recent_missing_count, 0) AS recent_missing_hw_count,
    COALESCE(f.red_flags, 0) AS pending_red_flags,
    COALESCE(f.amber_flags, 0) AS pending_amber_flags,
    f.latest_suggested_action,
    f.latest_teacher_note,
    CASE
        WHEN COALESCE(f.red_flags, 0) > 0 OR COALESCE(m.recent_missing_count, 0) >= 2 THEN 'HIGH_PRIORITY_RED'
        WHEN COALESCE(f.amber_flags, 0) > 0 OR COALESCE(m.recent_missing_count, 0) = 1 THEN 'MEDIUM_PRIORITY_AMBER'
        ELSE 'ON_TRACK_GREEN'
    END AS urgency_level
FROM public.enrollments e
JOIN public.students s ON s.id = e.student_id
JOIN public.classes c ON c.id = e.class_id
LEFT JOIN student_missing_hw m ON m.student_id = s.id AND m.class_id = c.id
LEFT JOIN active_flags f ON f.student_id = s.id AND f.class_id = c.id
WHERE (COALESCE(f.red_flags, 0) > 0 OR COALESCE(f.amber_flags, 0) > 0 OR COALESCE(m.recent_missing_count, 0) > 0);


-- ============================================================================
-- 5. REPORTING FUNCTIONS (INDIVIDUAL PTM & CLASS-WIDE CONSOLIDATED LEDGER)
-- ============================================================================

-- 5.1 Individual Student PTM Report Aggregation (Daily, Weekly, Monthly)
CREATE OR REPLACE FUNCTION public.fn_student_ptm_report(
    p_student_id UUID,
    p_class_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'student', (
            SELECT json_build_object(
                'id', s.id,
                'admission_number', s.admission_number,
                'roll_number', s.roll_number,
                'full_name', s.first_name || ' ' || s.last_name,
                'father_name', s.father_name,
                'mother_name', s.mother_name,
                'contact', s.primary_contact
            )
            FROM public.students s WHERE s.id = p_student_id
        ),
        'class', (
            SELECT json_build_object(
                'id', c.id,
                'name', c.name,
                'grade_level', c.grade_level,
                'section', c.section,
                'subject', c.subject,
                'school_name', st.school_name,
                'teacher_name', st.full_name
            )
            FROM public.classes c
            JOIN public.staff st ON st.id = c.class_teacher_id
            WHERE c.id = p_class_id
        ),
        'period', json_build_object('start_date', p_start_date, 'end_date', p_end_date),
        'homework_stats', (
            SELECT json_build_object(
                'total_assigned', COUNT(asg.id),
                'submitted', COUNT(CASE WHEN sub.status = 'submitted' THEN 1 END),
                'missing', COUNT(CASE WHEN sub.status = 'missing' THEN 1 END),
                'incomplete', COUNT(CASE WHEN sub.status = 'incomplete' THEN 1 END),
                'absent', COUNT(CASE WHEN sub.status = 'absent' THEN 1 END),
                'completion_pct', ROUND(COUNT(CASE WHEN sub.status = 'submitted' THEN 1 END)::NUMERIC / NULLIF(COUNT(asg.id), 0) * 100, 1)
            )
            FROM public.assignments asg
            LEFT JOIN public.submissions sub ON sub.assignment_id = asg.id AND sub.student_id = p_student_id
            WHERE asg.class_id = p_class_id
              AND asg.due_date BETWEEN p_start_date AND p_end_date
        ),
        'assessments', (
            SELECT COALESCE(json_agg(json_build_object(
                'title', a.title,
                'date', a.assessment_date,
                'max_marks', a.max_marks,
                'marks_obtained', sc.marks_obtained,
                'is_absent', sc.is_absent,
                'percentage', ROUND(sc.marks_obtained / NULLIF(a.max_marks, 0) * 100, 1)
            )), '[]'::json)
            FROM public.assessments a
            LEFT JOIN public.assessment_scores sc ON sc.assessment_id = a.id AND sc.student_id = p_student_id
            WHERE a.class_id = p_class_id
              AND a.assessment_date BETWEEN p_start_date AND p_end_date
        ),
        'observations', (
            SELECT COALESCE(json_agg(json_build_object(
                'category', obs.category,
                'severity', obs.severity,
                'note', obs.teacher_note,
                'suggested_action', obs.suggested_admin_action,
                'admin_status', obs.admin_status,
                'admin_feedback', obs.admin_feedback,
                'date', obs.created_at::DATE
            )), '[]'::json)
            FROM public.observations obs
            WHERE obs.student_id = p_student_id
              AND obs.class_id = p_class_id
              AND obs.created_at::DATE BETWEEN p_start_date AND p_end_date
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5.2 Class-Wide Consolidated Ledger Report
CREATE OR REPLACE FUNCTION public.fn_class_consolidated_report(
    p_class_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    roll_number INT,
    admission_number TEXT,
    student_name TEXT,
    primary_contact TEXT,
    total_hw_assigned BIGINT,
    hw_submitted BIGINT,
    hw_completion_pct NUMERIC,
    avg_test_pct NUMERIC,
    red_flag_count BIGINT,
    amber_flag_count BIGINT,
    intervention_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.roll_number,
        s.admission_number,
        (s.first_name || ' ' || s.last_name)::TEXT AS student_name,
        s.primary_contact,
        COUNT(DISTINCT asg.id) AS total_hw_assigned,
        COUNT(DISTINCT CASE WHEN sub.status = 'submitted' THEN sub.id END) AS hw_submitted,
        ROUND(
            COUNT(DISTINCT CASE WHEN sub.status = 'submitted' THEN sub.id END)::NUMERIC /
            NULLIF(COUNT(DISTINCT asg.id), 0) * 100, 1
        ) AS hw_completion_pct,
        ROUND(
            COALESCE(AVG(sc.marks_obtained / NULLIF(a.max_marks, 0) * 100), 0)::NUMERIC, 1
        ) AS avg_test_pct,
        COUNT(DISTINCT CASE WHEN obs.severity = 'red' THEN obs.id END) AS red_flag_count,
        COUNT(DISTINCT CASE WHEN obs.severity = 'amber' THEN obs.id END) AS amber_flag_count,
        CASE
            WHEN COUNT(DISTINCT CASE WHEN obs.severity = 'red' THEN obs.id END) > 0 OR
                 (COUNT(DISTINCT asg.id) - COUNT(DISTINCT CASE WHEN sub.status = 'submitted' THEN sub.id END)) >= 2
            THEN 'High Attention'
            WHEN COUNT(DISTINCT CASE WHEN obs.severity = 'amber' THEN obs.id END) > 0 OR
                 (COUNT(DISTINCT asg.id) - COUNT(DISTINCT CASE WHEN sub.status = 'submitted' THEN sub.id END)) = 1
            THEN 'Monitor'
            ELSE 'On Track'
        END AS intervention_status
    FROM public.enrollments e
    JOIN public.students s ON s.id = e.student_id
    LEFT JOIN public.assignments asg ON asg.class_id = e.class_id AND asg.due_date BETWEEN p_start_date AND p_end_date
    LEFT JOIN public.submissions sub ON sub.assignment_id = asg.id AND sub.student_id = s.id
    LEFT JOIN public.assessments a ON a.class_id = e.class_id AND a.assessment_date BETWEEN p_start_date AND p_end_date
    LEFT JOIN public.assessment_scores sc ON sc.assessment_id = a.id AND sc.student_id = s.id
    LEFT JOIN public.observations obs ON obs.student_id = s.id AND obs.class_id = e.class_id AND obs.created_at::DATE BETWEEN p_start_date AND p_end_date
    WHERE e.class_id = p_class_id
    GROUP BY s.id, s.roll_number, s.admission_number, s.first_name, s.last_name, s.primary_contact
    ORDER BY s.roll_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
