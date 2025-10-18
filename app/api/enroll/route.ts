import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { certificationId, userId } = await request.json()

    if (!certificationId || !userId) {
      return NextResponse.json({ error: "Certification ID and User ID are required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Check if already enrolled
    const { data: existing, error: existingError } = await supabase
      .from("user_enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("certification_id", certificationId)
      .maybeSingle()

    if (existingError) {
      console.error("Check existing enrollment error:", existingError)
    }

    if (existing) {
      return NextResponse.json({ error: "Already enrolled in this certification" }, { status: 409 })
    }

    // Get certification details
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("id, title, description, price")
      .eq("id", certificationId)
      .maybeSingle()

    if (certError || !certification) {
      console.error("Certification fetch error:", certError)
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    // Get user profile for name
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name, email")
      .eq("user_id", userId)
      .maybeSingle()

    // Calculate due date (7 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    const enrollmentDate = new Date().toISOString()

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("user_enrollments")
      .insert({
        user_id: userId,
        certification_id: certificationId,
        status: "active",
        progress: 0,
        payment_status: "pending",
        due_date: dueDate.toISOString(),
      })
      .select()
      .single()

    if (enrollError) {
      console.error("Enrollment creation error:", enrollError)
      return NextResponse.json({ error: "Failed to create enrollment: " + enrollError.message }, { status: 500 })
    }

    // Get modules for this certification
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("certification_id", certificationId)
      .order("order_num")

    if (modulesError) {
      console.error("Modules fetch error:", modulesError)
    }

    // Create user_modules entries if modules exist
    if (modules && modules.length > 0) {
      const userModules = modules.map((module) => ({
        user_id: userId,
        module_id: module.id,
        is_completed: false,
      }))

      const { error: moduleInsertError } = await supabase.from("user_modules").insert(userModules)

      if (moduleInsertError) {
        console.error("User modules insert error:", moduleInsertError)
      }
    }

    // Send enrollment confirmation email
    try {
      const DST_TAX_RATE = 0.16
      const basePrice = certification.price || 0
      const dstTax = basePrice * DST_TAX_RATE
      const totalAmount = basePrice + dstTax

      const firstName = userProfile?.first_name || "Learner"
      const email = userProfile?.email || "unknown@example.com"

      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send-enrollment-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            email,
            courseName: certification.title,
            courseDescription: certification.description,
            basePrice,
            dstTax,
            totalAmount,
            dueDate: dueDate.toISOString(),
            enrollmentDate,
          }),
        },
      )

      if (!emailResponse.ok) {
        console.error("Failed to send enrollment email:", await emailResponse.text())
      }
    } catch (emailError) {
      console.error("Error sending enrollment email:", emailError)
      // Don't fail the enrollment if email fails
    }

    return NextResponse.json({
      success: true,
      enrollment,
      message: "Enrolled successfully and confirmation email sent",
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ error: "Internal server error: " + String(error) }, { status: 500 })
  }
}
