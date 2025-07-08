import { createServerSupabaseClient } from "@/lib/supabase"

export async function enrollUserInCourse(userId: string, courseId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("user_courses")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected if not enrolled
      throw checkError
    }

    // If already enrolled, return the existing enrollment
    if (existingEnrollment) {
      return { success: true, message: "Already enrolled", id: existingEnrollment.id }
    }

    // Get course details to set up modules
    const { data: course, error: courseError } = await supabase
      .from("certifications")
      .select("*")
      .eq("id", courseId)
      .single()

    if (courseError) throw courseError

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("user_courses")
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        status: "not_started",
        // Set completion date to 3 months from now by default
        completion_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (enrollError) throw enrollError

    // Create default modules based on course category
    // This is a simplified example - in a real app, you'd have a more sophisticated way to define modules
    const defaultModules = getDefaultModules(course.category)

    // Insert modules
    const moduleInserts = defaultModules.map((module, index) => ({
      user_id: userId,
      course_id: courseId,
      module_title: module,
      module_order: index + 1,
      is_completed: false,
    }))

    const { error: modulesError } = await supabase.from("user_modules").insert(moduleInserts)

    if (modulesError) throw modulesError

    return { success: true, message: "Successfully enrolled", id: enrollment.id }
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return { success: false, message: error.message || "Failed to enroll in course" }
  }
}

// Helper function to get default modules based on course category
function getDefaultModules(category: string): string[] {
  // This is a simplified example - in a real app, you'd have a more sophisticated way to define modules
  const modulesByCategory = {
    cruise: [
      "Introduction to Cruise Ship Operations",
      "Guest Relations Management",
      "Service Standards and Protocols",
      "Crisis Management",
      "Team Leadership and Management",
      "Quality Assurance and Feedback Systems",
    ],
    business: [
      "Business Fundamentals",
      "Strategic Planning",
      "Financial Management",
      "Marketing and Sales",
      "Operations Management",
      "Leadership and Team Building",
    ],
    it: [
      "IT Fundamentals",
      "Programming Basics",
      "Database Management",
      "Network Security",
      "Cloud Computing",
      "IT Project Management",
    ],
    // Add more categories as needed
    default: [
      "Module 1: Introduction",
      "Module 2: Core Concepts",
      "Module 3: Advanced Topics",
      "Module 4: Practical Applications",
      "Module 5: Assessment and Review",
    ],
  }

  return modulesByCategory[category] || modulesByCategory.default
}
