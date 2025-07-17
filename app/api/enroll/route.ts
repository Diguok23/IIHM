import { createServerSupabaseClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { certificationId } = await request.json()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has an approved application for this certification
    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("*")
      .eq("email", user.email)
      .eq("program_name", certificationId) // This should match certification title
      .eq("status", "approved")
      .single()

    if (applicationError || !application) {
      return NextResponse.json(
        { error: "You must have an approved application to enroll in this course" },
        { status: 403 },
      )
    }

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from("user_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("certification_id", certificationId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 })
    }

    // Create enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("user_enrollments")
      .insert({
        user_id: user.id,
        certification_id: certificationId,
        status: "active",
        progress: 0,
      })
      .select()
      .single()

    if (enrollmentError) {
      console.error("Enrollment error:", enrollmentError)
      return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
    }

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
