import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

export async function POST(request: Request) {
  try {
    const { certificationId, userId } = await request.json()

    if (!certificationId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("user_enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("certification_id", certificationId)
      .maybeSingle()

    if (checkError) {
      console.error("Check enrollment error:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this certification" }, { status: 409 })
    }

    // Get certification details
    const { data: certification, error: certError } = await supabase
      .from("certifications")
      .select("id, title, description, price")
      .eq("id", certificationId)
      .single()

    if (certError || !certification) {
      console.error("Certification error:", certError)
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    // Calculate due date (7 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

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
        certificate_issued: false,
      })
      .select()
      .single()

    if (enrollError) {
      console.error("Enrollment creation error:", enrollError)
      return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
    }

    // Get modules for this certification
    const { data: modules, error: moduleError } = await supabase
      .from("modules")
      .select("id")
      .eq("certification_id", certificationId)

    if (!moduleError && modules && modules.length > 0) {
      const userModuleData = modules.map((module) => ({
        user_id: userId,
        module_id: module.id,
        is_completed: false,
      }))

      await supabase.from("user_modules").insert(userModuleData)
    }

    // Get user profile for email
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("first_name, email")
      .eq("user_id", userId)
      .single()

    // Calculate billing info
    const DST_TAX_RATE = 0.16
    const basePrice = Number.parseFloat(certification.price?.toString() || "0")
    const dstTax = basePrice * DST_TAX_RATE
    const totalAmount = basePrice + dstTax

    return NextResponse.json({
      success: true,
      enrollment,
      billing: {
        basePrice,
        dstTax,
        totalAmount,
        dueDate: dueDate.toISOString(),
      },
      message: "Successfully enrolled in certification",
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
